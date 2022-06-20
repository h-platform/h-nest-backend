import { Inject, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entities/_index';
import { commands } from './commands/_index';
import { queries } from './queries/_index';
import { services } from './services/_index';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    BullModule.registerQueue({
      name: 'sms',
    }),
  ],
  providers: [...queries, ...services],
  exports: [...services],
  controllers: [
    ...commands,
    ...queries
  ],
})
export class OtpModule {
}
