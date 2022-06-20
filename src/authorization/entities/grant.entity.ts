import { User } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity('um_grant')
export class Grant {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => Role)
    role: Role;

    @Column('json')
    tags: string[];

    @ManyToOne(() => User)
    createdBy: Date;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User)
    updatedBy: User;

    @UpdateDateColumn()
    updatedAt: Date;

}
