import type { User } from "../domain/user";

export interface UserRepository {
  findByEmail(email: string): User | undefined;
  findById(id: string): User | undefined;
  create(user: User): void;
}
export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, encoded: string): Promise<boolean>;
}
export interface TokenIssuer {
  issue(userId: string): Promise<string>;
}
