import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('co_region_type')
export class RegionType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    regionTypeName: string;

    @Column()
    regionTypeNameAr: string;
}
