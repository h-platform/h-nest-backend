import { InjectEntityManager } from '@nestjs/typeorm';
import { QueryInterface } from 'src/cqm/interfaces/query.interface';
import { MoreThan, EntityManager } from 'typeorm';
import { IsEmpty, IsDefined, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { AggregateEvent } from '../entities/aggregate-event.entity';
import { transformAndValidate } from 'class-transformer-validator';
import { AggregateEventStream } from '../entities/aggregate-event-stream.entity';

export class QueryDTO {
    @IsDefined()
    @IsEmpty()
    streamName: string;

    @IsOptional()
    @Type(() => Number)
    limit: number;
}

export class EventStoreFindNextAggregateEventQuery implements QueryInterface {
    endpoint = 'eventStore.findNextAggregateEvent';

    constructor(
        @InjectEntityManager() private readonly manager: EntityManager,
    ) { }

    async execute(payload: QueryDTO): Promise<AggregateEvent[]> {
        payload = await transformAndValidate(QueryDTO, payload);
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
