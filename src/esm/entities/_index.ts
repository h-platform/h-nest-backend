import { AggregateEventStream } from './aggregate-event-stream.entity';
import { AggregateEvent } from './aggregate-event.entity';
import { Aggregate } from './aggregate.entity';
import { UnboundEvent } from './unbound-event.entity';
import { UnboundEventStream } from './unbound-event-stream.entity';

export const entities = [
    AggregateEvent,
    Aggregate,
    AggregateEventStream,
    UnboundEvent,
    UnboundEventStream,
];
