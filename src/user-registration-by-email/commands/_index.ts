import { UserRegisterByEmailCheckOtpCommand } from "./user.registerByEmail.checkOtp";
import { UserRegisterByEmailConsumeOtpCommand } from "./user.registerByEmail.consumeOtp";
import { UserRegisterByEmailSendOtpCommand } from "./user.registerByEmail.sendOtp";
import { UserResetPasswordByEmailCheckOtpCommand } from "./user.resetPasswordByEmail.checkOtp";
import { UserResetPasswordByEmailConsumeOtpCommand } from "./user.resetPasswordByEmail.consumeOtp";
import { UserResetPasswordByEmailSendOtpCommand } from "./user.resetPasswordByEmail.sendOtp";


export const commands = [
    // *** handlers section ***
    UserRegisterByEmailCheckOtpCommand,
    UserRegisterByEmailConsumeOtpCommand,
    UserRegisterByEmailSendOtpCommand,
    UserResetPasswordByEmailCheckOtpCommand,
    UserResetPasswordByEmailConsumeOtpCommand,
    UserResetPasswordByEmailSendOtpCommand,
]