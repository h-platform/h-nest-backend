import connection from 'src/testing/connection';
import { OTP } from "src/otp/entities/otp.entity";
import { EntityManager } from "typeorm";
import { OtpService } from "../otp.service";
import { SmsService } from "../sms.service";

const testData = {
    mobileNumber: '+249917622959',
    textMessage: 'رمز التحقق لتسجيل الحساب :OTP',
    actionType: 'REGISTER_BY_MOBILE',
    actionPayload: {
        displayName: 'ياسر محمد',
        mobileNumber: '0917622959',
        password: '15154848',
    },
    otpToken: '171717',
}

describe('testing otp registeration service', () => {
    let otpService: OtpService;
    let smsService: SmsService;
    let entityManager: EntityManager;
    let createdOtp: OTP;

    beforeAll(async () => {
        await connection.create();
        await connection.clear();
        entityManager = connection.getEntityManager();
        smsService = new SmsService();
        otpService = new OtpService(entityManager, smsService);
    });

    describe('testing otp service', () => {
        it('should create a new otp', async () => {
            try {
                createdOtp = await otpService.sendSmsOtp(testData.mobileNumber, testData.textMessage, testData.actionType, testData.actionPayload);
                expect(createdOtp).toBeTruthy();
                expect(createdOtp.id).toBeGreaterThan(0);
            } catch (err) {
                fail('Should not throw error but it did.');
            }
        });
        it('should verify otp successfully', async () => {
            try {
                const foundOtp = await otpService.verifySmsOtpOrFail(createdOtp.otpUuid, testData.mobileNumber, testData.actionType, createdOtp.otpToken);
                expect(foundOtp).toMatchObject(createdOtp);
            } catch (err) {
                fail('Should not throw error but it did.');
            }
        })
        it('should fail to verify otp - otp not found for uuid', async () => {
            try {
                await otpService.verifySmsOtpOrFail('1111111', testData.mobileNumber, testData.actionType, testData.otpToken);
                fail('Should throw error but did not.');
            } catch (e) {
                expect(e).toMatchObject({ code: 'OTP_UUID_NOT_FOUND' })
            }
        });
        it('should fail to verify otp - wrong mobileNo', async () => {
            try {
                await otpService.verifySmsOtpOrFail(createdOtp.otpUuid, '090909090909', testData.actionType, testData.otpToken);
                fail('Should throw error but did not.');
            } catch (e) {
                expect(e).toMatchObject({ code: 'OTP_WRONG_MOBILE_NUMBER' })
            }
        });
        it('should fail to verify otp - wrong actionType', async () => {
            try {
                await otpService.verifySmsOtpOrFail(createdOtp.otpUuid, testData.mobileNumber, 'RANDOM_ACTION_TYPE', testData.otpToken);
                fail('Should throw error but did not.');
            } catch (e) {
                expect(e).toMatchObject({ code: 'OTP_WRONG_ACTION_TYPE' })
            }
        })
        it('should fail to verify otp - wrong token', async () => {
            try {
                await otpService.verifySmsOtpOrFail(createdOtp.otpUuid, testData.mobileNumber, testData.actionType, '000000');
                fail('Should throw error but did not.');
            } catch (e) {
                expect(e).toMatchObject({ code: 'OTP_WRONG_TOKEN' })
            }
        })
        it('should consume otp successfully', async () => {
            try {
                const foundOtp = await otpService.verifyAndConsumeSmsOtpOrFail(createdOtp.otpUuid, createdOtp.mobileNumber, createdOtp.actionType, createdOtp.otpToken);
                expect(foundOtp).toMatchObject({ 
                    otpUuid: createdOtp.otpUuid,
                    mobileNumber: testData.mobileNumber,
                    actionType: testData.actionType,
                    isConsumed: true
                });
                expect(foundOtp.consumedAt).toBeTruthy();
            } catch (err) {
                fail('Should not throw error but it did.');
            }
        })
        it('should fail to verify otp - consumed otp', async () => {
            try {
                await otpService.verifySmsOtpOrFail(createdOtp.otpUuid, testData.mobileNumber, testData.actionType, createdOtp.otpToken);
                fail('Should throw error but did not.');
            } catch (e) {
                expect(e).toMatchObject({ code: 'OTP_CONSUMED' })
            }
        })
        it('should fail to consume otp - wrong mobileNo', async () => {
            try {
                await otpService.verifyAndConsumeSmsOtpOrFail(createdOtp.otpUuid, '11155578921', testData.actionType, createdOtp.otpToken);
                fail('Should throw error but did not.');
            } catch (e) {
                expect(e).toMatchObject({ code: 'OTP_WRONG_MOBILE_NUMBER' })
            }
        })
        it('should fail to consume otp - wrong actionType', async () => {
            try {
                await otpService.verifyAndConsumeSmsOtpOrFail(createdOtp.otpUuid, testData.mobileNumber, 'RANDOM_ACTION_TYPE', createdOtp.otpToken);
                fail('Should throw error but did not.');
            } catch (e) {
                expect(e).toMatchObject({ code: 'OTP_WRONG_ACTION_TYPE' })
            }
        })
        it('should fail to consume otp - wrong uuid', async () => {
            try {
                await otpService.verifyAndConsumeSmsOtpOrFail('11479963225847822', testData.mobileNumber, testData.actionType, createdOtp.otpToken);
                fail('Should throw error but did not.');
            } catch (e) {
                expect(e).toMatchObject({ code: 'OTP_UUID_NOT_FOUND' })
            }
        })
        it('should fail to consume otp - wrong token', async () => {
            try {
                await otpService.verifyAndConsumeSmsOtpOrFail(createdOtp.otpUuid, testData.mobileNumber, testData.actionType, '000000');
                fail('Should throw error but did not.');
            } catch (e) {
                expect(e).toMatchObject({ code: 'OTP_WRONG_TOKEN' })
            }
        })
        it('should fail to consume otp - consumed otp', async () => {
            try {
                await otpService.verifyAndConsumeSmsOtpOrFail(createdOtp.otpUuid, testData.mobileNumber, testData.actionType, createdOtp.otpToken);
                fail('Should throw error but did not.');
            } catch (e) {
                expect(e).toMatchObject({ code: 'OTP_CONSUMED' })
            }
        })
    });
});