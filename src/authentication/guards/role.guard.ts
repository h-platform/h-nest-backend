import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JWTPayload } from 'src/authentication/interfaces/jwt-payload.dto';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user : JWTPayload = request.user as JWTPayload; 
    // return user && user.userType === 'ADMIN';
    return !!user;
  }
}