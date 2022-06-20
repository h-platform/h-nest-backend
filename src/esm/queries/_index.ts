import { EventStoreFindNextAggregateEventQuery } from "./eventStore.findNextAggregateEvent";
import { EventStoreFindNextUnboundEventQuery } from "./eventStore.findNextUnboundEvent";
import { AggregateFindAllQuery } from "./aggregate.findAll";
import { AggregateFindOneQuery } from "./aggregate.findOne";
import { AggregateFindByIdsQuery } from "./aggregate.findByIds";

export const queries = [
    AggregateFindAllQuery,
    AggregateFindOneQuery,
    AggregateFindByIdsQuery,
    EventStoreFindNextAggregateEventQuery,
    EventStoreFindNextUnboundEventQuery,
];
