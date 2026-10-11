export function requiredText(value: string, label: string, maximum = 100) {
  const text = value.trim();
  if (!text || text.length > maximum)
    throw new Error(`${label}: champ requis / required (max. ${maximum}).`);
  return text;
}
export function calendarDate(value: string, label: string, optional = false) {
  if (!value.trim() && optional) return undefined;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value
  )
    throw new Error(
      `${label}: date invalide / invalid date (AAAA-MM-JJ / YYYY-MM-DD).`,
    );
  return value;
}
export function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
