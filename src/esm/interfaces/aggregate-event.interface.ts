export enum AggregateType {
    User = 'User',
    Wallet = 'Wallet',
}

export interface IAggregateEvent {
    topic: string
    eventVersion: number;
    aggregateId: string;
    aggregateType: AggregateType;
    payload: any;
    createdAt: Date;
}