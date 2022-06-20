import { Body, Controller, Get, HttpException, HttpService, Inject, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { transformAndValidate } from 'class-transformer-validator';
import { giveMeClassLogger } from 'src/common/winston.logger';

const topic = "contact.findById"
const logger = giveMeClassLogger(topic);

export class ContactFindByIdQueryDTO {

}

@ApiTags('contacts')
@ApiBearerAuth()
@Controller('api/contacts/queries')
export class ContactFindByIdQuery {
    constructor(
    ) { }

    async execute(dto: ContactFindByIdQueryDTO): Promise<any> {
        logger.debug(`query execution started`)
        logger.silly(`query dto`, dto)
        dto = await transformAndValidate(ContactFindByIdQueryDTO, dto)
        throw new Error('Query Not Implemented')
        logger.debug(`query execution completed`)
    }

    @Post(topic)
    async httpHandler(@Body() body: ContactFindByIdQueryDTO): Promise<any> {
        return this.execute(body)
    }
}