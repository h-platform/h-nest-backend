
async function main() {
    const conn = await createConnection();
    const service = new UnboundEventService(conn);

    await service.flushEventsToDatabase();

    const payload = { id: 15, displayName: 'ahmed' };
    await service.createNewEvent('EVENT', String(1), 'CUSTOMER', 'test.event.occured', payload);
    await service.createNewEvent('EVENT', String(1), 'CUSTOMER', 'test.event.occured', payload);
    await service.createNewEvent('EVENT', String(2), 'DRIVER', 'test.other.event.occured', payload);
    await service.createNewEvent('EVENT', String(2), 'DRIVER', 'test.other.event.occured', payload);

    await service.flushEventsToDatabase();

    console.log('timeSlot: ', service.getCurrentTimeSlot());

    const allKeys = await service.getAllTimeSlots();
    console.log('allKeys', allKeys);

    const oldKeys = await service.getOldTimeSlots();
    console.log('oldKeys', oldKeys);

    const keyMembers = await service.getTimeSlotEventsRaw(service.getCurrentTimeSlot());
    console.log('current events raw', keyMembers.length);
}

// main();
