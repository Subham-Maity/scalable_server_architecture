import { NestFactory } from '@nestjs/core';
import { IamModule } from './iam.module';
import { ConfigService } from '@nestjs/config';
import {
  AllExceptionsFilter,
  ApiDocReady,
  logApplicationDetails,
  logServerReady,
  setupSecurity,
  setupSwagger,
} from '@app/common';
import * as cookieParser from 'cookie-parser';

const port = 3333;

async function bootstrap() {
  const app = await NestFactory.create(IamModule);
  setupSecurity(app);
  app.use(cookieParser());
  app.useGlobalFilters(new AllExceptionsFilter(app.get(ConfigService)));
  setupSwagger(app);
  const configService = app.get(ConfigService);
  await app.listen(configService.get('port') || port);
  return configService;
}

bootstrap().then((configService) => {
  logServerReady(configService.get('port') || port);
  logApplicationDetails(configService);
  ApiDocReady(configService.get('port') || port, configService);
});
