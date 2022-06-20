import { Inject, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entities/_index';
import { commands } from './commands/_index';
import { queries } from './queries/_index';

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [],
  exports: [],
  controllers: [
    ...commands,
    ...queries
  ],
})
export class CaptchaModule {
}
