import { Aggregate } from "../entities/aggregate.entity";
import { EntityManager, In } from "typeorm";

export const translateOne = async (manager: EntityManager, aggregates: Aggregate[], property: string, aggregateType: string) => {
    const ids = aggregates.map(a => a.state[property]);
    const targetedAggregates = await manager.find(Aggregate, { where: { id: In(ids.length > 0 ? ids : []) } });
    for (const a of aggregates) {
        a.state[property + '$'] = targetedAggregates.find((v) => v.id === a.state[property])
    }
}

export const translateMany = async (manager: EntityManager, aggregates: Aggregate[], property: string, aggregateType: string) => {
    const ids = [];

    aggregates.forEach(a => {
        const propertyValue: string[] = a.state[property] // should be array of strings; string[]
        if (propertyValue.length) { //is array
            propertyValue.forEach(v => {
                ids.push(v);
            });
        }
    })

    const fetchedAggregates = await manager.find(Aggregate, { where: { id: In(ids.length > 0 ? ids : []) } });

    for (const a of aggregates) {
        a.state[property + '$'] = a.state[property].map((v) => fetchedAggregates.find((f) => f.id === v))
    }
}
