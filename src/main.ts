import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SERVICE_HOST, SERVICE_NAME, SERVICE_PORT, SERVICE_TITLE, SESSION_SECRET } from './constants';
import { AllExceptionsFilter } from './cqm/filters/all-exceptions-filter';
import { giveMeClassLogger } from './common/winston.logger';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';

const logger = giveMeClassLogger('main')

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe(
    { disableErrorMessages: false }
  ));
  app.useGlobalFilters(new AllExceptionsFilter());

  
  // swagger
  const config = new DocumentBuilder()
    .setTitle(SERVICE_NAME)
    .setDescription(SERVICE_TITLE)
    .setVersion('0.1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // start microservice
  await app.listen(SERVICE_PORT, SERVICE_HOST);

  // somewhere in your initialization file
  app.use(compression());

  logger.info(`${SERVICE_NAME} started on port ${SERVICE_PORT}`);
}
bootstrap();
