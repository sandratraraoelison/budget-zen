import { registerDecorator } from "class-validator";
import { toMinor } from "../domain/money";

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
        validate: (value: unknown) => {
          if (typeof value !== "number") return false;
          try {
            toMinor(value, allowZero);
            return true;
          } catch {
            return false;
          }
        },
      },
    });
}
