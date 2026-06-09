import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : ((exceptionResponse as { message?: string | string[] }).message ??
            exception.message);
    } else if (
      exception instanceof Error &&
      exception.name === 'OptimisticLockVersionMismatchError'
    ) {
      status = HttpStatus.CONFLICT;
      message =
        'Dữ liệu đã bị người khác chỉnh sửa trước đó. Vui lòng tải lại trang để lấy dữ liệu mới nhất!';
    } else if (
      exception instanceof Error &&
      status === HttpStatus.INTERNAL_SERVER_ERROR
    ) {
      // Log the original error for debugging purposes if it's a 500
      console.error(exception);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
