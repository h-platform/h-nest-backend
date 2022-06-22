import { Body, Controller, Get, HttpException, HttpService, Inject, Post, Query } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { transformAndValidate } from 'class-transformer-validator';
import { giveMeClassLogger } from 'src/common/winston.logger';
import { CommandError } from '@h-platform/cqm';
import { EntityManager, Equal } from 'typeorm';
import { CommandResponse } from '@h-platform/cqm';
import { IsDefined } from 'class-validator';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { UserRegisterByEmailSendOtpDTO } from './user.registerByEmail.sendOtp';
import { OtpService } from 'src/otp/services/otp.service';
import { SmsService } from 'src/otp/services/sms.service';
import { User } from 'src/user/entities/user.entity';
import { OTP } from 'src/otp/entities/otp.entity';

const topic = "user.registerByEmail.consumeOtp"
const logger = giveMeClassLogger(topic);

export class UserRegisterByEmailConsumeOtpCommandDTO {
    @ApiProperty()
    @IsDefined()
    otpUuid: string;

    @ApiProperty()
    @IsDefined()
    email: string;

    @ApiProperty()
    @IsDefined()
    token: string;
}

@ApiTags('umm')
@ApiBearerAuth()
@Controller('api/umm/commands')
export class UserRegisterByEmailConsumeOtpCommand {
    constructor(
        private readonly otpService: OtpService,
        private readonly smsService: SmsService,
        @InjectEntityManager() private readonly manager: EntityManager,
    ) { }

    async execute(dto: UserRegisterByEmailConsumeOtpCommandDTO): Promise<any> {
        logger.debug(`command execution started`, { ...dto });
        logger.silly(`command dto`, dto);
        dto = await transformAndValidate(UserRegisterByEmailConsumeOtpCommandDTO, dto);

        // verify sms otp
        const otp = await this.manager.findOne(OTP, {
            where: {
                otpUuid: Equal(dto.otpUuid),
            },
        });

        if (!otp) {
            throw new CommandError('Email verification UUID not found', 'OTP_UUID_NOT_FOUND');
        }
        
        if (otp.email != dto.email) {
            throw new CommandError('Email verification wrong mobile number', 'OTP_WRONG_MOBILE_NUMBER');
        }
        
        if (otp.actionType != 'USER_REGISTER_BY_EMAIL') {
            throw new CommandError('Email verification wrong action type', 'OTP_WRONG_ACTION_TYPE');
        }
        
        if (otp.otpToken != dto.token) {
            throw new CommandError('Email verification token is incorrect', 'OTP_WRONG_TOKEN');
        }
        
        if (otp.isConsumed) {
            throw new CommandError('Email verification OTP is already consumed', 'OTP_CONSUMED');
        }

        otp.isConsumed = true;
        otp.consumedAt = new Date();
        await this.manager.save(otp);
        
        // create new user
        const user = this.manager.create(User);
        const payload = otp.actionPayload as UserRegisterByEmailSendOtpDTO;
        user.mobileNumber = payload.mobileNumber;
        user.isMobileNumberVerified = true;
        user.mobileVerifiedDate = new Date();
        user.displayName = payload.displayName;
        user.legalName = payload.displayName;
        user.password = payload.password;
        await this.manager.save(user);
        
        // send welcome message
        await this.smsService.sendSms(user.mobileNumber, 'مرحبا بك ، تم تسجيل حسابك بنجاح');

        // TODO: should delete consumed tokens next day
        return CommandResponse.success('تم التسجيل بنجاح', 'REGISTER_SUCCESS', {})
    }

    @Post(topic)
    async httpHandler(@Body() body: UserRegisterByEmailConsumeOtpCommandDTO): Promise<any> {
        return this.execute(body)
    }
}