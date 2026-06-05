import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { ActiveUserData } from '@app/shared-types';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly clsService: ClsService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = ActiveUserData>(err: unknown, user: TUser): TUser {
    if (err) {
      throw err instanceof Error
        ? err
        : new UnauthorizedException(
            'Bạn chưa đăng nhập hoặc token không hợp lệ.',
          );
    }
    if (!user) {
      throw new UnauthorizedException(
        'Bạn chưa đăng nhập hoặc token không hợp lệ.',
      );
    }
    this.clsService.set('user', user);
    return user;
  }
}
