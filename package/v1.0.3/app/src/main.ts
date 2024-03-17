import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './errors/global-exception-filter';
import { setupGlobalPipes } from './pipes';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  setupGlobalPipes(app);
  setupSwagger(app);
  await app.listen(3333);
}
bootstrap();
