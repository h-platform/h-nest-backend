import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Contact } from './contact.entity';

@Entity('co_contact_link')
export class ContactLink {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    relation: string;

    @ManyToOne(() => Contact)
    from: Contact;

    @ManyToOne(() => Contact)
    to: Contact;
}
