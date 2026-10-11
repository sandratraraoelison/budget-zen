import { DomainError, required } from "../../../shared/domain/errors";
import type { Runtime } from "../../../shared/application/state-repository";
import type { PasswordHasher, TokenIssuer, UserRepository } from "./ports";
import { publicUser, type User } from "../domain/user";

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordHasher,
    private readonly tokens: TokenIssuer,
    private readonly runtime: Runtime,
    private readonly demoEnabled: boolean,
  ) {}

  async register(input: { email: string; name: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    if (this.users.findByEmail(email))
      throw new DomainError("CONFLICT", "Adresse email déjà utilisée");
    const user: User = {
      id: this.runtime.id(),
      email,
      name: input.name.trim(),
      passwordHash: await this.passwords.hash(input.password),
      isDemo: false,
      createdAt: this.runtime.now().toISOString(),
    };
    this.users.create(user);
    return {
      accessToken: await this.tokens.issue(user.id),
      user: publicUser(user),
    };
  }

  async login(input: { email: string; password: string }) {
    const user = this.users.findByEmail(input.email.trim().toLowerCase());
    // Always perform the password KDF, even for unknown addresses.
    const valid = await this.passwords.verify(
      input.password,
      user?.passwordHash ?? "",
    );
    if (!user || !valid)
      throw new DomainError("UNAUTHORIZED", "Identifiants invalides");
    return {
      accessToken: await this.tokens.issue(user.id),
      user: publicUser(user),
    };
  }

  me(id: string) {
    return publicUser(required(this.users.findById(id)));
  }

  async demo() {
    if (!this.demoEnabled)
      throw new DomainError("NOT_FOUND", "Mode démo désactivé");
    const id = this.runtime.id();
    const user: User = {
      id,
      email: `demo-${id}@budgetzen.invalid`,
      name: "Démo",
      passwordHash: await this.passwords.hash(this.runtime.id()),
      isDemo: true,
      createdAt: this.runtime.now().toISOString(),
    };
    this.users.create(user);
    return { accessToken: await this.tokens.issue(id), user: publicUser(user) };
  }
}
