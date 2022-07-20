import { VERSION } from './common/version';
export const SERVICE_VERSION: string = VERSION;
export const SERVICE_NAME = 'h-backend';
export const SERVICE_PORT = process.env.NODE_PORT || 3000;
export const SERVICE_HOST = process.env.NODE_HOST || '0.0.0.0';
export const SERVICE_TITLE = 'h backend service';

export const SESSION_SECRET = '12341234';

export const JWT_SECRET = '12341234';

