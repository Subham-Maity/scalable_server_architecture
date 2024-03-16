import { NestFactory } from '@nestjs/core';
import { OrdersModule } from './orders.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter, setupGlobalPipes } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(OrdersModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  setupGlobalPipes(app);
  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT'));
}
bootstrap().then(() => console.log('Orders app is running'));
