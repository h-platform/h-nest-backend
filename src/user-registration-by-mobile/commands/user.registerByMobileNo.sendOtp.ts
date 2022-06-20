import { Body, Controller, Get, HttpException, HttpService, Inject, Post, Query, Session } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { InjectEntityManager } from '@nestjs/typeorm';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDefined, IsString, Matches } from 'class-validator';
import { giveMeClassLogger } from 'src/common/winston.logger';
import { CommandResponse } from 'src/cqm/lib/command-response';
import { EntityManager, Equal } from 'typeorm';
import { CommandError } from 'src/cqm/lib/command-error';
import { OtpService } from 'src/otp/services/otp.service';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcryptjs';

const topic = "user.registerByMobileNo.sendOtp"
const logger = giveMeClassLogger(topic);

export class UserRegisterByMobileNoSendOtpDTO {
    @ApiProperty()
    @IsDefined()
    @IsString()
    @Matches(/\d+/i, { message: 'Mobile number must be only numbers' })
    mobileNumber: string;

    @ApiProperty()
    @IsDefined()
    @IsString()
    displayName: string;

    @ApiProperty()
    @IsDefined()
    @IsString()
    password: string;

    @ApiProperty()
    @IsDefined()
    @IsString()
    password2: string;

    @ApiProperty()
    @IsDefined()
    @IsString()
    captcha: string;
}

@ApiTags('umm')
@ApiBearerAuth()
@Controller('api/umm/commands')
export class UserRegisterByMobileNoSendOtpCommand {
    constructor(
        private readonly otpService: OtpService,
        @InjectEntityManager() private readonly manager: EntityManager,
    ) { }

    async execute(dto: UserRegisterByMobileNoSendOtpDTO): Promise<any> {
        logger.debug(`command execution started`)
        logger.silly(`command dto`, dto)
        dto = await transformAndValidate(UserRegisterByMobileNoSendOtpDTO, dto)

        if (dto.password != dto.password2) {
            throw new CommandError('Passwords do not match', 'ERR_PASSWORDS_NO_MATCH')
        }

        // check mobileNumber is not registered
        const user = await this.manager.findOne(User, { where: { mobileNumber: Equal(dto.mobileNumber) } });
        if (user) {
            throw new CommandError('Mobile number already exists', 'ERR_MOBILE_NO_EXISTS')
        }

        // hash user password
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        dto.password = hashedPassword;
        delete dto.password2;
        delete dto.captcha;

        // send sms otp
        const {otpUuid} = await this.otpService.sendSmsOtp(dto.mobileNumber, 'رمز التحقق لتسجيل الحساب هو :OTP', 'USER_REGISTER_BY_MOBILE', dto)

        return CommandResponse.success('OTP Sent Successfully', 'OTP_SENT', { otpUuid })
    }

    @Post(topic)
    async httpHandler(@Body() body: UserRegisterByMobileNoSendOtpDTO, @Session() session): Promise<any> {
        const catpchaText = (session.captcha||{})['user-register'];
        if (body.captcha !== catpchaText) {
            throw new CommandError('رمز التحقق غير مطابق', 'WRONG_CAPTCHA_PURPOSE');
        }
        delete session.captcha['user-register'];
        return this.execute(body)
    }
}
