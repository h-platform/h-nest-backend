import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from './authentication/auth.middleware';
import { UserModule } from './user/user.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthenticationModule } from './authentication/auth.module';
import { UserRegistrationByMobileModule } from './user-registration-by-mobile/user-registration-by-mobile.module';
import { ContactModule } from './contacts/contact.module';
import { CaptchaModule } from './capatcha/captcha.module';
import { UserRegistrationByEmailModule } from './user-registration-by-email/user-registration-by-email.module';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { allEntities } from './all-entities';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { RedisModule } from '@liaoliaots/nestjs-redis/dist/redis/redis.module';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { SESSION_SECRET } from './constants';
const session = require('express-session');
const RedisStore = require("connect-redis");

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      "type": "mysql",
      "host": process.env.MYSQL_HOST,
      "port": Number(process.env.MYSQL_PORT),
      "username": process.env.MYSQL_USERNAME,
      "password": process.env.MYSQL_PASSWORD,
      "database": process.env.MYSQL_DATABASE,
      "entities": [
        ...allEntities
      ],
      "synchronize": true,
      "logging": false,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    RedisModule.forRoot({
      config: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        db: parseInt(process.env.REDIS_DB),
        password: process.env.REDIS_PASSWORD,
        keyPrefix: process.env.REDIS_PRIFIX,
      }
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        db: parseInt(process.env.REDIS_DB),
        password: process.env.REDIS_PASSWORD,
        keyPrefix: process.env.REDIS_PRIFIX + 'bull:',
      },
    }),
    ThrottlerModule.forRootAsync({
      useFactory(redisService: RedisService) {
        const redis = redisService.getClient();
        return { 
          ttl: 60, 
          limit: 10, 
          storage: new ThrottlerStorageRedisService(redis)
        };
      },
      inject: [RedisService]
    }),

    AuthenticationModule,
    UserModule,
    ContactModule,
    CaptchaModule,
    UserRegistrationByEmailModule,
    UserRegistrationByMobileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  constructor(
    private readonly redisService: RedisService
  ) { }
  async configure(consumer: MiddlewareConsumer) {
    const redisClient = await this.redisService.getClient();

    consumer
      .apply(
        session({
          store: new (RedisStore(session))({ client: redisClient, logErrors: true }),
          saveUninitialized: false,
          secret: SESSION_SECRET,
          resave: false,
          cookie: {
            sameSite: true,
            httpOnly: true,
            maxAge: 60000,
          },
        }),
        AuthMiddleware)
      .forRoutes('*');
  }
}
