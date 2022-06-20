import { InjectEntityManager } from '@nestjs/typeorm';
import { QueryInterface } from 'src/cqm/interfaces/query.interface';
import { MoreThan, EntityManager, In } from 'typeorm';
import { IsEmpty, IsDefined, IsOptional, IsNotEmpty } from 'class-validator';
import { transformAndValidate } from 'class-transformer-validator';
import { Aggregate } from '../entities/aggregate.entity';
import { translateOne, translateMany } from '../lib/piplines';

export class QueryDTO {
    @IsDefined()
    @IsNotEmpty()
    id: string;

    @IsDefined()
    @IsNotEmpty()
    aggregateType: string;

    @IsOptional()
    pipeline: any;
}

export class AggregateFindOneQuery implements QueryInterface {
    endpoint = 'aggregate.findOne';

    constructor(
        @InjectEntityManager() private readonly manager: EntityManager,
    ) { }

    async execute(payload: QueryDTO): Promise<Aggregate> {
        const dto = await transformAndValidate(QueryDTO, payload);
        const aggregate = await this.manager.findOneOrFail(Aggregate, { where: { id: dto.id } });
        if (dto.pipeline && dto.pipeline.length > 0) {
            for (const step of dto.pipeline) {
                if (step.op === 'translateOne') {
                    await translateOne(this.manager, [aggregate], step.property, step.aggregateType)
                }
                if (step.op === 'translateMany') {
                    await translateMany(this.manager, [aggregate], step.property, step.aggregateType)
                }
            }
        }
        return aggregate;
    }
}
