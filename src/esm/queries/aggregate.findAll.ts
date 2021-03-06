import { InjectEntityManager } from '@nestjs/typeorm';
import { MoreThan, EntityManager, In } from 'typeorm';
import { IsEmpty, IsDefined, IsOptional, IsNotEmpty } from 'class-validator';
import { transformAndValidate } from 'class-transformer-validator';
import { Aggregate } from '../entities/aggregate.entity';
import { translateOne, translateMany } from '../lib/piplines';
import { AggregateType } from '../interfaces/aggregate-event.interface';

export class AggregateFindAllQueryDTO {
    @IsDefined()
    @IsNotEmpty()
    aggregateType: AggregateType;

    @IsOptional()
    pipeline: any
}

export class AggregateFindAllQuery {
    endpoint = 'aggregate.findAll';

    constructor(
        @InjectEntityManager() private readonly manager: EntityManager,
    ) { }

    async execute(payload: AggregateFindAllQueryDTO): Promise<Aggregate[]> {
        const dto = await transformAndValidate(AggregateFindAllQueryDTO, payload);
        const aggregates = await this.manager.find(Aggregate, { where: { aggregateType: dto.aggregateType } });
        if (dto.pipeline && dto.pipeline.length > 0) {
            for (const step of dto.pipeline) {
                if (step.op === 'translateOne') {
                    await translateOne(this.manager, aggregates, step.property, step.aggregateType)
                }
                if (step.op === 'translateMany') {
                    await translateMany(this.manager, aggregates, step.property, step.aggregateType)
                }
            }
        }
        return aggregates;
    }
}
