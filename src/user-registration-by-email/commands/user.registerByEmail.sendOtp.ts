import { Body, Controller, Get, HttpException, HttpService, Inject, Post, Query, Session } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { InjectEntityManager } from '@nestjs/typeorm';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDefined, IsString, Matches } from 'class-validator';
import { giveMeClassLogger } from 'src/common/winston.logger';
import { CommandResponse } from '@h-platform/cqm';
import { EntityManager, Equal } from 'typeorm';
import { CommandError } from '@h-platform/cqm';
import { OtpService } from 'src/otp/services/otp.service';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { OTP } from 'src/otp/entities/otp.entity';
import * as uuid from 'uuid';
import * as nodemailer from 'nodemailer';

const topic = "user.registerByEmail.sendOtp"
const logger = giveMeClassLogger(topic);

export class UserRegisterByEmailSendOtpDTO {
    @ApiProperty()
    @IsDefined()
    @IsString()
    email: string;

    @ApiProperty()
    @IsDefined()
    @IsString()
    @Matches(/\d+/, { message: 'Mobile number must be only numbers' })
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
export class UserRegisterByEmailSendOtpCommand {
    constructor(
        private readonly otpService: OtpService,
        @InjectEntityManager() private readonly manager: EntityManager,
    ) { }

    async execute(dto: UserRegisterByEmailSendOtpDTO): Promise<any> {
        logger.debug(`command execution started`)
        logger.silly(`command dto`, dto)
        dto = await transformAndValidate(UserRegisterByEmailSendOtpDTO, dto)

        if (dto.password != dto.password2) {
            throw new CommandError('Passwords do not match', 'ERR_PASSWORDS_NO_MATCH')
        }

        // check email is not registered
        const user = await this.manager.findOne(User, { where: { email: Equal(dto.email) } });
        if (user) {
            throw new CommandError('Email already exists', 'ERR_EMAIL_EXISTS')
        }

        // hash user password
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        dto.password = hashedPassword;

        // create and save otp
        const otp = this.manager.create(OTP);
        otp.actionPayload = dto;
        otp.actionType = 'USER_REGISTER_BY_EMAIL';
        otp.email = dto.email;
        otp.otpToken = uuid.v4() + uuid.v4() + uuid.v4();
        otp.otpUuid = uuid.v4();
        otp.otpType = 'EMAIL';
        otp.isConsumed = false;
        await this.manager.save(otp);
        
        // send email otp
        var transporter = nodemailer.createTransport({
            pool: true,
            host: "mangomas.com",
            port: 465,
            secure: true, // use TLS
            auth: {
                user: "no-reply@mangomas.com",
                pass: "Salam4All!Welcome2hp!",
            },
        });

        var mailOptions = {
            from: 'no-reply@mangomas.com',
            to: dto.email,
            subject: 'Mango MAS - New Account Registration ',
            html: `
                <h1>Welcome</h1>
                <p>Thank you for registration at mangomas.com, leading erp for simple enterprize</p>
                <p>
                    Please follow this link for account registration 
                    <a href='https://mangomas.com/api/umm/commands/accountRegistration.consumeOtp?uuid=${otp.otpUuid}&email=${otp.email}&token=${otp.otpToken}' />
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

        return CommandResponse.success('OTP Sent Successfully', 'OTP_SENT')
    }

    @Post(topic)
    async httpHandler(@Body() body: UserRegisterByEmailSendOtpDTO, @Session() session): Promise<any> {
        const catpchaText = (session.captcha || {})['user-register-email'];
        logger.info(`comparing body capatcha ${body.captcha} with session ${catpchaText}`, { sessionCaptcha: session.captcha });
        if (body.captcha !== catpchaText) {
            throw new CommandError('رمز التحقق غير مطابق', 'WRONG_CAPTCHA_PURPOSE');
        }
        delete session.captcha['user-register'];
        return this.execute(body)
    }
}
