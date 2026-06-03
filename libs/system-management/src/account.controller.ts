import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('System Management - Account')
@Controller('system/account')
export class AccountController {
  @Get()
  @ApiOperation({ summary: 'Get list of accounts (Shared Logic)' })
  getAccounts() {
    return {
      message: 'This is shared account management logic!',
      data: [{ id: 1, username: 'admin' }],
    };
  }
}
