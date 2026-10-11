import type { StateRepository } from "../../../shared/application/state-repository";
import { validateCurrency, type Settings } from "../domain/settings";

export class SettingsService {
  constructor(private readonly repository: StateRepository<Settings>) {}
  get(user: string) {
    return this.repository.read(user);
  }
  update(user: string, currency: string) {
    validateCurrency(currency);
    return this.repository.mutate(user, (state) => {
      state.currency = currency;
      return { ...state };
    });
  }
}
