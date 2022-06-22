import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JWTPayload } from 'src/authentication/interfaces/jwt-payload.dto';
import { verify } from 'jsonwebtoken';;
import { CommandError } from '@h-platform/cqm';
import { JWT_SECRET, SERVICE_NAME } from 'src/constants';

@Injectable()
export class JWTGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        const authHeader: string = req.body.authorization || req.headers?.authorization || req.query.authorization || '';
        const token = authHeader.replace('Bearer ', '');

        if (token == '') {
            throw new CommandError('No JWT Token', 'NO_JWT_ERROR')
        }

        const jwtPayload: JWTPayload = verify(token, JWT_SECRET, { algorithms: ['HS256'], audience: SERVICE_NAME, issuer: SERVICE_NAME }) as JWTPayload;

        if (!jwtPayload) {
            throw new CommandError('Could not get JWT Payload', 'NO_JWT_ERROR')
        }

        return true;
    }
}