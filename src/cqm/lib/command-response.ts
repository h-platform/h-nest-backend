import { CommandResponseInterface } from '../interfaces/command-response.interface';

export class CommandResponse<T> implements CommandResponseInterface {
    success: boolean;
    message: string;
    code: string;
    data: T;

    static error<T>(message: string, code: string, data: T = {} as T): CommandResponseInterface {
        return {
            success: false,
            message,
            code,
            data,
        };
    }
    static success<T>(message: string, code: string, data: T = {} as T): CommandResponseInterface {
        return {
            success: true,
            message,
            code,
            data,
        };
    }
}
