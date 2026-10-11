import type { Runtime } from "../application/state-repository";
import { fromMinor } from "./money";

export interface FundingMovement {
  id: string;
  goalId: string;
  goalName: string;
  source: "savings" | "project";
  date: string;
  amountMinor: number;
  reason: "deposit" | "withdrawal" | "adjustment" | "release" | "opening";
}
export interface FundingJournal {
  fundingHistory?: FundingMovement[];
}

/** Positive amounts reserve cash; negative amounts release it. Never erase the journal. */
export function recordFunding(
  state: FundingJournal,
  runtime: Runtime,
  goal: { id: string; name: string },
  source: FundingMovement["source"],
  amountMinor: number,
  reason: FundingMovement["reason"],
) {
  if (!amountMinor) return;
  (state.fundingHistory ??= []).push({
    id: runtime.id(),
    goalId: goal.id,
    goalName: goal.name,
    source,
    date: runtime.now().toISOString(),
    amountMinor,
    reason,
  });
}

export function openingFunding(
  state: FundingJournal,
  runtime: Runtime,
  goal: { id: string; name: string },
  source: FundingMovement["source"],
  amountMinor: number,
) {
  if (!state.fundingHistory?.some((entry) => entry.goalId === goal.id))
    recordFunding(state, runtime, goal, source, amountMinor, "opening");
}

export const fundingView = ({ amountMinor, ...entry }: FundingMovement) => ({
  ...entry,
  amount: fromMinor(amountMinor),
});
