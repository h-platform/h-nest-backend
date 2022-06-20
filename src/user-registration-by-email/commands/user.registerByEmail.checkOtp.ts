import { Body, Controller, Get, HttpException, HttpService, Inject, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { InjectEntityManager } from '@nestjs/typeorm';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDefined } from 'class-validator';
import { giveMeClassLogger } from 'src/common/winston.logger';
import { CommandError } from 'src/cqm/lib/command-error';
import { CommandResponse } from 'src/cqm/lib/command-response';
import { OTP } from 'src/otp/entities/otp.entity';
import { OtpService } from 'src/otp/services/otp.service';
import { EntityManager, Equal } from 'typeorm';

const topic = "user.registerByEmail.checkOtp"
const logger = giveMeClassLogger(topic);

export class UserRegisterByEmailCheckOTPCommandDTO {
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
export class UserRegisterByEmailCheckOtpCommand {
    constructor(
        @InjectEntityManager() private readonly manager: EntityManager
    ) { }

    async execute(dto: UserRegisterByEmailCheckOTPCommandDTO): Promise<any> {
        logger.debug(`command execution started`)
        logger.silly(`command dto`, dto)
        dto = await transformAndValidate(UserRegisterByEmailCheckOTPCommandDTO, dto)

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
        
        return CommandResponse.success('Email OTP is valid', 'OTP_VALID');
    }

    @Post(topic)
    async httpHandler(@Body() body: UserRegisterByEmailCheckOTPCommandDTO): Promise<any> {
        return this.execute(body)
    }
}