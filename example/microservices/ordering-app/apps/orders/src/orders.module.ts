import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@app/common';
import { validateConfig } from '@app/common/validation/config.z';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: { validate: validateConfig },
    }),
    PrismaModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
