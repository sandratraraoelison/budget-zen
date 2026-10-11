import { Module } from "@nestjs/common";
import { RUNTIME } from "../../infrastructure/infrastructure.module";
import { SqliteDatabase } from "../../infrastructure/database/sqlite-database";
import { SqliteStateRepository } from "../../infrastructure/database/sqlite-state-repository";
import type { Runtime } from "../../shared/application/state-repository";
import { CreditsService } from "./application/credits.service";
import { emptyCreditsState } from "./domain/models";
import { CreditsController } from "./presentation/credits.controller";

@Module({
  controllers: [CreditsController],
  providers: [
    {
      provide: CreditsService,
      inject: [SqliteDatabase, RUNTIME],
      useFactory: (db: SqliteDatabase, runtime: Runtime) =>
        new CreditsService(
          new SqliteStateRepository(db, "credits", emptyCreditsState),
          runtime,
        ),
    },
  ],
})
export class CreditsModule {}
