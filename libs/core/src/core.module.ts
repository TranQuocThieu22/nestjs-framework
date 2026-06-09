import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { KeycloakService } from './keycloak/keycloak.service';
import { AuditModule } from '@app/shared-types/audit/audit.module';
import { TenantProvisioningService } from './tenant/tenant-provisioning.service';
import { TenantMiddleware } from './tenant/tenant.middleware';
import { TenantController } from './tenant/tenant.controller';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    AuditModule,
  ],
  controllers: [TenantController],
  providers: [KeycloakService, TenantProvisioningService],
  exports: [KeycloakService, TenantProvisioningService],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
