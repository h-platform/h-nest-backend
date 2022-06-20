import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('co_contact_role')
export class ContactRole {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    roleCode: string;

    @Column()
    roleName: string;

    @Column()
    roleNameAr: string;
}
