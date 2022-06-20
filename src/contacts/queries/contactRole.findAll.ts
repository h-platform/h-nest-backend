import { Body, Controller, Get, HttpException, HttpService, Inject, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDefined, IsOptional } from 'class-validator';
import { InjectEntityManager } from '@nestjs/typeorm';
import { giveMeClassLogger } from 'src/common/winston.logger';
import { CommandResponse } from 'src/cqm/lib/command-response';
import { EntityManager } from 'typeorm';
import { ContactRole } from '../entities/contact-role.entity';

const topic = "contactRole.findAll"
const logger = giveMeClassLogger(topic);

export class ContactRoleFindAllQueryDTO {

}

@ApiTags('contacts')
@ApiBearerAuth()
@Controller('api/contacts/queries')
export class ContactRoleFindAllQuery {
    constructor(
        @InjectEntityManager() private manager: EntityManager,
    ) { }

    async execute(dto: ContactRoleFindAllQueryDTO): Promise<any> {
        logger.debug(`query execution started`)
        logger.silly(`query dto`, dto)
        dto = await transformAndValidate(ContactRoleFindAllQueryDTO, dto)
        const rows = await this.manager.createQueryBuilder(ContactRole, 'contactRole').getMany();
        return CommandResponse.success('ok', 'SUCCESS', { rows })
    }

    @Post(topic)
    async httpHandler(@Body() body: ContactRoleFindAllQueryDTO): Promise<any> {
        return this.execute(body)
    }
}