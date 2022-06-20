import { CommandResponse } from '../lib/command-response';

export interface CommandInterface {
    endpoint: string;
    execute(...optionalParams: any[]): Promise<CommandResponse<any>> | CommandResponse<any>;
}
