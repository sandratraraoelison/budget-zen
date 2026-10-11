import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SqliteUserRepository } from "../infrastructure/sqlite-user.repository";
import type { AuthenticatedRequest } from "./current-user";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly users: SqliteUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const parts = request.headers.authorization?.split(" ");
    if (parts?.[0] !== "Bearer" || !parts[1] || parts.length !== 2)
      throw new UnauthorizedException();
    try {
      const claims = await this.jwt.verifyAsync<{ sub: string }>(parts[1]);
      if (typeof claims.sub !== "string" || !this.users.findById(claims.sub))
        throw new Error("Invalid subject");
      request.userId = claims.sub;
      return true;
    } catch {
      throw new UnauthorizedException("Session invalide ou expirée");
    }
  }
}
