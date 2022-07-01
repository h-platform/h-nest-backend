import { client as Authentication__AuthLoginByEmail__client } from "../authentication/commands/auth.loginByEmail";
import { client as Authentication__AuthLoginByMobileNumber__client } from "../authentication/commands/auth.loginByMobileNumber";
import { client as Authentication__AuthSyncSession__client } from "../authentication/commands/auth.syncSession";
import { client as Authentication__UserGetMyInfoQuery__client } from "../authentication/queries/user.getMyInfo";
// import { client as Capatcha__UserCaptcha__client } from "../capatcha/commands/user.captcha";
// import { client as UserRegistrationByEmail__UserRegisterByEmailCheckOtp__client } from "../user-registration-by-email/commands/user.registerByEmail.checkOtp";
// import { client as UserRegistrationByEmail__UserRegisterByEmailConsumeOtp__client } from "../user-registration-by-email/commands/user.registerByEmail.consumeOtp";
// import { client as UserRegistrationByEmail__UserRegisterByEmailSendOtp__client } from "../user-registration-by-email/commands/user.registerByEmail.sendOtp";
// import { client as UserRegistrationByEmail__UserResetPasswordByEmailCheckOtp__client } from "../user-registration-by-email/commands/user.resetPasswordByEmail.checkOtp";
// import { client as UserRegistrationByEmail__UserResetPasswordByEmailConsumeOtp__client } from "../user-registration-by-email/commands/user.resetPasswordByEmail.consumeOtp";
// import { client as UserRegistrationByEmail__UserResetPasswordByEmailSendOtp__client } from "../user-registration-by-email/commands/user.resetPasswordByEmail.sendOtp";
// import { client as UserRegistrationByMobile__UserRegisterByMobileNoCheckOtp__client } from "../user-registration-by-mobile/commands/user.registerByMobileNo.checkOtp";
// import { client as UserRegistrationByMobile__UserRegisterByMobileNoConsumeOtp__client } from "../user-registration-by-mobile/commands/user.registerByMobileNo.consumeOtp";
// import { client as UserRegistrationByMobile__UserRegisterByMobileNoSendOtp__client } from "../user-registration-by-mobile/commands/user.registerByMobileNo.sendOtp";
// import { client as UserRegistrationByMobile__UserResetPasswordByMobileNoCheckOtp__client } from "../user-registration-by-mobile/commands/user.resetPasswordByMobileNo.checkOtp";
// import { client as UserRegistrationByMobile__UserResetPasswordByMobileNoConsumeOtp__client } from "../user-registration-by-mobile/commands/user.resetPasswordByMobileNo.consumeOtp";
// import { client as UserRegistrationByMobile__UserResetPasswordByMobileNoSendOtp__client } from "../user-registration-by-mobile/commands/user.resetPasswordByMobileNo.sendOtp";
// import { client as Authentication__UserGetMyInfo__client } from "../authentication/commands/user.getMyInfo";
// import { client as Contacts__ContactFindAll__client } from "../contacts/commands/contact.findAll";
// import { client as Contacts__ContactFindById__client } from "../contacts/commands/contact.findById";
// import { client as Contacts__ContactRoleFindAll__client } from "../contacts/commands/contactRole.findAll";
// import { client as Contacts__RegionFindAll__client } from "../contacts/commands/region.findAll";
// import { client as Esm__AggregateFindAll__client } from "../esm/commands/aggregate.findAll";
// import { client as Esm__AggregateFindByIds__client } from "../esm/commands/aggregate.findByIds";
// import { client as Esm__AggregateFindOne__client } from "../esm/commands/aggregate.findOne";
// import { client as Esm__EventStoreFindNextAggregateEvent__client } from "../esm/commands/eventStore.findNextAggregateEvent";
// import { client as Esm__EventStoreFindNextUnboundEvent__client } from "../esm/commands/eventStore.findNextUnboundEvent";
// import { client as User__AdminQuery__client } from "../user/commands/admin.query";

export const client = {
    authentication: {
        commands: {
            'auth.loginByEmail': Authentication__AuthLoginByEmail__client,
            'auth.loginByMobileNumber': Authentication__AuthLoginByMobileNumber__client,
            'auth.syncSession': Authentication__AuthSyncSession__client,
            'user.getMyInfo': Authentication__UserGetMyInfoQuery__client
        },
        queries: {}
    },
    // capatcha: {
    //     commands: { 'user.captcha': Capatcha__UserCaptcha__client },
    //     queries: {}
    // },
    // 'user-registration-by-email': {
    //     commands: {
    //         'user.registerByEmail.checkOtp': UserRegistrationByEmail__UserRegisterByEmailCheckOtp__client,
    //         'user.registerByEmail.consumeOtp': UserRegistrationByEmail__UserRegisterByEmailConsumeOtp__client,
    //         'user.registerByEmail.sendOtp': UserRegistrationByEmail__UserRegisterByEmailSendOtp__client,
    //         'user.resetPasswordByEmail.checkOtp': UserRegistrationByEmail__UserResetPasswordByEmailCheckOtp__client,
    //         'user.resetPasswordByEmail.consumeOtp': UserRegistrationByEmail__UserResetPasswordByEmailConsumeOtp__client,
    //         'user.resetPasswordByEmail.sendOtp': UserRegistrationByEmail__UserResetPasswordByEmailSendOtp__client
    //     },
    //     queries: {}
    // },
    // 'user-registration-by-mobile': {
    //     commands: {
    //         'user.registerByMobileNo.checkOtp': UserRegistrationByMobile__UserRegisterByMobileNoCheckOtp__client,
    //         'user.registerByMobileNo.consumeOtp': UserRegistrationByMobile__UserRegisterByMobileNoConsumeOtp__client,
    //         'user.registerByMobileNo.sendOtp': UserRegistrationByMobile__UserRegisterByMobileNoSendOtp__client,
    //         'user.resetPasswordByMobileNo.checkOtp': UserRegistrationByMobile__UserResetPasswordByMobileNoCheckOtp__client,
    //         'user.resetPasswordByMobileNo.consumeOtp': UserRegistrationByMobile__UserResetPasswordByMobileNoConsumeOtp__client,
    //         'user.resetPasswordByMobileNo.sendOtp': UserRegistrationByMobile__UserResetPasswordByMobileNoSendOtp__client,
    //     },
    //     queries: {}
    // },
    // contacts: {
    //     commands: {
    //         'contact.findAll': Contacts__ContactFindAll__client,
    //         'contact.findById': Contacts__ContactFindById__client,
    //         'contactRole.findAll': Contacts__ContactRoleFindAll__client,
    //         'region.findAll': Contacts__RegionFindAll__client
    //     },
    //     queries: {}
    // },
    // esm: {
    //     commands: {
    //         'aggregate.findAll': Esm__AggregateFindAll__client,
    //         'aggregate.findByIds': Esm__AggregateFindByIds__client,
    //         'aggregate.findOne': Esm__AggregateFindOne__client,
    //         'eventStore.findNextAggregateEvent': Esm__EventStoreFindNextAggregateEvent__client,
    //         'eventStore.findNextUnboundEvent': Esm__EventStoreFindNextUnboundEvent__client
    //     },
    //     queries: {}
    // },
    // user: {
    //     commands: { 'admin.query': User__AdminQuery__client },
    //     queries: {}
    // }
}