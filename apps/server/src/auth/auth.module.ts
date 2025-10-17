import { DynamicModule, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { MailModule } from "../mail/mail.module";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { LocalStrategy } from "./strategy/local.strategy";
import { RefreshStrategy } from "./strategy/refresh.strategy";

@Module({})
export class AuthModule {
  static register(): DynamicModule {
    return {
      module: AuthModule,
      imports: [PassportModule, JwtModule, UserModule, MailModule],
      controllers: [AuthController],
      providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        RefreshStrategy,
      ],
      exports: [AuthService],
    };
  }
}
