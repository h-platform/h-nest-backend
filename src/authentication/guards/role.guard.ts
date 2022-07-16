import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { JWTPayload } from 'src/authentication/interfaces/jwt-payload.dto';

/*
    Roles decorator
    ==============
    useage example:

    @Post()
    @AnyRole('ADMIN', 'OPERATOR')
    @EveryRole('ADMIN', 'OPERATOR')
    async create(@Body() createCatDto: CreateCatDto) {
        this.catsService.create(createCatDto);
    }

*/
export const AnyRole = (...roles: string[]) => {
  return SetMetadata('any_role', roles)
};

@Injectable()
export class AnyRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('any_role', context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user : JWTPayload = request.user as JWTPayload; 
    return user && Array.isArray(user.roles) && roles.some((role) => user.roles.includes(role))
  }
}


export const EveryRole = (...roles: string[]) => {
  return SetMetadata('every_role', roles)
};

@Injectable()
export class EveryRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('every_role', context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user : JWTPayload = request.user as JWTPayload; 
    return user && Array.isArray(user.roles) && roles.every((role) => user.roles.includes(role))
  }
}