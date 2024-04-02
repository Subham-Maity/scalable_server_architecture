import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupGlobalPipes } from './pipes';
import { setupSwagger } from './swagger';
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './errors';
import { ConfigService } from '@nestjs/config';
import { ApiDocReady, logApplicationDetails, logServerReady } from './utils';
import { setupSecurity } from './common';

const port = 3333;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSecurity(app);
  app.use(cookieParser());
  app.useGlobalFilters(new AllExceptionsFilter());
  setupGlobalPipes(app);
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
