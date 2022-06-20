import { Body, Controller, Get, HttpException, HttpService, Inject, Post, Query, Session } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { InjectEntityManager } from '@nestjs/typeorm';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDefined, IsString, Matches } from 'class-validator';
import { giveMeClassLogger } from 'src/common/winston.logger';
import { CommandError } from 'src/cqm/lib/command-error';
import { CommandResponse } from 'src/cqm/lib/command-response';
import { OtpService } from 'src/otp/services/otp.service';
import { User } from 'src/user/entities/user.entity';
import { EntityManager, Equal } from 'typeorm';

const topic = "user.resetPasswordByMobileNo.sendOtp"
const logger = giveMeClassLogger(topic);

export class UserResetPasswordByMobileNoSendOtpDTO {
    @ApiProperty()
    @IsDefined()
    @IsString()
    @Matches(/\d+/)
    mobileNumber: string;
    
    @ApiProperty()
    @IsDefined()
    @IsString()
    captcha: string;
}

@ApiTags('umm')
@ApiBearerAuth()
@Controller('api/umm/commands')
export class UserResetPasswordByMobileNoSendOtpCommand {
    constructor(
        private readonly otpService: OtpService,
        @InjectEntityManager() private readonly manager: EntityManager,
    ) { }

    async execute(dto: UserResetPasswordByMobileNoSendOtpDTO): Promise<any> {
        logger.debug(`command execution started`)
        logger.silly(`command dto`, dto)
        dto = await transformAndValidate(UserResetPasswordByMobileNoSendOtpDTO, dto)

        // check google capatcha token

        // check mobile number exists
        const user = await this.manager.findOne(User, { where: { mobileNumber: Equal(dto.mobileNumber) } })
        if (!user) {
            throw new CommandError('Mobile number not exists', 'ERR_MOBILE_NO_NOT_FOUND')
        }

        // send sms otp
        const { otpUuid } = await this.otpService.sendSmsOtp(dto.mobileNumber, 'رمز التحقق لإعادة ضبط كلمة المرور هو :OTP', 'USER_RESET_PASSWORD_BY_MOBILE', dto)

        return CommandResponse.success('تم ارسال رمز التحقق لإعادة ضبط كلمة المرور', 'OK', { otpUuid })
    }

    @Post(topic)
    async httpHandler(@Body() body: UserResetPasswordByMobileNoSendOtpDTO, @Session() session): Promise<any> {
        const catpchaText = (session.captcha||{})['reset-password'];
        if (body.captcha !== catpchaText) {
            throw new CommandError('رمز التحقق غير مطابق', 'WRONG_CAPTCHA_PURPOSE');
        }
        delete session.captcha['reset-password'];
        return this.execute(body)
    }
}
