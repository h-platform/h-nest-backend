import { UserLoginByEmailCommand } from "./auth.loginByEmail";
import { UserLoginByMobileNoCommand } from "./auth.loginByMobileNumber";
import { UserSyncSessionCommand } from "./auth.syncSession";


export const commands = [
    // *** handlers section ***
    UserLoginByEmailCommand,
	UserLoginByMobileNoCommand,
    UserSyncSessionCommand,
]