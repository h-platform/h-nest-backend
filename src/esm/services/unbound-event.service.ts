import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { UnboundEvent } from "../entities/unbound-event.entity";
import * as cron from 'cron-parser';
import { esmTimeSlotCron, esmRedisKey } from "../esm.constants";
import { giveMeClassLogger } from "src/common/winston.logger";
import { Cron } from '@nestjs/schedule';
import { RedisService } from "@liaoliaots/nestjs-redis";
import IORedis from "ioredis";

const topic = "esm.unboundEventService"
const logger = giveMeClassLogger(topic);

@Injectable()
export class UnboundEventService {
    private redisClient: IORedis.Redis;
    constructor(
        private readonly redisService: RedisService,
        @InjectEntityManager() private readonly manager: EntityManager
    ) {
        this.redisClient = this.redisService.getClient();
    }

    async createNewEvent(type: 'COMMAND' | 'QUERY' | 'EVENT' | 'STAT', createdById: string, topic: string, payload: any) {
        const event: UnboundEvent = {
            id: null,
            type,
            topic,
            createdAt: new Date(),
            createdById,
            payload,
        }
        const key = this.getCurrentTimeSlot();
        return this.redisClient.rpush(key, JSON.stringify(event));
    }

    @Cron(esmTimeSlotCron)
    async flushEventsToDatabase() {
        const oldTimeSlots = await this.getOldTimeSlots();
        logger.info('flushing events from redis to db', { slots: oldTimeSlots.length });
        for (const slot of oldTimeSlots) {
            const events = await this.getTimeSlotEvents(slot);
            await this.manager.createQueryBuilder()
                .insert()
                .into('es_unbound_event', [
                    'id',
                    'type',
                    'topic',
                    'createdAt',
                    'createdById',
                    'createdByType',
                    'payload',
                ])
                .values(events)
                .execute();
            await this.deleteTimeSlot(slot);
        }
    }

    getCurrentTimeSlot(): string {
        const interval = cron.parseExpression(esmTimeSlotCron);
        const timeSlot = interval.prev().toISOString();
        const key = `${esmRedisKey}::${timeSlot}`;
        return key
    }

    async getAllTimeSlots(): Promise<string[]> {
        return (await this.redisClient.keys(`${process.env.REDIS_PRIFIX||''}${esmRedisKey}::*`)).map(k => k.replace(`${process.env.REDIS_PRIFIX||''}`,''));
    }

    async getOldTimeSlots() {
        const keys = await this.getAllTimeSlots();
        const currentHourKey = this.getCurrentTimeSlot();
        return keys.filter(k => k != currentHourKey);
    }

    async getTimeSlotEvents(hour: string): Promise<UnboundEvent[]> {
        const members = await this.redisClient.lrange(hour, 0, -1);
        return members.map(m => JSON.parse(m));
    }

    async deleteTimeSlot(hour: string) {
        return this.redisClient.del(hour);
    }
}
