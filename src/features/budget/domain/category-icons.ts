export const categoryIcons = {
  tag: "\uD83C\uDFF7\uFE0F",
  paw: "\uD83D\uDC3E",
  home: "\uD83C\uDFE0",
  food: "\uD83D\uDED2",
  car: "\uD83D\uDE97",
  heart: "\u2764\uFE0F",
  book: "\uD83D\uDCDA",
  gift: "\uD83C\uDF81",
  wallet: "\uD83D\uDCBC",
  plane: "\u2708\uFE0F",
} as const;
export function categoryIcon(icon?: string) {
  return categoryIcons[icon as keyof typeof categoryIcons] ?? categoryIcons.tag;
}
