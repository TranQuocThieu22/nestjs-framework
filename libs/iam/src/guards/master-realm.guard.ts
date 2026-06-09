import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import type { ActiveUserData } from '@app/shared-types';

@Injectable()
export class MasterRealmGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as ActiveUserData;
    
    // Kiểm tra xem User có tồn tại và thuộc về Realm 'master' hay không
    if (!user || user.tenantId !== 'master') {
      throw new ForbiddenException('Tính năng này yêu cầu quyền quản trị từ Master Realm.');
    }
    
    return true;
  }
}
