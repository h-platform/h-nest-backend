import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const JWTTokenValue = createParamDecorator<string>(
    (data: unknown, ctx: ExecutionContext): string => {
        const req = ctx.switchToHttp().getRequest();
        const authHeader: string = req.body.authorization || req.headers?.authorization || req.query.authorization || '';
        const token = authHeader.replace('Bearer ', '');
        return token;
    },
);