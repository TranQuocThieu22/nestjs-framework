import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Kiểm tra trạng thái hoạt động của service' })
  check(): { status: string; service: string; timestamp: string } {
    return {
      status: 'ok',
      service: 'edu-spm',
      timestamp: new Date().toISOString(),
    };
  }
}
