import { Body, Controller, Get, HttpException, HttpService, Inject, Post, Query } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { transformAndValidate } from 'class-transformer-validator';
import { giveMeClassLogger } from 'src/common/winston.logger';
import { CommandError } from 'src/cqm/lib/command-error';
import { EntityManager, Equal } from 'typeorm';
import { CommandResponse } from 'src/cqm/lib/command-response';
import { IsDefined } from 'class-validator';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { UserRegisterByMobileNoSendOtpDTO } from './user.registerByMobileNo.sendOtp';
import { OtpService } from 'src/otp/services/otp.service';
import { SmsService } from 'src/otp/services/sms.service';
import { User } from 'src/user/entities/user.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

const topic = "user.registerByMobileNo.consumeOtp"
const logger = giveMeClassLogger(topic);

export class UserRegisterByMobileNoConsumeOtpCommandDTO {
    @ApiProperty()
    @IsDefined()
    otpUuid: string;

    @ApiProperty()
    @IsDefined()
    mobileNumber: string;

    @ApiProperty()
    @IsDefined()
    token: string;
}

@ApiTags('umm')
@ApiBearerAuth()
@Controller('api/umm/commands')
export class UserRegisterByMobileNoConsumeOtpCommand {
    constructor(
        private readonly otpService: OtpService,
        @InjectQueue('sms') private smsQueue: Queue,
        @InjectEntityManager() private readonly manager: EntityManager,
    ) { }

    async execute(dto: UserRegisterByMobileNoConsumeOtpCommandDTO): Promise<any> {
        logger.debug(`command execution started`, { ...dto });
        logger.silly(`command dto`, dto);
        dto = await transformAndValidate(UserRegisterByMobileNoConsumeOtpCommandDTO, dto);

        // verify sms otp
        const otp = await this.otpService.verifyAndConsumeSmsOtpOrFail(dto.otpUuid, dto.mobileNumber, 'USER_REGISTER_BY_MOBILE', dto.token);

        // create new user
        const user = this.manager.create(User);
        const payload = otp.actionPayload as UserRegisterByMobileNoSendOtpDTO;
        user.mobileNumber = payload.mobileNumber;
        user.isMobileNumberVerified = true;
        user.mobileVerifiedDate = new Date();
        user.displayName = payload.displayName;
        user.legalName = payload.displayName;
        user.password = payload.password;
        user.attributes = {};
        await this.manager.save(user);

        // send welcome message
        await this.smsQueue.add('sendSms', {
            mobileNumber: user.mobileNumber,
            textMessage: 'مرحبا بك ، تم تسجيل حسابك بنجاح',
        });

        // TODO: should delete consumed tokens next day
        return CommandResponse.success('تم التسجيل بنجاح', 'REGISTER_SUCCESS', {})
    }

    @Post(topic)
    async httpHandler(@Body() body: UserRegisterByMobileNoConsumeOtpCommandDTO): Promise<any> {
        return this.execute(body)
    }
}