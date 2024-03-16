import { NestFactory } from '@nestjs/core';
import { OrdersModule } from '../../orders/src/orders.module';
import { AllExceptionsFilter, RmqService, setupGlobalPipes } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(OrdersModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  setupGlobalPipes(app);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('BILLING'));
  await app.startAllMicroservices();
}
bootstrap();
