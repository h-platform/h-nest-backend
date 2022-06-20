import { Inject, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entities/_index';
import { commands } from './commands/_index';
import { queries } from './queries/_index';
import { OtpModule } from 'src/otp/otp.module';

@Module({
  imports: [
    OtpModule,
    TypeOrmModule.forFeature(entities)
  ],
  providers: [...queries],
  exports: [],
  controllers: [
    ...commands,
    ...queries
  ],
})
export class UserRegistrationByEmailModule {
}
