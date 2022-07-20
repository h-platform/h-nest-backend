import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SERVICE_HOST, SERVICE_NAME, SERVICE_PORT, SERVICE_TITLE, SERVICE_VERSION, SESSION_SECRET } from './constants';
import { CQExceptionsFilter } from '@h-platform/cqm';
import { giveMeClassLogger } from './common/winston.logger';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import { AnyRoleGuard, EveryRoleGuard } from './authentication/guards/role.guard';

const logger = giveMeClassLogger('main')

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe(
    { disableErrorMessages: false }
  ));
  app.useGlobalFilters(new CQExceptionsFilter());

  // define guards
  const reflector = new Reflector();
  app.useGlobalGuards(
    new AnyRoleGuard(reflector),
    new EveryRoleGuard(reflector)
  );

  // swagger
  const config = new DocumentBuilder()
    .setTitle(SERVICE_NAME)
    .setDescription(SERVICE_TITLE)
    .setVersion(SERVICE_VERSION)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // start microservice
  await app.listen(SERVICE_PORT, SERVICE_HOST);

  // somewhere in your initialization file
  app.use(compression());

  logger.info(`service: ${SERVICE_NAME} started on port: ${SERVICE_PORT} environment: ${process.env.NODE_ENV} version: ${SERVICE_VERSION}`);
}
bootstrap();
