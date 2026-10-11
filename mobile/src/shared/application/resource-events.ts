const listeners = new Set<() => void>();
export function notifyResourcesChanged() {
  for (const listener of listeners) listener();
}
export function subscribeResourceChanges(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
