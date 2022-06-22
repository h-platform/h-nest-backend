import { UseGuards } from '@nestjs/common';
import { Body, Controller, Get, HttpException, HttpService, Inject, Post, Query, Request } from '@nestjs/common';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDefined } from 'class-validator';
import { JWTGuard } from 'src/authentication/guards/jwt.guard';
import { giveMeClassLogger } from 'src/common/winston.logger';
import { CommandResponse } from '@h-platform/cqm';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JWTTokenValue } from '../decorators/jwt-token.decorator';
import { UserValue } from '../decorators/user.decorator';
import { JWTPayload } from '../interfaces/jwt-payload.dto';
var jwt = require('jsonwebtoken');

const topic = "auth.syncSession"
const logger = giveMeClassLogger(topic);

export class UserSyncSessionCommandDTO {
    @IsDefined()
    userId: number;
}


@ApiTags('auth')
@ApiBearerAuth()
@UseGuards(JWTGuard)
@Controller('api/auth/commands')
export class UserSyncSessionCommand {
    constructor(
    ) { }

    async execute(dto: UserSyncSessionCommandDTO, token: string, user: JWTPayload): Promise<any> {
        logger.debug(`command execution started`)
        logger.silly(`command dto`, dto)
        dto = await transformAndValidate(UserSyncSessionCommandDTO, dto)

        // jwt guard passed means jwt token ok
        return CommandResponse.success('Sync Ok', 'SYNC_SUCCESS', {
            token,
            user
        });
    }

    @Post(topic)
    async httpHandler(@Body() body: UserSyncSessionCommandDTO, @JWTTokenValue() token: string, @UserValue() user: JWTPayload): Promise<any> {
        return this.execute({ userId: user.userId }, token, user);
    }
}
