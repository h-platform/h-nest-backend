import { UserRegisterByMobileNoCheckOtpCommand } from "./user.registerByMobileNo.checkOtp";
import { UserRegisterByMobileNoConsumeOtpCommand } from "./user.registerByMobileNo.consumeOtp";
import { UserRegisterByMobileNoSendOtpCommand } from "./user.registerByMobileNo.sendOtp";
import { UserResetPasswordByMobileNoCheckOtpCommand } from "./user.resetPasswordByMobileNo.checkOtp";
import { UserResetPasswordByMobileNoConsumeOtpCommand } from "./user.resetPasswordByMobileNo.consumeOtp";
import { UserResetPasswordByMobileNoSendOtpCommand } from "./user.resetPasswordByMobileNo.sendOtp";


export const commands = [
    // *** handlers section ***
    UserRegisterByMobileNoCheckOtpCommand,
    UserRegisterByMobileNoConsumeOtpCommand,
    UserRegisterByMobileNoSendOtpCommand,
    UserResetPasswordByMobileNoCheckOtpCommand,
    UserResetPasswordByMobileNoConsumeOtpCommand,
    UserResetPasswordByMobileNoSendOtpCommand,
]