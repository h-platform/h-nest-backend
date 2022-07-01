import { InjectEntityManager } from '@nestjs/typeorm';
import { MoreThan, EntityManager, In } from 'typeorm';
import { IsEmpty, IsDefined, IsOptional, IsNotEmpty } from 'class-validator';
import { transformAndValidate } from 'class-transformer-validator';
import { Aggregate } from '../entities/aggregate.entity';
import { translateOne, translateMany } from '../lib/piplines';

export class AggregateFindOneQueryDTO {
    @IsDefined()
    @IsNotEmpty()
    id: string;

    @IsDefined()
    @IsNotEmpty()
    aggregateType: string;

    @IsOptional()
    pipeline: any;
}

export class AggregateFindOneQuery {
    endpoint = 'aggregate.findOne';

    constructor(
        @InjectEntityManager() private readonly manager: EntityManager,
    ) { }

    async execute(payload: AggregateFindOneQueryDTO): Promise<Aggregate> {
        const dto = await transformAndValidate(AggregateFindOneQueryDTO, payload);
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
