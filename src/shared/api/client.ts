export async function accountRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api/account/${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
    cache: "no-store",
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message ?? "Impossible de terminer l’opération.");
  }
  if (init.method && init.method !== "GET" && typeof window !== "undefined")
    window.dispatchEvent(new Event("account-updated"));
  return response.status === 204 ? (undefined as T) : response.json();
}
