import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../constants';
import { JWTPayload } from './interfaces/jwt-payload.dto';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const authHeader: string = req.body.authorization || req.headers?.authorization || req.query.authorization || '';
        const token = authHeader.replace('Bearer ', '');

        if (token == '') {
            next()
            return;
        }
        
        const jwtPayload: JWTPayload = jwt.decode(token) as JWTPayload;
        if (!jwtPayload) {
            next()
            return;
        }
        
        req.user = jwtPayload;
        req.body.userId = jwtPayload.userId;
        next();
    }
}
