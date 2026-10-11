import type {
  Runtime,
  StateRepository,
} from "../../../shared/application/state-repository";
import { required } from "../../../shared/domain/errors";
import { toMinor } from "../../../shared/domain/money";
import { validateDateRange } from "../../../shared/domain/dates";
import type { BusinessInput, BusinessState, TimeRange } from "../domain/models";
import {
  businessAnalytics,
  businessTransactionView,
} from "../domain/analytics";

export class BusinessService {
  constructor(
    private readonly repository: StateRepository<BusinessState>,
    private readonly runtime: Runtime,
  ) {}
  list(user: string) {
    return this.repository.read(user).transactions.map(businessTransactionView);
  }
  analytics(user: string, range: TimeRange, date?: string) {
    if (date) validateDateRange(date);
    return businessAnalytics(
      this.repository.read(user).transactions,
      range,
      date ? new Date(date) : this.runtime.now(),
    );
  }
  create(user: string, input: BusinessInput) {
    validateDateRange(input.date);
    return this.repository.mutate(user, (state) => {
      const transaction = {
        id: this.runtime.id(),
        type: input.type,
        amountMinor: toMinor(input.amount),
        date: input.date,
        category: input.category,
        description: input.description,
      };
      state.transactions.unshift(transaction);
      return businessTransactionView(transaction);
    });
  }
  update(user: string, id: string, input: Partial<BusinessInput>) {
    return this.repository.mutate(user, (state) => {
      const transaction = required(state.transactions.find((t) => t.id === id));
      if (input.type !== undefined) transaction.type = input.type;
      if (input.amount !== undefined)
        transaction.amountMinor = toMinor(input.amount);
      if (input.date !== undefined) {
        validateDateRange(input.date);
        transaction.date = input.date;
      }
      if (input.category !== undefined) transaction.category = input.category;
      if (input.description !== undefined)
        transaction.description = input.description;
      return businessTransactionView(transaction);
    });
  }
  remove(user: string, id: string) {
    this.repository.mutate(user, (state) => {
      required(state.transactions.find((t) => t.id === id));
      state.transactions = state.transactions.filter((t) => t.id !== id);
    });
  }
}
