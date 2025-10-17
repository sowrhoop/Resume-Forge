import { randomBytes } from "node:crypto";

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { LoginDto, RegisterDto, UserWithSecrets } from "@reactive-resume/dto";
import { ErrorMessage } from "@reactive-resume/utils";
import * as bcryptjs from "bcryptjs";

import { Config } from "../config/schema";
import { MailService } from "../mail/mail.service";
import { UserService } from "../user/user.service";
import { Payload } from "./utils/payload";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  private hash(password: string): Promise<string> {
    return bcryptjs.hash(password, 10);
  }

  private compare(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
  }

  private async validatePassword(password: string, hashedPassword: string) {
    const isValid = await this.compare(password, hashedPassword);

    if (!isValid) {
      throw new BadRequestException(ErrorMessage.InvalidCredentials);
    }
  }

  generateToken(grantType: "access" | "refresh" | "reset", payload?: Payload) {
    switch (grantType) {
      case "access": {
        if (!payload) throw new InternalServerErrorException("InvalidTokenPayload");
        return this.jwtService.sign(payload, {
          secret: this.configService.getOrThrow("ACCESS_TOKEN_SECRET"),
          expiresIn: "15m", // 15 minutes
        });
      }

      case "refresh": {
        if (!payload) throw new InternalServerErrorException("InvalidTokenPayload");
        return this.jwtService.sign(payload, {
          secret: this.configService.getOrThrow("REFRESH_TOKEN_SECRET"),
          expiresIn: "2d", // 2 days
        });
      }

      case "reset": {
        return randomBytes(32).toString("base64url");
      }
    }
  }

  async setLastSignedIn(email: string) {
    await this.userService.updateByEmail(email, {
      secrets: { update: { lastSignedIn: new Date() } },
    });
  }

  async setRefreshToken(email: string, token: string | null) {
    await this.userService.updateByEmail(email, {
      secrets: {
        update: {
          refreshToken: token,
          lastSignedIn: token ? new Date() : undefined,
        },
      },
    });
  }

  async validateRefreshToken(payload: Payload, token: string) {
    const user = await this.userService.findOneById(payload.id);
    const storedRefreshToken = user.secrets?.refreshToken;

    if (!storedRefreshToken || storedRefreshToken !== token) throw new ForbiddenException();

    return user;
  }

  async register(registerDto: RegisterDto): Promise<UserWithSecrets> {
    const hashedPassword = await this.hash(registerDto.password);

    try {
      const user = await this.userService.create({
        name: registerDto.name,
        email: registerDto.email,
        username: registerDto.username,
        locale: registerDto.locale,
        provider: "email",
        secrets: { create: { password: hashedPassword } },
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        throw new BadRequestException(ErrorMessage.UserAlreadyExists);
      }

      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async authenticate({ identifier, password }: LoginDto) {
    try {
      const user = await this.userService.findOneByIdentifierOrThrow(identifier);

      if (!user.secrets?.password) {
        throw new BadRequestException(ErrorMessage.OAuthUser);
      }

      await this.validatePassword(password, user.secrets.password);
      await this.setLastSignedIn(user.email);

      return user;
    } catch {
      throw new BadRequestException(ErrorMessage.InvalidCredentials);
    }
  }

  // Password Reset Flows
  async forgotPassword(email: string) {
    const token = this.generateToken("reset");

    await this.userService.updateByEmail(email, {
      secrets: { update: { resetToken: token } },
    });

    const baseUrl = this.configService.get("PUBLIC_URL");
    const url = `${baseUrl}/auth/reset-password?token=${token}`;
    const subject = "Reset your Reactive Resume password";
    const text = `Please click on the link below to reset your password:\n\n${url}`;

    await this.mailService.sendEmail({ to: email, subject, text });
  }

  async updatePassword(email: string, currentPassword: string, newPassword: string) {
    const user = await this.userService.findOneByIdentifierOrThrow(email);

    if (!user.secrets?.password) {
      throw new BadRequestException(ErrorMessage.OAuthUser);
    }

    await this.validatePassword(currentPassword, user.secrets.password);

    const newHashedPassword = await this.hash(newPassword);

    await this.userService.updateByEmail(email, {
      secrets: { update: { password: newHashedPassword } },
    });
  }

  async resetPassword(token: string, password: string) {
    const hashedPassword = await this.hash(password);

    await this.userService.updateByResetToken(token, {
      resetToken: null,
      password: hashedPassword,
    });
  }

}
