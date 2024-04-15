import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './swagger.config';

export function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .addServer(swaggerConfig.localUrl, swaggerConfig.localDescription)
    .addServer(swaggerConfig.stagingUrl, swaggerConfig.stagingDescription)
    .addServer(swaggerConfig.productionUrl, swaggerConfig.productionDescription)
    .setLicense(swaggerConfig.license.name, swaggerConfig.license.url)
    .setContact(
      swaggerConfig.contact.name,
      swaggerConfig.contact.url,
      swaggerConfig.contact.email,
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'Token' },
      'access_token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
}
