import { Process, Processor } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import axios from 'axios';
import { Job } from "bull";
import { encode } from "querystring";
import { giveMeClassLogger } from "src/common/winston.logger";
const twilio = require('twilio');

const topic = "user.registerByMobileNo.sendOtp"
const logger = giveMeClassLogger(topic);

export class SendSMSCommandDTO {
    mobileNumber: string;
    textMessage: string;
}

export const TWILIO_AUTH_TOKEN = '';   // Your Auth Token from www.twilio.com/console
export const TWILIO_ACCOUNT_SID = ''; // Your Account SID from www.twilio.com/console
export const TWILIO_MESSAGING_SERVICE_SID = '';
export const TWILIO_NUMBER = '';
export const TWILIO_ALPHA_NUMBER = '';

@Injectable()
@Processor('sms')
export class SmsService {
    async sendSms(mobileNumber: string, textMessage: string) {
        return this.sendSmsMazinHost(mobileNumber, textMessage);
    }

    async sendSmsMazinHost(mobileNumber: string, textMessage: string) {
        logger.info('Mazin host api key', process.env.MAZIN_HOST_SMS);
        const queryObj = {
            action: 'send-sms',
            api_key: process.env.MAZIN_HOST_SMS,
            to: mobileNumber,
            from: 'techfirst',
            sms: textMessage,
            unicode: true
        }
        const queryStr = encode(queryObj);
        logger.debug('Encoded query string', queryStr);
        // const response = await axios.get(`https://mazinhost.com/smsv1/sms/api?${queryStr}`);
        const response = await axios.post(`https://mazinhost.com/smsv1/sms/api`, queryObj, {
            // headers:{'Content-Type':''}
        });
        logger.info('Mazin host SMS Response', response?.data);
        return response?.data;
    }

    async sendSmsTwilio(mobileNumber: string, textMessage: string) {
        // generate otp
        const twilioClient = new twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        const twillioResponse = await twilioClient.messages.create({
            body: textMessage,
            messagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
            to: mobileNumber,
            // from: TWILIO_NUMBER  // From a valid Twilio number
        });
        return twillioResponse;
    }
    
    @Process('sendSms')
    async jobHandler(job: Job<SendSMSCommandDTO>) {
        return this.sendSms(job.data.mobileNumber, job.data.textMessage);
    }

}