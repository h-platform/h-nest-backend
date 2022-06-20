import { Body, Controller, Get, HttpException, HttpService, Inject, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDefined, IsOptional } from 'class-validator';
import { InjectEntityManager } from '@nestjs/typeorm';
import { giveMeClassLogger } from 'src/common/winston.logger';
import { CommandResponse } from 'src/cqm/lib/command-response';
import { EntityManager } from 'typeorm';
import { Region } from '../entities/region.entity';

const topic = "region.findAll"
const logger = giveMeClassLogger(topic);

export class RegionFindAllQueryDTO {

}

@ApiTags('contacts')
@ApiBearerAuth()
@Controller('api/contacts/queries')
export class RegionFindAllQuery {
    constructor(
        @InjectEntityManager() private manager: EntityManager,
    ) { }

    async execute(dto: RegionFindAllQueryDTO): Promise<any> {
        logger.debug(`query execution started`)
        logger.silly(`query dto`, dto)
        dto = await transformAndValidate(RegionFindAllQueryDTO, dto)
        const rows = await this.manager.createQueryBuilder(Region, 'region')
            .orderBy('region.regionPath')
            .getMany();
        return CommandResponse.success('ok', 'SUCCESS', { rows })
    }

    @Post(topic)
    async httpHandler(@Body() body: RegionFindAllQueryDTO): Promise<any> {
        return this.execute(body)
    }
}