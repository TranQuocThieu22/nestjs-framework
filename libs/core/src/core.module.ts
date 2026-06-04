import { Global, Module } from '@nestjs/common';
import { KeycloakService } from './keycloak/keycloak.service';

@Global()
@Module({
  providers: [KeycloakService],
  exports: [KeycloakService],
})
export class CoreModule {}
