import { EntityManager, MoreThan } from 'typeorm';
import { IsEmpty, IsDefined, IsOptional, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { transformAndValidate } from 'class-transformer-validator';
import { UnboundEventStream } from '../entities/unbound-event-stream.entity';
import { UnboundEvent } from '../entities/unbound-event.entity';
import { CommandError } from '@h-platform/cqm';
import { InjectEntityManager } from '@nestjs/typeorm';

export class QueryDTO {
    @IsDefined()
    @IsNotEmpty()
    streamName: string;

    @IsOptional()
    @Type(() => Number)
    limit: number;
}

export class EventStoreFindNextUnboundEventQuery {
    endpoint = 'eventStore.findNextUnboundEvent';

    constructor(
        @InjectEntityManager() private readonly manager: EntityManager,
    ) { }

    async execute(payload: QueryDTO): Promise<UnboundEvent[]> {
        payload = await transformAndValidate(QueryDTO, payload);
        const stream = await this.manager.findOneOrFail(UnboundEventStream, {
            relations: ['lastEvent'],
            where: { streamName: payload.streamName }
        });
        const lastEventId = stream.lastEvent ? stream.lastEvent.id : 0;
        const events = this.manager.find(UnboundEvent, { where: { id: MoreThan(lastEventId) }, take: payload.limit || 10 });
        return events;
    }
}