import { Controller, Get, Module, type DynamicModule } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ApiTags } from "@nestjs/swagger";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import type { Environment } from "./config/environment";
import { InfrastructureModule } from "./infrastructure/infrastructure.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BudgetModule } from "./modules/budget/budget.module";
import { CreditsModule } from "./modules/credits/credits.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { BusinessModule } from "./modules/business/business.module";

@ApiTags("health")
@Controller("health")
class HealthController {
  @Get() check() {
    return { status: "ok" };
  }
}

@Module({})
export class AppModule {
  static register(environment: Environment): DynamicModule {
    return {
      module: AppModule,
      imports: [
        InfrastructureModule.register(environment),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
        AuthModule,
        BudgetModule,
        CreditsModule,
        ProjectsModule,
        BusinessModule,
      ],
      controllers: [HealthController],
      providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
    };
  }
}
