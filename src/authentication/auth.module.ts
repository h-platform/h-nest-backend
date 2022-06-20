import { Module } from '@nestjs/common';
import { EventStoreModule } from 'src/esm/esm.module';
import { commands } from './commands/_index';

@Module({
  imports: [
    EventStoreModule
  ],
  controllers: [...commands],
  providers: [],
  exports: [],
})
export class AuthenticationModule { }
