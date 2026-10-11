export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}
export interface TokenStore {
  read(): Promise<string | null>;
  write(token: string): Promise<void>;
  clear(): Promise<void>;
}
export interface RequestOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
  public?: boolean;
  expectedToken?: string;
}
export interface HttpClient {
  request<T>(path: string, options?: RequestOptions): Promise<T>;
}
export function createHttpClient(
  baseUrl: string,
  tokens: TokenStore,
  expired: () => void,
  fetcher: typeof fetch = fetch,
): HttpClient {
  return {
    async request<T>(path: string, opts: RequestOptions = {}) {
      const controller = new AbortController();
      const abort = () => controller.abort();
      opts.signal?.addEventListener("abort", abort, { once: true });
      if (opts.signal?.aborted) controller.abort();
      const timeout = setTimeout(abort, 15000);
      try {
        const token = opts.public ? null : await tokens.read();
        if (opts.expectedToken !== undefined && token !== opts.expectedToken)
          throw new ApiError("La session a change. Reconnectez-vous.", 401);
        const response = await fetcher(
          `${baseUrl.replace(/\/$/, "")}/${path}`,
          {
            method: opts.method ?? "GET",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            ...(opts.body !== undefined
              ? { body: JSON.stringify(opts.body) }
              : {}),
          },
        );
        if (
          response.status === 401 &&
          token &&
          (await tokens.read()) === token
        ) {
          await tokens.clear();
          expired();
        }
        if (response.status === 204) return undefined as T;
        const result = await response.json();
        if (!response.ok)
          throw new ApiError(
            Array.isArray(result.message)
              ? result.message.join("\n")
              : (result.message ?? "API error"),
            response.status,
          );
        return result as T;
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(
          "Connexion impossible. Vérifiez votre réseau et l’adresse du serveur.",
          0,
        );
      } finally {
        clearTimeout(timeout);
        opts.signal?.removeEventListener("abort", abort);
      }
    },
  };
}
