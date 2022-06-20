import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ContactRole } from './contact-role.entity';
import { Region } from './region.entity';

@Entity('co_contact')
export class Contact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    contactName: string;

    @Column()
    contactType: 'COMPANY' | 'INDIVIDUAL';

    @Column({ nullable: true })
    desc?: string;


    @Column('json', { nullable: true })
    contactRoles: ContactRole[];

    /* related contacts
     *******************/
    @ManyToOne(() => Contact)
    parentContact: Contact;

    @OneToMany(() => Contact, (contact: Contact) => contact.parentContact)
    childrenContacts: Contact[];

    /* contact info
    ***************/
    @Column({ nullable: true })
    contactEmail: string;

    @Column({ nullable: true })
    contactNo: string;

    @Column({ nullable: true })
    contactNo2: string;

    /* address
    ************* */
    @Column({ nullable: true })
    country?: string;

    @ManyToOne(() => Region)
    region: Region;

    @Column({ nullable: true })
    city?: string;

    @Column({ nullable: true })
    addressLine1: string;

    @Column({ nullable: true })
    addressLine2: string;

    /* other
    ************* */
    @Column('json', { nullable: true })
    tags: string[];

    @ManyToOne(() => User)
    user: User;

    /* create - update
    ******************/
    @Column()
    isArchived: boolean;

    @ManyToOne(() => User)
    createdBy: User;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User)
    updatedBy: User;

    @UpdateDateColumn()
    updatedAt: Date;
}
