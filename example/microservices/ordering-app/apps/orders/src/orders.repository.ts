import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '@app/common';
import { Order } from './types/order.types';
import { ConfigId } from '@app/common/types';

@Injectable()
export class OrdersRepository {
  protected readonly logger = new Logger(OrdersRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findOrderById(id: ConfigId): Promise<Order | null> {
    return this.prisma.order.findUnique({ where: { id } });
  }

  // Add other methods as needed
}
