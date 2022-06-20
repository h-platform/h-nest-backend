import { Res, Session, UseGuards } from '@nestjs/common';
import { Body, Controller, Get, HttpException, HttpService, Inject, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDefined } from 'class-validator';
import { giveMeClassLogger } from 'src/common/winston.logger';
import { CommandResponse } from 'src/cqm/lib/command-response';
import { Response } from 'express';
var svgCaptcha = require('svg-captcha');

const topic = "user.createCaptcha"
const logger = giveMeClassLogger(topic);

export class UserCreateCaptchaCommandDTO {
}

@ApiTags('captcha')
@ApiBearerAuth()
@Controller('api/captcha/commands')
export class UserCreateCaptchaCommand {
    constructor(
    ) { }

    async execute(dto: UserCreateCaptchaCommandDTO): Promise<any> {
        logger.debug(`command execution started`)
        logger.silly(`command dto`, dto)
        dto = await transformAndValidate(UserCreateCaptchaCommandDTO, dto)
        return {};
    }

    @Get(topic)
    async httpHandler(@Session() session, @Res() res: Response, @Query('resource') resource: string): Promise<any> {
        const captcha = svgCaptcha.create();
        session.captcha = session.captcha || {};
        session.captcha[resource] = captcha.text;
        
        res.type('svg');
        res.status(200).send(captcha.data);
    }
}
