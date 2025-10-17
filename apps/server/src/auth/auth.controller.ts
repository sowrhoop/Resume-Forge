import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  authResponseSchema,
  ForgotPasswordDto,
  messageSchema,
  RegisterDto,
  ResetPasswordDto,
  UpdatePasswordDto,
  UserWithSecrets,
} from "@reactive-resume/dto";
import { ErrorMessage } from "@reactive-resume/utils";
import type { Response } from "express";

import { User } from "../user/decorators/user.decorator";
import { AuthService } from "./auth.service";
import { LocalGuard } from "./guards/local.guard";
import { RefreshGuard } from "./guards/refresh.guard";
import { JwtGuard } from "./guards/jwt.guard";
import { getCookieOptions } from "./utils/cookie";
import { payloadSchema } from "./utils/payload";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private async exchangeToken(id: string, email: string) {
    try {
      const payload = payloadSchema.parse({ id });

      const accessToken = this.authService.generateToken("access", payload);
      const refreshToken = this.authService.generateToken("refresh", payload);

      // Set Refresh Token in Database
      await this.authService.setRefreshToken(email, refreshToken);

      return { accessToken, refreshToken };
    } catch (error) {
      throw new InternalServerErrorException(error, ErrorMessage.SomethingWentWrong);
    }
  }

  private async handleAuthenticationResponse(user: UserWithSecrets, response: Response) {
    const { accessToken, refreshToken } = await this.exchangeToken(user.id, user.email);

    response.cookie("Authentication", accessToken, getCookieOptions("access"));
    response.cookie("Refresh", refreshToken, getCookieOptions("refresh"));

    const responseData = authResponseSchema.parse({ status: "authenticated", user });

    response.status(200).send(responseData);
  }

  @Post("register")
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.register(registerDto);

    return this.handleAuthenticationResponse(user, response);
  }

  @Post("login")
  @UseGuards(LocalGuard)
  async login(@User() user: UserWithSecrets, @Res({ passthrough: true }) response: Response) {
    return this.handleAuthenticationResponse(user, response);
  }

  @Post("refresh")
  @UseGuards(RefreshGuard)
  async refresh(@User() user: UserWithSecrets, @Res({ passthrough: true }) response: Response) {
    return this.handleAuthenticationResponse(user, response);
  }

  @Patch("password")
  @UseGuards(JwtGuard)
  async updatePassword(
    @User("email") email: string,
    @Body() { currentPassword, newPassword }: UpdatePasswordDto,
  ) {
    await this.authService.updatePassword(email, currentPassword, newPassword);

    return { message: "Your password has been successfully updated." };
  }

  @Post("logout")
  @UseGuards(JwtGuard)
  async logout(@User() user: UserWithSecrets, @Res({ passthrough: true }) response: Response) {
    await this.authService.setRefreshToken(user.email, null);

    response.clearCookie("Authentication");
    response.clearCookie("Refresh");

    const data = messageSchema.parse({ message: "You have been logged out, tschüss!" });
    response.status(200).send(data);
  }

  // Password Recovery Flows
  @ApiTags("Password Reset")
  @HttpCode(200)
  @Post("forgot-password")
  async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    try {
      await this.authService.forgotPassword(email);
    } catch {
      // pass
    }

    return {
      message:
        "A password reset link should have been sent to your inbox, if an account existed with the email you provided.",
    };
  }

  @ApiTags("Password Reset")
  @HttpCode(200)
  @Post("reset-password")
  async resetPassword(@Body() { token, password }: ResetPasswordDto) {
    try {
      await this.authService.resetPassword(token, password);

      return { message: "Your password has been successfully reset." };
    } catch {
      throw new BadRequestException(ErrorMessage.InvalidResetToken);
    }
  }

}
