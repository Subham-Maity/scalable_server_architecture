import { Injectable } from '@nestjs/common';
import { asyncErrorHandler, PrismaService } from '@app/common';
import { CreateOrderDto } from './dto';
import { Order } from './types';

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
