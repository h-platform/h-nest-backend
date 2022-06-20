import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('um_otp')
export class OTP {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    otpUuid: string;

    @Column()
    otpType: 'SMS' | 'EMAIL';

    @Column()
    otpToken: string;

    @Column({ nullable: true })
    relatedUserId: string;
    

    @Column()
    actionType: string;

    @Column('json')
    actionPayload: Record<string, any>;



    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    mobileNumber: string;



    @Column({ default: false })
    isConsumed: boolean;

    @Column({ nullable: true })
    consumedAt: Date;



    @Column({ nullable: true })
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    generateToken(n: number = 6) {
        this.otpToken = generateRandomNumber(n)
    }    
}

function generateRandomNumber(n: number): string {
    var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   

    if (n > max) {
        return this.generateRandomNumber(max) + this.generateRandomNumber(n - max);
    }

    max = Math.pow(10, n + add);
    var min = max / 10; // Math.pow(10, n) basically
    var number = Math.floor(Math.random() * (max - min + 1)) + min;

    return ("" + number).substring(add);
}