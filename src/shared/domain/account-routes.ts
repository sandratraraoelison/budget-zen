export function isAllowedAccountRoute(path: string, method: string): boolean {
  const methods: Record<string, string[]> = {
    settings: ["GET", "PATCH"],
    "budget/summary": ["GET"],
    "categories/order": ["PATCH"],
    ...Object.fromEntries(
      [
        "salaire",
        "loyer",
        "nourriture",
        "transport",
        "santé",
        "loisirs",
        "éducation",
      ].map((category) => [`custom-categories/base:${category}`, ["DELETE"]]),
    ),
    ...Object.fromEntries(
      [
        "transactions",
        "budgets",
        "savings-goals",
        "custom-categories",
        "projects",
        "credits",
      ].map((path) => [path, ["GET", "POST"]]),
    ),
    "business/transactions": ["GET", "POST"],
    "business/analytics": ["GET"],
  };
  const allowed =
    methods[path] ??
    (/^(business\/transactions|transactions|budgets|savings-goals|custom-categories|projects|credits)\/[0-9a-f-]{36}$/i.test(
      path,
    )
      ? /^(projects|credits)\//.test(path)
        ? ["GET", "PATCH", "DELETE"]
        : ["PATCH", "DELETE"]
      : /^(projects|credits|custom-categories)\/[0-9a-f-]{36}\/(expenses|payments|transactions)$/i.test(
            path,
          )
        ? ["POST"]
        : /^(projects|credits|custom-categories)\/[0-9a-f-]{36}\/(expenses|payments|transactions)\/[0-9a-f-]{36}$/i.test(
              path,
            )
          ? ["DELETE"]
          : []);
  return allowed.includes(method);
}
