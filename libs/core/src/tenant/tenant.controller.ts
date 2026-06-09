import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@ApiTags('Tenant Management')
@Controller('tenant')
export class TenantController {
  constructor(
    private readonly provisioningService: TenantProvisioningService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các Tenant (Trường học)' })
  async findAll() {
    return this.provisioningService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Đăng ký Tenant mới và cấp phát Database' })
  async create(@Body() dto: CreateTenantDto) {
    const tenant = await this.provisioningService.provisionTenant(dto, [
      'admission',
      'spm',
    ]);
    return {
      success: true,
      message: `Tenant ${dto.code} databases and schemas created successfully`,
      data: tenant,
    };
  }
}
