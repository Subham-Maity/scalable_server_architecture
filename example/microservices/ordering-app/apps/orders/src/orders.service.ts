import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '@app/common';
import { asyncErrorHandler } from '@app/common/errors/async-error-handler';
import { Order } from './types/order.types';

@Injectable()
export class OrdersService {
  createOrder = asyncErrorHandler(async (dto: CreateOrderDto): Promise<Order> => {
    return this.prisma.order.create({
      data: {
        ...dto,
      },
    });
  });
  getOrders = asyncErrorHandler(async (): Promise<Order[]> => {
    return this.prisma.order.findMany();
  });

  constructor(private readonly prisma: PrismaService) {}
}
