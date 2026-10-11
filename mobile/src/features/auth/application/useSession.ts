import { useCallback, useEffect, useState } from "react";
import { ApiError, type TokenStore } from "../../../shared/api/client";
import type {
  AuthMode,
  AuthRepository,
  Credentials,
  User,
} from "../domain/auth";
export function useSession(repository: AuthRepository, tokens: TokenStore) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const restore = useCallback(async () => {
    try {
      const token = await tokens.read();
      setLoading(true);
      setError("");
      if (token) setUser(await repository.currentUser());
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await tokens.clear();
        setUser(null);
      } else setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [repository, tokens]);
  // Restore resolves asynchronous SecureStore/network operations, rather than deriving state from props.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void restore();
  }, [restore]);
  async function authenticate(mode: AuthMode, input: Credentials) {
    const session = await repository.authenticate(mode, input);
    if (!session.accessToken || !session.user?.id)
      throw new Error("Réponse du serveur invalide.");
    await tokens.write(session.accessToken);
    setUser(session.user);
  }
  async function logout() {
    await tokens.clear();
    setUser(null);
  }
  const expire = useCallback(() => setUser(null), []);
  return { user, loading, error, restore, authenticate, logout, expire };
}
