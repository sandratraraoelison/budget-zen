import { accountRequest } from "./client";
export interface Entity {
  id: string;
}
export interface CollectionConfig<T extends Entity> {
  path: string;
  body: (item: T) => object;
  createBody?: (item: T) => object;
  children?: {
    path: string;
    items: (item: T) => (Entity & Record<string, unknown>)[];
    body: (item: Entity & Record<string, unknown>) => object;
  };
}
/** Send individual commands: never replace another device's entire collection. */
export async function saveCollectionChanges<T extends Entity>(
  config: CollectionConfig<T>,
  previous: T[],
  next: T[],
) {
  for (const item of previous) {
    if (!next.some((n) => n.id === item.id))
      await accountRequest(`${config.path}/${item.id}`, { method: "DELETE" });
  }
  for (const item of next) {
    const before = previous.find((p) => p.id === item.id);
    let id = item.id;
    if (!before) {
      const created = await accountRequest<Entity>(config.path, {
        method: "POST",
        body: JSON.stringify((config.createBody ?? config.body)(item)),
      });
      id = created.id;
    } else if (
      JSON.stringify(config.body(before)) !== JSON.stringify(config.body(item))
    ) {
      const oldBody = config.body(before) as Record<string, unknown>;
      const changes = Object.fromEntries(
        Object.entries(config.body(item)).filter(
          ([key, value]) =>
            JSON.stringify(value) !== JSON.stringify(oldBody[key]),
        ),
      );
      await accountRequest(`${config.path}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
    }
    const children = config.children;
    if (!children) continue;
    const old = before ? children.items(before) : [];
    const updated = children.items(item);
    for (const child of old) {
      if (!updated.some((n) => n.id === child.id))
        await accountRequest(
          `${config.path}/${id}/${children.path}/${child.id}`,
          { method: "DELETE" },
        );
    }
    for (const child of updated) {
      if (!old.some((p) => p.id === child.id))
        await accountRequest(`${config.path}/${id}/${children.path}`, {
          method: "POST",
          body: JSON.stringify(children.body(child)),
        });
    }
  }
}
