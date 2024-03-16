import { NestFactory } from '@nestjs/core';
import { OrdersModule } from './orders.module';
import { setupGlobalPipes } from '@app/common/pipes';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from '@app/common/errors/global-exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(OrdersModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  setupGlobalPipes(app);
  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT'));
}
bootstrap().then(() => console.log('Orders app is running'));
