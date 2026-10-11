import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import type { Environment } from "./config/environment";
import { DomainErrorFilter } from "./shared/presentation/domain-error.filter";

// Both the executable and HTTP tests use the same configuration and middleware.
export async function createApplication(
  environment: Environment,
  logger: false | undefined = undefined,
) {
  const app = await NestFactory.create(AppModule.register(environment), {
    logger,
  });
  app.setGlobalPrefix("api/v1");
  app.enableCors({
    origin: environment.frontendOrigin,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  });
  app.use(helmet());
  app.getHttpAdapter().getInstance().disable("x-powered-by");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.useGlobalFilters(new DomainErrorFilter());
  app.enableShutdownHooks();
  if (environment.swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle("BudgetZen API")
      .setVersion("1.0")
      .setDescription(
        "API de gestion budgétaire. Montants en MGA, dates ISO 8601, authentification Bearer JWT.",
      )
      .addBearerAuth()
      .build();
    SwaggerModule.setup(
      "api/docs",
      app,
      SwaggerModule.createDocument(app, config),
    );
  }
  return app;
}
