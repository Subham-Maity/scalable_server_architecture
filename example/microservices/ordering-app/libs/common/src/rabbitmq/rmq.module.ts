import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RmqService } from './rmq.service';

interface RmqModuleOptions {
  name: string;
}

@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  // The register method takes an option object and returns a dynamic module
  static register({ name }: RmqModuleOptions): DynamicModule {
    return {
      module: RmqModule, // The module being created is RmqModule
      imports: [
        // The module imports a dynamically registered module from ClientsModule
        ClientsModule.registerAsync([
          {
            name, // The name of the client to register
            useFactory: (configService: ConfigService) => ({
              // The factory function to use when creating the client
              transport: Transport.RMQ, // The transport protocol to use (in this case, RabbitMQ)
              options: {
                // The URL of the RabbitMQ server, retrieved from the configuration
                urls: [configService.get<string>('RABBIT_MQ_URI')],
                // The name of the queue to connect to, also retrieved from the configuration
                queue: configService.get<string>(`RABBIT_MQ_${name}_QUEUE`),
              },
            }),
            inject: [ConfigService], // The providers to inject into the factory function (in this case, ConfigService)
          },
        ]),
      ],
      exports: [ClientsModule], // The module exports ClientsModule so its providers can be used in other modules
    };
  }
}
