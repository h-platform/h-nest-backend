import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entities/_index';
import { queries } from './queries/_index';
import { UnboundEventService } from './services/unbound-event.service';
import { EventSourcingService } from './services/event-sourcing.service';

@Module({
    imports: [
        TypeOrmModule.forFeature(entities),
    ],
    controllers: [
    ],
    providers: [
        ...queries,
        UnboundEventService,
        EventSourcingService,
    ],
    exports: [
        UnboundEventService,
        EventSourcingService,
    ],
})
export class EventStoreModule {
}
