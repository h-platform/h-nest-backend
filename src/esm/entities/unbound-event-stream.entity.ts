import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    UpdateDateColumn,
} from 'typeorm';
import { UnboundEvent } from './unbound-event.entity';

@Entity('es_unbound_event_stream')
export class UnboundEventStream {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 200 })
    streamName: string;

    @ManyToOne(() => UnboundEvent)
    lastEvent: UnboundEvent;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
