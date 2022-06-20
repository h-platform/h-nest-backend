import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    UpdateDateColumn,
} from 'typeorm';
import { AggregateEvent } from './aggregate-event.entity';

@Entity('es_aggregate_event_stream')
export class AggregateEventStream {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 200 })
    streamName: string;

    @ManyToOne(() => AggregateEvent)
    lastEvent: AggregateEvent;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
