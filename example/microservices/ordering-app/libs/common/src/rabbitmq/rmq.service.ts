import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class RmqService {
  constructor(private readonly configService: ConfigService) {}

  // getOptions method returns the options for RabbitMQ
  // It takes two parameters: the name of the queue and a boolean indicating whether to acknowledge messages automatically
  getOptions(queue: string, noAck = false): RmqOptions {
    return {
      // The transport protocol to use to connect to the RabbitMQ server
      transport: Transport.RMQ,
      options: {
        // The URL(s) of the RabbitMQ server(s), retrieved from the configuration
        urls: [this.configService.get<string>('RABBIT_MQ_URI')],
        // The name of the queue to connect to, also retrieved from the configuration
        queue: this.configService.get<string>(`RABBIT_MQ_${queue}_QUEUE`),
        // Whether to acknowledge messages automatically (default is false)
        noAck,
        // Whether messages should be persisted on the server (default is true)
        persistent: true,
      },
    };
  }

  // ack method acknowledges a message
  // It takes a context of type RmqContext, which contains information about the message and the channel it was received on
  ack(context: RmqContext) {
    // Get the channel reference from the context
    // This is the channel that the message was received on
    const channel = context.getChannelRef();
    // Get the original message from the context
    // This is the message that was received
    const originalMessage = context.getMessage();
    // Acknowledge the message
    // This tells the server that the message has been processed and can be removed from the queue
    channel.ack(originalMessage);
  }
}
