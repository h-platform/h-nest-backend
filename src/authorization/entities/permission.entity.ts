import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity('um_permission')
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    action: string;

    @Column()
    desc: string;

    @Column()
    path: string;

    @Column()
    moduleCode: string;

    @ManyToMany(() => Role, role => role.permissions)
    roles: Role[];
}
