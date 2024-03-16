import { Body, Controller, Get, Post } from '@nestjs/common';

import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { Order } from './types/order.types';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() body: CreateOrderDto): Promise<Order> {
    return this.ordersService.createOrder(body);
  }

  @Get()
  async getOrders(): Promise<Order[]> {
    return this.ordersService.getOrders();
  }
}
