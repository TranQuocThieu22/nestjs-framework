import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { ActiveUserData } from '@app/shared-types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Bạn có thể tùy chỉnh logic mở rộng ở đây nếu cần
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
    return user;
  }
}
