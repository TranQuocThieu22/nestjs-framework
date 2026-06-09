import { Controller, Post, Param } from '@nestjs/common';
import { TenantProvisioningService } from './tenant-provisioning.service';

@Controller('tenant')
export class TenantController {
  constructor(
    private readonly provisioningService: TenantProvisioningService,
  ) {}

  @Post('provision/:tenantId')
  async provision(@Param('tenantId') tenantId: string) {
    await this.provisioningService.provisionTenant(tenantId, [
      'admission',
      'spm',
    ]);
    return {
      success: true,
      message: `Tenant ${tenantId} databases and schemas created successfully`,
    };
  }
}
