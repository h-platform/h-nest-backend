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
import { OTP } from 'src/otp/entities/otp.entity';

const topic = "user.resetPasswordByEmail.consumeOtp"
const logger = giveMeClassLogger(topic);

export class UserResetPasswordByEmailConsumeOtpCommandDTO {
    @ApiProperty()
    @IsDefined()
    otpUuid: string;

    @ApiProperty()
    @IsDefined()
    email: string;

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
export class UserResetPasswordByEmailConsumeOtpCommand {
    constructor(
        private readonly otpService: OtpService,
        @InjectEntityManager() private readonly manager: EntityManager
    ) { }

    async execute(dto: UserResetPasswordByEmailConsumeOtpCommandDTO): Promise<any> {
        logger.debug(`command execution started`, { ...dto });
        logger.silly(`command dto`, dto);
        dto = await transformAndValidate(UserResetPasswordByEmailConsumeOtpCommandDTO, dto);

        // load and verify token
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
        
        if (otp.actionType != 'USER_RESET_PASSWORD_BY_EMAIL') {
            throw new CommandError('Email verification wrong action type', 'OTP_WRONG_ACTION_TYPE');
        }
        
        if (otp.otpToken != dto.token) {
            throw new CommandError('Email verification token is incorrect', 'OTP_WRONG_TOKEN');
        }
        
        if (otp.isConsumed) {
            throw new CommandError('Email verification OTP is already consumed', 'OTP_CONSUMED');
        }

        // consume token
        otp.isConsumed = true;
        otp.consumedAt = new Date();
        await this.manager.save(otp);
        

        // find user
        let user = await this.manager.findOneOrFail(User, { where: { email: Equal(dto.email) } });

        // hash user password
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        
        // save user
        user.password = hashedPassword;
        await this.manager.save(user);

        return CommandResponse.success('تم إعادة ضبط كلمة المرور بنجاح', 'OTP_CONSUMED', {})
    }

    @Post(topic)
    async httpHandler(@Body() body: UserResetPasswordByEmailConsumeOtpCommandDTO): Promise<any> {
        return this.execute(body)
    }
}