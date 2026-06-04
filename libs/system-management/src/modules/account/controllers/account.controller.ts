import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccountService } from '../services/account.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { JwtAuthGuard, PoliciesGuard, ActiveUser } from '@app/iam';
import type { ActiveUserData } from '@app/iam';

@ApiTags('Quản lý danh sách tài khoản')
@ApiBearerAuth()
@Controller('system/account')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tài khoản' })
  // @ReflectMetadata(CHECK_POLICIES_KEY, [{ handle: (ability) => ability.can('READ', 'QuanLyTaiKhoan') }]) // TODO: Thiết lập sau
  getAccounts(@ActiveUser() user: ActiveUserData) {
    // user được Inject từ JwtStrategy thông qua decorator @ActiveUser
    return this.accountService.getAccounts(user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm mới tài khoản (Đồng bộ Keycloak)' })
  createUser(
    @ActiveUser() user: ActiveUserData,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.accountService.createUser(user.tenantId, createUserDto);
  }
}
