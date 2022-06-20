export interface QueryInterface {
    endpoint: string;
    execute(...optionalParams: any[]): Promise<any>;
}
