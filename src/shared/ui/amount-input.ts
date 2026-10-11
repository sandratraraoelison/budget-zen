export function normalizeAmountInput(value: string): string {
  return value.replace(/\s/g, "").replace(",", ".");
}
export function formatAmountInput(value: string, locale: string): string {
  const raw = normalizeAmountInput(value);
  const [integer, decimals] = raw.split(".");
  return integer.replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f") + (decimals === undefined ? "" : (locale.startsWith("fr") ? "," : ".") + decimals);
}
