import { isUUID } from "class-validator";
import { Column, CreateDateColumn, Entity, EntityManager, PrimaryGeneratedColumn } from "typeorm";
import { AggregateType, IAggregateEvent } from "../interfaces/aggregate-event.interface";
import * as uuid from 'uuid';

@Entity('es_aggregate_event')
export class AggregateEvent implements IAggregateEvent {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    topic: string;
    
    @Column()
    aggregateId: string;
    
    @Column()
    aggregateType: AggregateType;
    
    @Column('json')
    payload: Record<string, any>;
    
    @CreateDateColumn()
    createdAt: Date;
    
    @Column()
    eventVersion: number;

    constructor() {
        this.aggregateId = uuid.v4();
        this.payload = {};
    }

    static async save(sourceEvent: IAggregateEvent, em: EntityManager) : Promise<AggregateEvent> {
        // create event
        const event = em.create(AggregateEvent);
        event.aggregateId = sourceEvent.aggregateId;
        event.aggregateType = sourceEvent.aggregateType;
        event.topic = sourceEvent.topic;
        event.eventVersion = sourceEvent.eventVersion;
        event.payload = sourceEvent.payload;
        // save event
        await em.save(event);
        // TODO: publish event
        return event;
    }
}
