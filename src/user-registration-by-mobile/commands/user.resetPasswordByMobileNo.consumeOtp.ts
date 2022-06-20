import { Body, Controller, Get, HttpException, HttpService, Inject, Post, Query } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { transformAndValidate } from 'class-transformer-validator';
import { giveMeClassLogger } from 'src/common/winston.logger';
import { CommandError } from 'src/cqm/lib/command-error';
import { EntityManager, Equal } from 'typeorm';
import { CommandResponse } from 'src/cqm/lib/command-response';
import { IsDefined } from 'class-validator';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';
import { OtpService } from 'src/otp/services/otp.service';
import { User } from 'src/user/entities/user.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

const topic = "user.resetPasswordByMobileNo.consumeOtp"
const logger = giveMeClassLogger(topic);

export class UserResetPasswordByMobileNoConsumeOtpCommandDTO {
    @ApiProperty()
    @IsDefined()
    otpUuid: string;

    @ApiProperty()
    @IsDefined()
    mobileNumber: string;

    @ApiProperty()
    @IsDefined()
    token: string;

    @ApiProperty()
    @IsDefined()
    password: string;
}

@ApiTags('umm')
@ApiBearerAuth()
@Controller('api/umm/commands')
export class UserResetPasswordByMobileNoConsumeOtpCommand {
    constructor(
        private readonly otpService: OtpService,
        @InjectQueue('sms') private smsQueue: Queue,
        @InjectEntityManager() private readonly manager: EntityManager
    ) { }

    async execute(dto: UserResetPasswordByMobileNoConsumeOtpCommandDTO): Promise<any> {
        logger.debug(`command execution started`, { ...dto });
        logger.silly(`command dto`, dto);
        dto = await transformAndValidate(UserResetPasswordByMobileNoConsumeOtpCommandDTO, dto);

        // find otp
        await this.otpService.verifyAndConsumeSmsOtpOrFail(dto.otpUuid, dto.mobileNumber, 'USER_RESET_PASSWORD_BY_MOBILE', dto.token);

        // find user
        let user = await this.manager.findOneOrFail(User, { where: { mobileNumber: Equal(dto.mobileNumber) } });

        // hash user password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // save user
        user.password = hashedPassword;
        await this.manager.save(user);

        // send welcome message
        await this.smsQueue.add('sendSms', {
            mobileNumber: user.mobileNumber,
            textMessage: 'تم إعادة ضبط كلمة المرور الخاصة بك',
        });

        return CommandResponse.success('تم إعادة ضبط كلمة المرور بنجاح', 'OTP_CONSUMED', {})
    }

    @Post(topic)
    async httpHandler(@Body() body: UserResetPasswordByMobileNoConsumeOtpCommandDTO): Promise<any> {
        return this.execute(body)
    }
}