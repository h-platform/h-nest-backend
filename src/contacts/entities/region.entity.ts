import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RegionType } from './regionType.entity';

@Entity('co_region')
export class Region {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    regionName: string;

    @Column()
    regionNameAr: string;

    @Column()
    regionCode: string;

    @ManyToOne(() => RegionType)
    regionType: RegionType;

    @Column()
    regionPath: string;
}
