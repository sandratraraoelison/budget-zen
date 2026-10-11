import currencies from "./currencies.json";

// A bundled catalog also works on Hermes without Intl.DisplayNames or supportedValuesOf.
export function currencyOptions(language: "fr" | "en", current?: string) {
  const options = currencies.map(currency => ({
    code: currency.code,
    name: currency[language],
  }));
  if (current && !options.some(option => option.code === current)) {
    options.unshift({ code: current, name: current });
  }
  return options;
}
