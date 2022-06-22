import { Body, Controller, Get, HttpException, HttpService, Inject, Post, Query, Request } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDefined, IsInt, IsString, Matches } from 'class-validator';
import { giveMeClassLogger } from 'src/common/winston.logger';
import { EntityManager, Equal } from 'typeorm';
import { CommandResponse } from '@h-platform/cqm';
import { JWTPayload } from '../interfaces/jwt-payload.dto';
import { User } from 'src/user/entities/user.entity';
import { JWT_SECRET, SERVICE_NAME } from 'src/constants';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { CommandError } from '@h-platform/cqm';
import * as bcrypt from 'bcryptjs';
import { UnboundEventService } from 'src/esm/services/unbound-event.service';

var jwt = require('jsonwebtoken');

const topic = "auth.loginByMobileNumber"
const logger = giveMeClassLogger(topic);

export class UserLoginByMobileNoCommandDTO {
    @IsDefined()
    @IsString()
    @ApiProperty()
    @Matches(/^(249\d{9,9})$/)
    mobileNumber: string;

    @IsDefined()
    @IsString()
    @ApiProperty()
    password: string;
}

@ApiTags('auth')
@ApiBearerAuth()
@Controller('api/auth/commands')
export class UserLoginByMobileNoCommand {
    constructor(
        private readonly unboundEventService: UnboundEventService,
        @InjectEntityManager() private readonly manager: EntityManager
    ) { }

    async execute(dto: UserLoginByMobileNoCommandDTO): Promise<any> {
        logger.debug(`command execution started`)
        logger.silly(`command dto`, dto)
        dto = await transformAndValidate(UserLoginByMobileNoCommandDTO, dto);

        // login user
        const user = await this.manager.findOne(User, {
            relations: [],
            where: { mobileNumber: Equal(dto.mobileNumber) }
        })

        if (!user) {
            await this.unboundEventService.createNewEvent("EVENT", '', 'user.logIn.userNotFoundError', { mobileNo: dto.mobileNumber });
            throw new CommandError('Wrong username or password', 'WRONG_CREDENTIALS');
        }

        // check email verified
        if (!user.isMobileNumberVerified) {
            await this.unboundEventService.createNewEvent("EVENT", String(user.id), 'user.logIn.mobileNotVerified', { displayName: user.displayName })
            throw new CommandError('Cannot log in with mobile number, number is not verifired', 'NOT_VERIFIED_MOBILE_NUMBER');
        }

        const [{ password }] = await this.manager.query('SELECT password FROM um_user WHERE id = ?', [user.id]);
        const isPasswordMatching = await bcrypt.compare(dto.password, password);
        if (!isPasswordMatching) {
            await this.unboundEventService.createNewEvent("EVENT", String(user.id), 'user.logIn.wrongPassword', { displayName: user.displayName })
            throw new CommandError('Wrong password or username', 'WRONG_CREDENTIALS');
        }

        // preparing the payload
        const jwtPayload: JWTPayload = {
            userId: user.id,
            displayName: user.displayName,
            mobileNumber: user.mobileNumber,
            email: user.email,
            roles: user.roles,
            grants: user.grants,
        };

        // generate JWT token
        const jwtToken = jwt.sign(jwtPayload, JWT_SECRET, { algorithm: 'HS256', expiresIn: '6h', audience: SERVICE_NAME, issuer: SERVICE_NAME });

        // update user last login
        user.lastLogin = new Date();
        await this.manager.save(user);
        await this.unboundEventService.createNewEvent("EVENT", String(user.id), 'user.logIn.success', { displayName: user.displayName })

        return CommandResponse.success('Login success', 'LOGIN_SUCCESS', {
            token: jwtToken,
            user: jwtPayload,
        });
    }

    @Post(topic)
    async httpHandler(@Body() body: UserLoginByMobileNoCommandDTO, Request): Promise<any> {
        return this.execute(body)
    }
}