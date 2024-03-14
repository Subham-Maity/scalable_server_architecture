import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './errors/global-exception-filter';
import { setupGlobalPipes } from './pipes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  setupGlobalPipes(app);
  await app.listen(3333);
}
bootstrap();
