import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

export const TENANT_ID_HEADER = 'x-tenant-id';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // 1. Lấy từ Header (Public routes hoặc Frontend pass xuống)
    let tenantId = req.headers[TENANT_ID_HEADER] as string;

    // 2. Nếu không có header, có thể thử parse từ JWT Token (nếu có Authorization Bearer)
    if (!tenantId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        if (token) {
          const payloadBase64 = token.split('.')[1];
          const payloadDecoded = JSON.parse(
            Buffer.from(payloadBase64, 'base64').toString(),
          );
          if (payloadDecoded && payloadDecoded.iss) {
            const issuerSegments = payloadDecoded.iss.split('/');
            tenantId = issuerSegments[issuerSegments.length - 1];
          }
        }
      } catch (error) {
        // Bỏ qua lỗi parse JWT ở đây, JWT Guard sẽ xử lý sau nếu route đó yêu cầu đăng nhập
      }
    }

    if (tenantId) {
      this.cls.set('tenantId', tenantId);
    }

    next();
  }
}
