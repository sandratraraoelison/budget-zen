import { Module } from "@nestjs/common";
import { SqliteDatabase } from "../../infrastructure/database/sqlite-database";
import { SqliteStateRepository } from "../../infrastructure/database/sqlite-state-repository";
import { SettingsService } from "./application/settings.service";
import { emptySettings } from "./domain/settings";
import { SettingsController } from "./presentation/settings.controller";

@Module({
  controllers: [SettingsController],
  providers: [
    {
      provide: SettingsService,
      inject: [SqliteDatabase],
      useFactory: (db: SqliteDatabase) =>
        new SettingsService(
          new SqliteStateRepository(db, "settings", emptySettings),
        ),
    },
  ],
})
export class SettingsModule {}
