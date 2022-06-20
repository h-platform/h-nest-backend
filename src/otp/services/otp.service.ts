import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager, Equal } from "typeorm";
import { OTP } from "../entities/otp.entity";
import * as uuid from 'uuid';
import * as _ from 'lodash';
import { CommandError } from "src/cqm/lib/command-error";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

@Injectable()
export class OtpService {
    constructor(
        @InjectEntityManager() private readonly manager: EntityManager,
        @InjectQueue('sms') private smsQueue: Queue,
    ) { }

    async sendSmsOtp(mobileNumber: string, textMessage: string, actionType: string, actionPayload: any) : Promise<OTP> {
        const otp = this.manager.create(OTP);
        otp.actionPayload = actionPayload;
        otp.actionType = actionType;
        otp.mobileNumber = mobileNumber;
        otp.generateToken(6);
        otp.otpUuid = uuid.v4();
        otp.otpType = 'SMS';
        otp.isConsumed = false;
        await this.manager.save(otp);
        await this.smsQueue.add('sendSms', {
            mobileNumber,
            textMessage: textMessage.replace(':OTP', otp.otpToken),
        })
        return otp;
    }

    async verifySmsOtpOrFail(otpUuid: string, mobileNumber: string, actionType: string, otpToken: string) {
        const otp = await this.manager.findOne(OTP, {
            where: {
                otpUuid: Equal(otpUuid),
            },
        });

        if (!otp) {
            throw new CommandError('SMS OTP UUID not found', 'OTP_UUID_NOT_FOUND');
        }
        
        if (otp.mobileNumber != mobileNumber) {
            throw new CommandError('SMS OTP wrong mobile number', 'OTP_WRONG_MOBILE_NUMBER');
        }
        
        if (otp.actionType != actionType) {
            throw new CommandError('SMS OTP wrong action type', 'OTP_WRONG_ACTION_TYPE');
        }
        
        if (otp.otpToken != otpToken) {
            throw new CommandError('SMS Otp token is incorrect', 'OTP_WRONG_TOKEN');
        }
        
        if (otp.isConsumed) {
            throw new CommandError('SMS OTP is already consumed', 'OTP_CONSUMED');
        }

        return otp
    }

    async verifyAndConsumeSmsOtpOrFail(otpUuid: string, mobileNumber: string, actionType: string, otpToken: string) {
        const otp = await this.verifySmsOtpOrFail(otpUuid, mobileNumber, actionType, otpToken)
        otp.isConsumed = true;
        otp.consumedAt = new Date();
        await this.manager.save(otp);
        return otp;
    }
}