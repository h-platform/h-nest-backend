import { Body, Controller, Get, HttpException, HttpService, Inject, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InjectEntityManager } from '@nestjs/typeorm';
import { transformAndValidate } from 'class-transformer-validator';
import { giveMeClassLogger } from 'src/common/winston.logger';
import { EntityManager } from 'typeorm';
import { Contact } from '../entities/contact.entity';

const topic = "contact.findAll"
const logger = giveMeClassLogger(topic);

export class ContactFindAllQueryDTO {
    keyword: string;
    parentContactId: number;
    contactType: 'COMPANY' | 'INDIVIDUAL';
    contactRole: string;
}

@ApiTags('contacts')
@ApiBearerAuth()
@Controller('api/contacts/queries')
export class ContactFindAllQuery {
    constructor(
        @InjectEntityManager() private readonly entityManager: EntityManager
    ) { }

    async execute(dto: ContactFindAllQueryDTO): Promise<any> {
        logger.debug(`query execution started`)
        logger.silly(`query dto`, dto)
        dto = await transformAndValidate(ContactFindAllQueryDTO, dto)
        const query = this.entityManager.createQueryBuilder(Contact, 'contact')
            .leftJoinAndSelect('contact.region', 'region');
            
        if (dto.keyword && dto.keyword !== '') {
            query.andWhere('(contact.contactName LIKE :keyword OR contact.mobileNo LIKE :keyword or region.regionNameArabic LIKE :keyword)', { keyword: `%${dto.keyword}%` });
        }
        if (dto.parentContactId) {
            query.andWhere('contact.parentContactId = :parentContactId', { parentContactId: dto.parentContactId });
        }
        if (dto.contactType) {
            query.andWhere('contact.contactType = :contactType', { contactType: dto.contactType });
        }
        if (dto.contactRole) {
            query.andWhere(`JSON_CONTAINS(contact.roles, :contactRole, '$')`, { contactRole: `"${dto.contactRole}"` });
        }

        return query.getMany();
    }

    @Post(topic)
    async httpHandler(@Body() body: ContactFindAllQueryDTO): Promise<any> {
        return this.execute(body)
    }
}