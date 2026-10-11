import { Module } from "@nestjs/common";
import { RUNTIME } from "../../infrastructure/infrastructure.module";
import { SqliteDatabase } from "../../infrastructure/database/sqlite-database";
import { SqliteStateRepository } from "../../infrastructure/database/sqlite-state-repository";
import type { Runtime } from "../../shared/application/state-repository";
import { BusinessService } from "./application/business.service";
import { emptyBusinessState } from "./domain/models";
import { BusinessController } from "./presentation/business.controller";

@Module({
  controllers: [BusinessController],
  providers: [
    {
      provide: BusinessService,
      inject: [SqliteDatabase, RUNTIME],
      useFactory: (db: SqliteDatabase, runtime: Runtime) =>
        new BusinessService(
          new SqliteStateRepository(db, "business", emptyBusinessState),
          runtime,
        ),
    },
  ],
})
export class BusinessModule {}
