import { Inject, Injectable } from '@nestjs/common';
import { asyncErrorHandler, PrismaService } from '@app/common';
import { CreateOrderDto } from './dto';
import { Order } from './types';
import { ClientProxy } from '@nestjs/microservices';
import { BILLING_SERVICE } from './constant/services';

@Injectable()
export class OrdersService {
  getOrders = asyncErrorHandler(async (): Promise<Order[]> => {
    return this.prisma.order.findMany();
  });
  createOrder = asyncErrorHandler(async (dto: CreateOrderDto): Promise<Order> => {
    return this.prisma.$transaction(async (tx) => {
      try {
        const order = await tx.order.create({
          data: {
            ...dto,
          },
        });

        this.billingClient.emit('order_created', {
          request: dto,
        });
        return order;
      } catch (err) {
        throw err;
      }
    });
  });

  constructor(
    private readonly prisma: PrismaService,
    @Inject(BILLING_SERVICE) private billingClient: ClientProxy,
  ) {}
}
