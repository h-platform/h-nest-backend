import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JWTPayload } from '../interfaces/jwt-payload.dto';

export const UserValue = createParamDecorator<JWTPayload>(
  (data: unknown, ctx: ExecutionContext) : JWTPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);