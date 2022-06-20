// import { createConnection, EntityManager, Equal } from 'typeorm';
// import { UserRegisterByMobileNoSendOtpCommand } from '../user.registerByEmail.sendOtp';
// import { SmsService } from '../../services/sms.service';
// import { OtpService } from '../../services/otp.service';
// import { UserRegisterByMobileNoConsumeOtpCommand } from '../user.registerByEmail.consumeOtp';
// import { UserRegisterByMobileNoCheckOtpCommand } from '../user.registerByEmail.checkOtp';
// import { OTP } from '../../entities/otp.entity';
// import { User } from '../entities/user.entity';
// import connection from 'src/tests/connection';

// describe('user.registerByMobileNo', () => {
//     let smsService: SmsService;
//     let entityManager: EntityManager;
//     let otpService: OtpService;
//     let sendOtpCommand: UserRegisterByMobileNoSendOtpCommand;
//     let checkOtpCommand: UserRegisterByMobileNoCheckOtpCommand;
//     let consumeOtpCommand: UserRegisterByMobileNoConsumeOtpCommand;

//     let sentOtpUuid: string = '13530db7-b31c-4350-8204-0f847c1cbf44';
//     let testData = {
//         mobileNumber: '249917622959',
//         displayName: 'Yasir Salih',
//         password: '1598478',
//         password2: '1598478',
//     }

//     beforeAll(async () => {
//         await connection.create();
//         await connection.clear();
//         entityManager = connection.getEntityManager();
//         smsService = new SmsService();
//         otpService = new OtpService(entityManager, smsService);
//         sendOtpCommand = new UserRegisterByMobileNoSendOtpCommand(otpService, entityManager);
//         checkOtpCommand = new UserRegisterByMobileNoCheckOtpCommand(otpService);
//         consumeOtpCommand = new UserRegisterByMobileNoConsumeOtpCommand(otpService, smsService, entityManager);
//     });

//     describe('.sendOtp', () => {
//         it('should fail as passwords mismatch', async () => {
//             try {
//                 await sendOtpCommand.execute({
//                     mobileNumber: testData.mobileNumber,
//                     displayName: testData.displayName,
//                     password: testData.password,
//                     password2: 'xxxxxxxx',
//                 });
//                 fail('Should throw error but did not.');
//             } catch (err) {
//                 expect(err).toMatchObject({ code: 'ERR_PASSWORDS_NO_MATCH' });
//             }
//         });
        
//         it('should send otp successfully', async () => {
//             try {
//                 const response = await sendOtpCommand.execute({
//                     mobileNumber: testData.mobileNumber,
//                     displayName: testData.displayName,
//                     password: testData.password,
//                     password2: testData.password2,
//                 });
//                 expect(response).toMatchObject({ code: 'OTP_SENT' });
//                 sentOtpUuid = response.data.otpUuid;
//             } catch (err) {
//                 fail('Should not throw error but did.');
//             }
//         });

//         it('should fail as mobile number already exists', async () => {
//             try {
//                 await entityManager.insert(User, {
//                     mobileNumber:'0900000000',
//                     displayName: 'Dummy User',
//                     password: '1234',
//                 })
//                 await sendOtpCommand.execute({
//                     mobileNumber: '0900000000',
//                     displayName: testData.displayName,
//                     password: testData.password,
//                     password2: testData.password2,
//                 });
//                 fail('Should throw error but did not.');
//             } catch (err) {
//                 expect(err).toMatchObject({ code: 'ERR_MOBILE_NO_EXISTS' });
//             }
//         });
//     });

