import { Module } from "@nestjs/common";
import { RUNTIME } from "../../infrastructure/infrastructure.module";
import { SqliteDatabase } from "../../infrastructure/database/sqlite-database";
import { SqliteStateRepository } from "../../infrastructure/database/sqlite-state-repository";
import type { Runtime } from "../../shared/application/state-repository";
import { ProjectsService } from "./application/projects.service";
import { emptyProjectsState } from "./domain/models";
import { ProjectsController } from "./presentation/projects.controller";

@Module({
  controllers: [ProjectsController],
  providers: [
    {
      provide: ProjectsService,
      inject: [SqliteDatabase, RUNTIME],
      useFactory: (db: SqliteDatabase, runtime: Runtime) =>
        new ProjectsService(
          new SqliteStateRepository(db, "projects", emptyProjectsState),
          runtime,
        ),
    },
  ],
})
export class ProjectsModule {}
