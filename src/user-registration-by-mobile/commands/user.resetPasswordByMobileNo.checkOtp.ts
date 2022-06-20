import { Body, Controller, Get, HttpException, HttpService, Inject, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { InjectEntityManager } from '@nestjs/typeorm';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDefined } from 'class-validator';
import { giveMeClassLogger } from 'src/common/winston.logger';
import { CommandError } from 'src/cqm/lib/command-error';
import { CommandResponse } from 'src/cqm/lib/command-response';
import { OtpService } from 'src/otp/services/otp.service';
import { EntityManager } from 'typeorm';

const topic = "user.resetPasswordByMobileNo.checkOtp"
const logger = giveMeClassLogger(topic);

export class UserResetPasswordByMobileNoCheckOtpCommandDTO {
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
export class UserResetPasswordByMobileNoCheckOtpCommand {
    constructor(
        private readonly otpService: OtpService,
        @InjectEntityManager() private readonly manager: EntityManager
    ) { }

    async execute(dto: UserResetPasswordByMobileNoCheckOtpCommandDTO): Promise<any> {
        logger.debug(`command execution started`)
        logger.silly(`command dto`, dto)
        dto = await transformAndValidate(UserResetPasswordByMobileNoCheckOtpCommandDTO, dto)
        await this.otpService.verifySmsOtpOrFail(dto.otpUuid, dto.mobileNumber, 'USER_RESET_PASSWORD_BY_MOBILE', dto.token);
        return CommandResponse.success('OTP is valid', 'VALID');

    }

    @Post(topic)
    async httpHandler(@Body() body: UserResetPasswordByMobileNoCheckOtpCommandDTO): Promise<any> {
        return this.execute(body)
    }
}