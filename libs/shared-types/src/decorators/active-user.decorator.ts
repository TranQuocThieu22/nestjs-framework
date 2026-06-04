import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { ActiveUserData } from '../interfaces';

/**
 * Decorator lấy thông tin người dùng đang đăng nhập từ request.user.
 *
 * @example
 *   findAll(@ActiveUser() user: ActiveUserData) { ... }
 *   findAll(@ActiveUser('tenantId') tenantId: string) { ... }
 */
export const ActiveUser = createParamDecorator(
  (data: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: ActiveUserData }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
