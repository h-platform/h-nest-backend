import { Body, Controller, Get, HttpException, HttpService, Inject, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { InjectEntityManager } from '@nestjs/typeorm';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDefined } from 'class-validator';
import { giveMeClassLogger } from 'src/common/winston.logger';
import { CommandError } from 'src/cqm/lib/command-error';
import { CommandResponse } from 'src/cqm/lib/command-response';
import { OtpService } from 'src/otp/services/otp.service';

const topic = "user.registerByMobileNo.checkOtp"
const logger = giveMeClassLogger(topic);

export class UserRegisterByMobileNoCheckOTPCommandDTO {
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
export class UserRegisterByMobileNoCheckOtpCommand {
    constructor(
        private readonly otpService: OtpService
    ) { }

    async execute(dto: UserRegisterByMobileNoCheckOTPCommandDTO): Promise<any> {
        logger.debug(`command execution started`)
        logger.silly(`command dto`, dto)
        dto = await transformAndValidate(UserRegisterByMobileNoCheckOTPCommandDTO, dto)
        await this.otpService.verifySmsOtpOrFail(dto.otpUuid, dto.mobileNumber, 'USER_REGISTER_BY_MOBILE', dto.token)
        return CommandResponse.success('OTP is valid', 'OTP_VALID');
    }

    @Post(topic)
    async httpHandler(@Body() body: UserRegisterByMobileNoCheckOTPCommandDTO): Promise<any> {
        return this.execute(body)
    }
}