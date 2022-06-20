import { Body, Controller, Get, HttpException, HttpService, Inject, Param, Post, Query, UseGuards } from '@nestjs/common';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDefined, IsInt, IsOptional, IsString } from 'class-validator';
import { giveMeClassLogger } from 'src/common/winston.logger';
import { join } from 'path';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { CommandError } from 'src/cqm/lib/command-error';
import { JWTGuard } from 'src/authentication/guards/jwt.guard';

const mysql = require("mysql2")
const puresql = require("puresql")

const topic = "admin.query.:queryName"
const logger = giveMeClassLogger(topic);

import { createConnection, getConnection } from 'typeorm';
// Create a connection the adapter will use
const connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'admin',
    password: '1234',
    database: 'h-database'
});

// Create the adapter
const adapter = puresql.adapters.mysql(connection);

// Load our queries
const queries = puresql.loadQueries(join("src", "user_module","sql", "admin.sql"));

export class AdminQueryQueryDTO {
    @IsOptional()
    @ApiProperty()
    args: any;

    @IsDefined()
    @IsInt()
    userId: number;
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JWTGuard)
@Controller('api/admin/queries')
export class AdminQueryQuery {

    constructor(
    ) { }

    async execute(dto: AdminQueryQueryDTO, queryName: string): Promise<any> {
        logger.debug(`query execution started`, dto)
        logger.silly(`query dto`, dto)
        dto = await transformAndValidate(AdminQueryQueryDTO, dto);
        
        // const conn = await createConnection();
        // conn.driver

        if (queries[queryName] instanceof Function) {
            const rows = await queries[queryName](dto.args || {}, adapter);
            return rows;
        } else {
            throw new CommandError(`query ${queryName} not found`, 'NOT_FOUND');
        }
    }

    @Post(topic)
    async httpHandler(@Body() body: AdminQueryQueryDTO, @Param('queryName') queryName: string): Promise<any> {
        return this.execute({ ...body}, queryName);
    }
}
