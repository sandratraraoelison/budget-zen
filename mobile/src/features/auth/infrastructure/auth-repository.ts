import type { HttpClient } from "../../../shared/api/client";
import type { AuthRepository, Session, User } from "../domain/auth";
export function createAuthRepository(http: HttpClient): AuthRepository {
  return {
    authenticate: (mode, input) =>
      http.request<Session>(`auth/${mode}`, {
        method: "POST",
        body: {
          email: input.email.trim(),
          password: input.password,
          ...(mode === "register" ? { name: input.name?.trim() } : {}),
        },
        public: true,
      }),
    currentUser: () => http.request<User>("auth/me"),
  };
}
