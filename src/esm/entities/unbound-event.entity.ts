import { Column, CreateDateColumn, Entity, EntityManager, MoreThan, PrimaryGeneratedColumn } from 'typeorm';

@Entity('es_unbound_event')
export class UnboundEvent {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    type: 'EVENT' | 'COMMAND' | 'QUERY' | 'STAT' | 'AUDIT';

    @Column()
    topic: string;

    @Column('json')
    payload: any;

    @Column()
    createdById: string;

    @CreateDateColumn()
    createdAt: Date;

    static async countRate(userId: string, topic: string, timeAgoInSeconds, em: EntityManager): Promise<number> {
        const minDateMilliseconds = new Date().getTime() - timeAgoInSeconds * 1000;
        const minDate = new Date(minDateMilliseconds);
        return em.count(UnboundEvent, { where: { createdById: userId, topic, createdAt: MoreThan(minDate) } });
    }
}
