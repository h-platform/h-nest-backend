import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import e from "express";
import { nextTick } from "process";
import { giveMeClassLogger } from "src/common/winston.logger";
import { EntityManager, MoreThan } from "typeorm";
import { AggregateEventStream } from "../entities/aggregate-event-stream.entity";
import { AggregateEvent } from "../entities/aggregate-event.entity";

const topic = "EventSourcingService"
const logger = giveMeClassLogger(topic);

const streamName = 'main-stream';
const eventsPerBatch = 10;
type SourcedEventHandler = (event: AggregateEvent, em: EntityManager) => void;


@Injectable()
export class EventSourcingService {
    eventHandlers: Record<string, Array<SourcedEventHandler>> = {};

    constructor(
        @InjectEntityManager() private readonly manager: EntityManager,
    ) { }

    registerEventHandler(topic: string, handler: SourcedEventHandler) {
        if (!this.eventHandlers[topic]) {
            this.eventHandlers[topic] = [];
        }
        this.eventHandlers[topic].push(handler);
        logger.info(`registered event handler ${topic}`);
    }

    async processNewEvents() {
        // get new events from last one
        const sourcedEvents = await this.getStreamNewEvents(streamName, this.manager, eventsPerBatch);
        if (sourcedEvents.length === 0) return;

        // process new events and commit each one
        for (const newEvent of sourcedEvents) {
            const handlers = this.eventHandlers[newEvent.topic];
            logger.info(`processing event:${newEvent.topic} id:${newEvent.id} with ${(handlers || []).length} handlers for stream ${streamName}`);
            if (handlers && handlers.length > 0) {
                await this.manager.transaction(async (em) => {
                    for (const handler of handlers) {
                        await handler(newEvent, em);
                    }
                });
            }
            await this.commitStreamEvent(streamName, newEvent.id, this.manager);
        }

        nextTick(() => {
            this.processNewEvents();
        })
    }

    async getStreamNewEvents(streamName: string, em: EntityManager, limit = 10): Promise<AggregateEvent[]> {
        let stream = await em.findOne(AggregateEventStream, { relations: ['lastEvent'], where: {streamName: streamName} });
        if (!stream) {
            stream = em.create(AggregateEventStream);
            stream.streamName = streamName;
            await em.save(stream)
        }
        const events = await em.find(AggregateEvent, { where: { id: MoreThan(stream.lastEvent?.id || 0) }, take: limit });
        return events;
    }

    async commitStreamEvent(streamName: string, eventId: number, em: EntityManager): Promise<any> {
        const stream = await em.findOneOrFail(AggregateEventStream, { where: { streamName: streamName } });
        stream.lastEvent = eventId as any;
        await em.save(stream);
        logger.info(`commited eventId ${eventId} for stream ${streamName}`);
    }
}
