import { registerDecorator } from "class-validator";

// IsOptional treats null as absent. PATCH inputs must permit undefined only:
// null must not erase domain fields or bypass their validators.
export function IsMoney(allowZero = false): PropertyDecorator {
  return (target, propertyKey) =>
    registerDecorator({
      name: "isMoney",
      target: target.constructor,
      propertyName: String(propertyKey),
      constraints: [],
      options: { message: "Montant invalide : deux décimales maximum" },
      validator: {
        validate: (value: unknown) =>
          typeof value === "number" &&
          Number.isFinite(value) &&
          Number.isSafeInteger(Math.round(value * 100)) &&
          (allowZero ? value >= 0 : value > 0) &&
          Math.abs(value * 100 - Math.round(value * 100)) < 0.000001,
      },
    });
}
