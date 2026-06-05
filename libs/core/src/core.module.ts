import { Global, Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { KeycloakService } from './keycloak/keycloak.service';
import { AuditModule } from '@app/shared-types/audit/audit.module';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    AuditModule,
  ],
  providers: [KeycloakService],
  exports: [KeycloakService],
})
export class CoreModule {}
