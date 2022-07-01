import { InjectEntityManager } from '@nestjs/typeorm';
import { MoreThan, EntityManager } from 'typeorm';
import { IsEmpty, IsDefined, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { AggregateEvent } from '../entities/aggregate-event.entity';
import { transformAndValidate } from 'class-transformer-validator';
import { AggregateEventStream } from '../entities/aggregate-event-stream.entity';

export class EventStoreFindNextAggregateEventQueryDTO {
    @IsDefined()
    @IsEmpty()
    streamName: string;

    @IsOptional()
    @Type(() => Number)
    limit: number;
}

export class EventStoreFindNextAggregateEventQuery {
    endpoint = 'eventStore.findNextAggregateEvent';

    constructor(
        @InjectEntityManager() private readonly manager: EntityManager,
    ) { }

    async execute(payload: EventStoreFindNextAggregateEventQueryDTO): Promise<AggregateEvent[]> {
        payload = await transformAndValidate(EventStoreFindNextAggregateEventQueryDTO, payload);
        const stream = await this.manager.findOneOrFail(AggregateEventStream, { 
            relations: ['lastEvent'],
            where: { streamName: payload.streamName }
        });
        const events = this.manager.find(AggregateEvent, { 
            where: { id: MoreThan(stream.lastEvent.id) },
            take: payload.limit || 10 });
        return events;
    }
}
