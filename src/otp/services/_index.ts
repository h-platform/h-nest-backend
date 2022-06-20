// *** import section ***
import { EmailService } from "./email.service";
import { OtpService } from "./otp.service";
import { SmsService } from "./sms.service";

export const services = [
    // *** handlers section ***
    EmailService,
    OtpService,
    SmsService,
]