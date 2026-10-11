import { projectReservedMinor } from "../projects/domain/project";
import { emptyProjectsState } from "../projects/domain/models";
import { Module } from "@nestjs/common";
import { RUNTIME } from "../../infrastructure/infrastructure.module";
import { SqliteDatabase } from "../../infrastructure/database/sqlite-database";
import { SqliteStateRepository } from "../../infrastructure/database/sqlite-state-repository";
import type { Runtime } from "../../shared/application/state-repository";
import { BudgetService } from "./application/budget.service";
import { emptyBudgetState } from "./domain/models";
import { BudgetController } from "./presentation/budget.controller";
import { emptyCreditsState } from "../credits/domain/models";
import { creditCashBalance } from "../credits/domain/credit";
import { sumMinor } from "../../shared/domain/money";

@Module({
  controllers: [BudgetController],
  providers: [
    {
      provide: BudgetService,
      inject: [SqliteDatabase, RUNTIME],
      useFactory: (db: SqliteDatabase, runtime: Runtime) =>
        new BudgetService(
          new SqliteStateRepository(db, "budget", emptyBudgetState),
          runtime,
          (user) =>
            sumMinor(
              new SqliteStateRepository(db, "credits", emptyCreditsState)
                .read(user)
                .credits.map((c) => creditCashBalance(c)),
            ),
          (user) => {
            const state = new SqliteStateRepository(
              db,
              "projects",
              emptyProjectsState,
            ).read(user);
            return {
              reservedMinor: projectReservedMinor(state),
              history: state.fundingHistory ?? [],
            };
          },
        ),
    },
  ],
  exports: [BudgetService],
})
export class BudgetModule {}
