import { Body, Controller, Get, HttpException, HttpService, Inject, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { InjectEntityManager } from '@nestjs/typeorm';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDefined, IsString, Matches } from 'class-validator';
import { UserValue } from 'src/authentication/decorators/user.decorator';
import { giveMeClassLogger } from 'src/common/winston.logger';
import { CommandError } from 'src/cqm/lib/command-error';
import { CommandResponse } from 'src/cqm/lib/command-response';
import { OTP } from 'src/otp/entities/otp.entity';
import { OtpService } from 'src/otp/services/otp.service';
import { EntityManager, Equal } from 'typeorm';
import * as uuid from 'uuid';
import * as nodemailer from 'nodemailer';

const topic = "user.resetPasswordByEmail.sendOtp"
const logger = giveMeClassLogger(topic);

export class UserResetPasswordByEmailSendOtpDTO {
    @ApiProperty()
    @IsDefined()
    @IsString()
    email: string;
}

@ApiTags('umm')
@ApiBearerAuth()
@Controller('api/umm/commands')
export class UserResetPasswordByEmailSendOtpCommand {
    constructor(
        @InjectEntityManager() private readonly manager: EntityManager,
    ) { }

    async execute(dto: UserResetPasswordByEmailSendOtpDTO): Promise<any> {
        logger.debug(`command execution started`)
        logger.silly(`command dto`, dto)
        dto = await transformAndValidate(UserResetPasswordByEmailSendOtpDTO, {})

        // check google capatcha token

        // check mobile number exists
        const user = await this.manager.findOne(UserValue, { where: { email: Equal(dto.email) } })
        if (!user) {
            throw new CommandError('Mobile number not exists', 'ERR_MOBILE_NO_NOT_FOUND')
        }

        // create and save otp
        const otp = this.manager.create(OTP);
        otp.actionPayload = dto;
        otp.actionType = 'USER_RESET_PASSWORD_BY_EMAIL';
        otp.email = dto.email;
        otp.otpToken = uuid.v4() + uuid.v4() + uuid.v4();
        otp.otpUuid = uuid.v4();
        otp.otpType = 'EMAIL';
        otp.isConsumed = false;
        await this.manager.save(otp);
        
        // send email otp
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'info.mangomas@gmail.com',
                pass: 'Salam4All!'
            }
        });

        var mailOptions = {
            from: 'info.mangomas@gmail.com',
            to: dto.email,
            subject: 'Mango MAS - Password Reset',
            html: `
                <h1>Welcome</h1>
                <p>
                    We received a request to reset your password.
                </p>
                <p>
                    Please follow this link to reset your password
                    <a href='https://mangomas.com/api/umm/commands/user.resetPasswordByEmail.consumeOtp?uuid=${otp.otpUuid}&email=${otp.email}&token=${otp.otpToken}' />
                </p>
            `
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        return CommandResponse.success('تم ارسال رمز التحقق لإعادة ضبط كلمة المرور', 'OK', { })
    }

    @Post(topic)
    async httpHandler(@Body() body: UserResetPasswordByEmailSendOtpDTO): Promise<any> {
        return this.execute(body)
    }
}
