export type Notice = { kind: "success" | "error" | "info"; message: string };
const listeners = new Set<(notice: Notice) => void>();

export function notify(message: string, kind: Notice["kind"] = "success") {
  listeners.forEach(listener => listener({ message, kind }));
}

export function subscribeNotifications(listener: (notice: Notice) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
