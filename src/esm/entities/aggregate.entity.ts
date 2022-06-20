import { CommandError } from 'src/cqm/lib/command-error';
import { Column, CreateDateColumn, Entity, EntityManager, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, RelationId, UpdateDateColumn, } from 'typeorm';
import { AggregateType } from '../interfaces/aggregate-event.interface';
import { AggregateEvent } from './aggregate-event.entity';

@Entity('es_aggregate')
export class Aggregate {
    @PrimaryColumn()
    id: string;

    @Column('json')
    state: any;

    @Column()
    aggregateType: AggregateType;

    @ManyToOne(() => AggregateEvent)
    lastEvent: AggregateEvent;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    static async findById<T extends Aggregate>(uuid: string, aggregateType: AggregateType, em: EntityManager): Promise<T> {
        const aggregate = await em.findOne(Aggregate, { where: { id: uuid } });
        if (!aggregate) {
            return
        }
        if (aggregate.aggregateType !== aggregateType) {
            throw new CommandError('aggregate type mismatch', 'TYPE_MISMATCH')
        }
        return aggregate as T;
    }

    static async findByIdOrFail<T extends Aggregate>(uuid: string, aggregateType: AggregateType, em: EntityManager) {
        const aggregate = await em.findOne(Aggregate, { where: { id: uuid } });
        if (!aggregate) {
            throw new CommandError('aggregate not found', 'NOT_FOUND');
        }
        if (aggregate.aggregateType !== aggregateType) {
            throw new CommandError('aggregate type mismatch', 'TYPE_MISMATCH')
        }
        return aggregate as T;
    }

    static async save(sourceAggregate: Aggregate, em: EntityManager) {
        // clone aggragate into new entity
        const aggregate = em.create(Aggregate);
        aggregate.id = sourceAggregate.id;
        aggregate.state = sourceAggregate.state;
        aggregate.aggregateType = sourceAggregate.aggregateType;
        aggregate.lastEvent = sourceAggregate.lastEvent;
        // save aggregate
        await em.save(aggregate);
        return aggregate;
    }
}
