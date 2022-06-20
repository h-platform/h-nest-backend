import { Body, Controller, Get, HttpException, HttpService, Inject, Post, Query, Request } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDefined, IsInt, IsString, Matches } from 'class-validator';
import { giveMeClassLogger } from 'src/common/winston.logger';
import { EntityManager, Equal } from 'typeorm';
import { CommandResponse } from 'src/cqm/lib/command-response';
import { JWTPayload } from '../interfaces/jwt-payload.dto';
import { User } from 'src/user/entities/user.entity';
import { JWT_SECRET, SERVICE_NAME } from 'src/constants';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { CommandError } from 'src/cqm/lib/command-error';
import * as bcrypt from 'bcryptjs';

var jwt = require('jsonwebtoken');

const topic = "auth.loginByEmail"
const logger = giveMeClassLogger(topic);

export class UserLoginByEmailCommandDTO {
    @IsDefined()
    @IsString()
    @ApiProperty()
    email: string;

    @IsDefined()
    @IsString()
    @ApiProperty()
    password: string;
}

@ApiTags('auth')
@ApiBearerAuth()
@Controller('api/auth/commands')
export class UserLoginByEmailCommand {
    constructor(
        @InjectEntityManager() private readonly manager: EntityManager
    ) { }

    async execute(dto: UserLoginByEmailCommandDTO): Promise<any> {
        logger.debug(`command execution started`)
        logger.silly(`command dto`, dto)
        dto = await transformAndValidate(UserLoginByEmailCommandDTO, dto);

        // find user
        const user = await this.manager.findOne(User, {
            where: { email: Equal(dto.email) }
        })
        
        // check user exists
        if (!user) {
            throw new CommandError('Wrong username or password', 'WRONG_CREDENTIALS');
        }
        
        // check email verified
        if (!user.isEmailVerified) {
            throw new CommandError('Cannot log in with email, email is not verifired', 'NOT_VERIFIED_EMAIL');
        }

        const [{ password }] = await this.manager.query('SELECT password FROM um_user WHERE id = ?', [user.id]);
        const isPasswordMatching = await bcrypt.compare(dto.password, password);
        if (!isPasswordMatching) {
            throw new CommandError('Wrong password or username', 'WRONG_CREDENTIALS');
        }

        // preparing the payload
        const jwtPayload: JWTPayload = {
            userId: user.id,
            displayName: user.displayName,
            mobileNumber: user.mobileNumber,
            email: user.email,
            roles: [],
            grants: [],
        };

        // generate JWT token
        const jwtToken = jwt.sign(jwtPayload, JWT_SECRET, { algorithm: 'HS256', expiresIn: '12h', audience: SERVICE_NAME, issuer: SERVICE_NAME });

        return CommandResponse.success('Login success', 'LOGIN_SUCCESS', {
            token: jwtToken,
            user: jwtPayload,
        });
    }

    @Post(topic)
    async httpHandler(@Body() body: UserLoginByEmailCommandDTO): Promise<any> {
        return this.execute(body)
    }
}