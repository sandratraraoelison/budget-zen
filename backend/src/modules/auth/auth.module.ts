import { Global, Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import type { Environment } from "../../config/environment";
import {
  ENVIRONMENT,
  RUNTIME,
} from "../../infrastructure/infrastructure.module";
import { SqliteDatabase } from "../../infrastructure/database/sqlite-database";
import type { Runtime } from "../../shared/application/state-repository";
import { AuthService } from "./application/auth.service";
import { SqliteUserRepository } from "./infrastructure/sqlite-user.repository";
import { ScryptPasswordHasher } from "./infrastructure/scrypt-password-hasher";
import { AuthController } from "./presentation/auth.controller";
import { JwtAuthGuard } from "./presentation/jwt-auth.guard";

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ENVIRONMENT],
      useFactory: (env: Environment) => ({
        secret: env.jwtSecret,
        signOptions: {
          expiresIn: env.tokenLifetime,
          issuer: "budgetzen",
          audience: "budgetzen-api",
          algorithm: "HS256",
        },
        verifyOptions: {
          issuer: "budgetzen",
          audience: "budgetzen-api",
          algorithms: ["HS256"],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: SqliteUserRepository,
      inject: [SqliteDatabase],
      useFactory: (database: SqliteDatabase) =>
        new SqliteUserRepository(database),
    },
    {
      provide: AuthService,
      inject: [SqliteUserRepository, JwtService, RUNTIME, ENVIRONMENT],
      useFactory: (
        users: SqliteUserRepository,
        jwt: JwtService,
        runtime: Runtime,
        env: Environment,
      ) =>
        new AuthService(
          users,
          new ScryptPasswordHasher(),
          { issue: (sub) => jwt.signAsync({ sub }) },
          runtime,
          env.demoEnabled,
        ),
    },
    JwtAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard, SqliteUserRepository, JwtModule],
})
export class AuthModule {}
