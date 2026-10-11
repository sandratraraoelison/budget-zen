export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  isDemo: boolean;
  createdAt: string;
}

export type PublicUser = Omit<User, "passwordHash">;
export function publicUser({
  passwordHash: _passwordHash,
  ...user
}: User): PublicUser {
  return user;
}
