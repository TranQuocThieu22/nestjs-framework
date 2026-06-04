import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccountService } from '../services/account.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { JwtAuthGuard, PoliciesGuard, CHECK_POLICIES_KEY } from '@app/iam';

@ApiTags('Quản lý danh sách tài khoản')
@ApiBearerAuth()
@Controller('system/account')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tài khoản' })
  // @ReflectMetadata(CHECK_POLICIES_KEY, [{ handle: (ability) => ability.can('READ', 'QuanLyTaiKhoan') }]) // TODO: Thiết lập sau
  getAccounts(@Req() req) {
    // req.user được Inject từ JwtStrategy
    return this.accountService.getAccounts(req.user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm mới tài khoản (Đồng bộ Keycloak)' })
  createUser(@Req() req, @Body() createUserDto: CreateUserDto) {
    return this.accountService.createUser(req.user.tenantId, createUserDto);
  }
}
