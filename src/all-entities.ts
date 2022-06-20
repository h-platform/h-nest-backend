import { entities as authorizationEntities } from './authorization/entities/_index';
import { entities as eventSourcingEntities } from './esm/entities/_index';
import { entities as usersEntities } from './user/entities/_index';
import { entities as otpEntities } from './otp/entities/_index';
import { entities as userRegisterationEntities } from './user-registration-by-mobile/entities/_index';
import { entities as contactsEntities } from './contacts/entities/_index';

export const allEntities = [
    ...eventSourcingEntities,
    ...usersEntities,
    ...authorizationEntities,
    ...userRegisterationEntities,
    ...otpEntities,
    ...contactsEntities,
]