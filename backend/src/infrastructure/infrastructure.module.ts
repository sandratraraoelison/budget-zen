import { Global, Module, type DynamicModule } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { Environment } from "../config/environment";
import { SqliteDatabase } from "./database/sqlite-database";
import type { Runtime } from "../shared/application/state-repository";

export const ENVIRONMENT = Symbol("Environment");
export const RUNTIME = Symbol("Runtime");

@Global()
@Module({})
export class InfrastructureModule {
  static register(environment: Environment): DynamicModule {
    return {
      module: InfrastructureModule,
      providers: [
        { provide: ENVIRONMENT, useValue: Object.freeze(environment) },
        {
          provide: RUNTIME,
          useValue: { id: randomUUID, now: () => new Date() } satisfies Runtime,
        },
        {
          provide: SqliteDatabase,
          useFactory: () => new SqliteDatabase(environment.databasePath),
        },
      ],
      exports: [ENVIRONMENT, RUNTIME, SqliteDatabase],
    };
  }
}
