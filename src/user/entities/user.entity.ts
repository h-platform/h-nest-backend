import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, UpdateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('um_user')
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    
    
    @Column({ nullable: true })
    username: string;

    @Column({ nullable: true })
    userImage: string;



    @Column({ nullable: true })
    mobileNumber: string;

    @Column({ default: 0})
    isMobileNumberVerified: boolean;

    @Column({ nullable: true })
    mobileVerifiedDate: Date;



    @Column({ nullable: true })
    email: string;

    @Column({ default: 0 })
    isEmailVerified: boolean;

    @Column({ nullable: true })
    emailVerifiedDate: Date;



    @Column()
    displayName: string;

    @Column({nullable: true})
    legalName: string;



    @Column('text', { select: false })
    @Exclude()
    password: string;

    @Column({nullable: true})
    passwordNeedsReset: boolean;



    @Column({nullable: true})
    isActive: boolean;

    @Column({nullable: true})
    isBlocked: boolean;

    @Column({nullable: true})
    isDeleted: boolean;



    @Column({ nullable: true })
    addressCountry: string;

    @Column({ nullable: true })
    addressRegion: string;

    @Column({ nullable: true })
    addressCity: string;

    @Column({ nullable: true })
    addressLine: string;



    @Column('json', { nullable: true })
    roles: string[];

    @Column('json', { nullable: true })
    grants: Array<Record<string, string[]>>;




    @Column('json')
    attributes: any;



    @Column({nullable: true})
    lastLogin: Date;



    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
