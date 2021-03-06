import { InjectEntityManager } from '@nestjs/typeorm';
import { MoreThan, EntityManager, In } from 'typeorm';
import { IsEmpty, IsDefined, IsOptional, IsNotEmpty } from 'class-validator';
import { transformAndValidate } from 'class-transformer-validator';
import { Aggregate } from '../entities/aggregate.entity';
import { translateOne, translateMany } from '../lib/piplines';

export class AggregateFindByIdsQueryDTO {
    @IsDefined()
    ids: string[];

    @IsDefined()
    @IsNotEmpty()
    aggregateType: string;

    @IsOptional()
    pipeline: any;
}

export class AggregateFindByIdsQuery {
    endpoint = 'aggregate.findByIds';

    constructor(
        @InjectEntityManager() private readonly manager: EntityManager,
    ) { }

    async execute(payload: AggregateFindByIdsQueryDTO): Promise<Aggregate[]> {
        const dto = await transformAndValidate(AggregateFindByIdsQueryDTO, payload);
        if (dto.ids && Array.isArray(dto.ids) && dto.ids.length === 0) return [];
        const aggregates = await this.manager.find(Aggregate, { where: { id: In(dto.ids) } });
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
