// optional-jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Public 라우트인 경우, 토큰이 제공되었을 때에만 검증을 수행하고, 그렇지 않으면 검증을 생략합니다.
    if (isPublic) {
      const request = context.switchToHttp().getRequest();
      if (!request.headers.authorization) {
        return true;
      }
    }

    // Public 라우트가 아닌 경우, 무조건 토큰을 검증합니다.
    return super.canActivate(context);
  }

  handleRequest(
    err: Error,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ) {
    // Public 라우트인 경우, 에러가 발생하더라도 그냥 무시하고 사용자를 반환합니다.
    // 이렇게 하면, 토큰이 제공되었을 때에만 사용자 정보를 얻을 수 있습니다.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return user;
    }

    // Public 라우트가 아닌 경우, 에러가 발생하면 예외를 던집니다.
    return super.handleRequest(err, user, info, context, status);
  }
}
