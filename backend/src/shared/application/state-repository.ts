// mutate executes synchronously within a database transaction. Implementations
// must roll back when the callback throws and return detached state from read.
export interface StateRepository<State> {
  read(userId: string): State;
  mutate<Result>(userId: string, change: (state: State) => Result): Result;
}

export interface Runtime {
  id(): string;
  now(): Date;
}