//     describe('.checkOtp', () => {
//         it('should fail as otp uuid not found', async () => {
//             try {
//                 await checkOtpCommand.execute({
//                     otpUuid: 'xxxx',
//                     mobileNumber: '',
//                     token: ''
//                 });
//                 fail('Should throw error but did not.');
//             } catch (err) {
//                 expect(err).toMatchObject({ code: 'OTP_UUID_NOT_FOUND' });
//             }
//         });
//         it('should fail as mobile number mismatch', async () => {
//             try {
//                 await checkOtpCommand.execute({
//                     otpUuid: sentOtpUuid,
//                     mobileNumber: '',
//                     token: ''
//                 });
//                 fail('Should throw error but did not.');
//             } catch (err) {
//                 expect(err).toMatchObject({ code: 'OTP_WRONG_MOBILE_NUMBER' });
//             }
//         });
//         it('should fail as token mismatch', async () => {
//             try {
//                 await checkOtpCommand.execute({
//                     otpUuid: sentOtpUuid,
//                     mobileNumber: testData.mobileNumber,
//                     token: 'xxxx'
//                 });
//                 fail('Should throw error but did not.');
//             } catch (err) {
//                 expect(err).toMatchObject({ code: 'OTP_WRONG_TOKEN' });
//             }
//         });
//         it('should check otp successfully', async () => {
//             try {
//                 const otp = await entityManager.findOne(OTP, {
//                     where: {
//                         otpUuid: Equal(sentOtpUuid),
//                     },
//                 });
//                 const response = await checkOtpCommand.execute({
//                     otpUuid: sentOtpUuid,
//                     mobileNumber: testData.mobileNumber,
//                     token: otp.otpToken
//                 });
//                 expect(response).toMatchObject({ code: 'OTP_VALID' });
//             } catch (err) {
//                 fail('Should not throw error but did.');
//             }
//         });
//     });

//     describe('.consumeOtp', () => {
//         it('should fail as otp uuid not found', async () => {
//             try {
//                 await consumeOtpCommand.execute({
//                     otpUuid: 'xxxx',
//                     mobileNumber: '',
//                     token: ''
//                 });
//                 fail('Should throw error but did not.');
//             } catch (err) {
//                 expect(err).toMatchObject({ code: 'OTP_UUID_NOT_FOUND' });
//             }
//         });
//         it('should fail as mobile number mismatch', async () => {
//             try {
//                 await consumeOtpCommand.execute({
//                     otpUuid: sentOtpUuid,
//                     mobileNumber: '',
//                     token: ''
//                 });
//                 fail('Should throw error but did not.');
//             } catch (err) {
//                 expect(err).toMatchObject({ code: 'OTP_WRONG_MOBILE_NUMBER' });
//             }
//         });
//         it('should fail as token mismatch', async () => {
//             try {
//                 await consumeOtpCommand.execute({
//                     otpUuid: sentOtpUuid,
//                     mobileNumber: testData.mobileNumber,
//                     token: 'xxxx'
//                 });
//                 fail('Should throw error but did not.');
//             } catch (err) {
//                 expect(err).toMatchObject({ code: 'OTP_WRONG_TOKEN' });
//             }
//         });
//         it('should register user successfully', async () => {
//             try {
//                 const otp = await entityManager.findOne(OTP, {
//                     where: {
//                         otpUuid: Equal(sentOtpUuid),
//                     },
//                 });
//                 const response = await consumeOtpCommand.execute({
//                     otpUuid: sentOtpUuid,
//                     mobileNumber: testData.mobileNumber,
//                     token: otp.otpToken
//                 });
//                 expect(response).toMatchObject({ code: 'REGISTER_SUCCESS' });
//                 const user = await entityManager.findOne(User, {
//                     where: {
//                         mobileNumber: Equal(testData.mobileNumber),
//                     },
//                 });
//                 expect(user).toBeTruthy();
//                 expect(user).toMatchObject({
//                     mobileNumber: testData.mobileNumber,
//                     displayName: testData.displayName
//                 });
//                 const consumedOtp = await entityManager.findOne(OTP, {
//                     where: {
//                         otpUuid: Equal(sentOtpUuid),
//                     },
//                 });
//                 expect(consumedOtp).toMatchObject({ isConsumed: true })
//             } catch (err) {
//                 fail('Should throw error but it did.');
//             }
//         });
//     });

// });