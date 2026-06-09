import { Injectable, InternalServerErrorException } from '@nestjs/common';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { ConfigService } from '@nestjs/config';

/** Hình dạng lỗi trả về từ Keycloak Admin Client (axios-based) */
export interface KeycloakError {
  message?: string;
  response?: {
    data?: {
      errorMessage?: string;
    };
  };
}

@Injectable()
export class KeycloakService {
  private kcAdminClient: KcAdminClient;

  constructor(private configService: ConfigService) {
    this.kcAdminClient = new KcAdminClient({
      baseUrl: this.configService.get<string>(
        'KEYCLOAK_URL',
        'http://localhost:8080',
      ),
      realmName: 'master', // Login to master to get admin rights
    });
  }

  async getAdminClient(tenantId: string) {
    // Đảm bảo luôn auth vào realm master trước
    this.kcAdminClient.setConfig({
      realmName: 'master',
    });

    // Authenticate admin client
    await this.kcAdminClient.auth({
      username: this.configService.get<string>(
        'KEYCLOAK_ADMIN_USERNAME',
        'admin',
      ),
      password: this.configService.get<string>(
        'KEYCLOAK_ADMIN_PASSWORD',
        'admin',
      ),
      grantType: 'password',
      clientId: 'admin-cli',
    });

    // Switch to tenant realm
    this.kcAdminClient.setConfig({
      realmName: tenantId,
    });

    return this.kcAdminClient;
  }

  async createUser(
    tenantId: string,
    username: string,
    email: string,
    firstName: string,
    lastName: string,
  ) {
    try {
      const client = await this.getAdminClient(tenantId);

      const user = await client.users.create({
        username,
        email,
        firstName,
        lastName,
        enabled: true,
        emailVerified: true,
      });

      // Tạo mật khẩu mặc định: 123456
      await client.users.resetPassword({
        id: user.id,
        credential: {
          temporary: true,
          type: 'password',
          value: '123456',
        },
      });

      return user.id; // Trả về Keycloak ID (UUID)
    } catch (error: unknown) {
      const err = error as KeycloakError;
      console.error(
        'Keycloak Create User Error:',
        err?.response?.data ?? error,
      );
      const kcError =
        err?.response?.data?.errorMessage ??
        err?.message ??
        'Lỗi không xác định';
      throw new InternalServerErrorException(kcError);
    }
  }
  async createRealmAndClient(tenantId: string, tenantName: string) {
    try {
      // 1. Lấy admin client ở realm master
      const client = await this.getAdminClient('master');

      // 2. Tạo Realm mới
      await client.realms.create({
        realm: tenantId,
        displayName: tenantName,
        enabled: true,
      });

      // 3. Switch qua Realm mới để tạo Client
      this.kcAdminClient.setConfig({
        realmName: tenantId,
      });

      // 4. Tạo Client spm-client hỗ trợ Postman/Direct Access
      await client.clients.create({
        clientId: 'spm-client',
        name: 'SPM System Client',
        enabled: true,
        publicClient: true,
        directAccessGrantsEnabled: true,
        standardFlowEnabled: true,
        redirectUris: ['*'], // Cho phép test dễ dàng
        webOrigins: ['*'],
      });

    } catch (error: unknown) {
      const err = error as KeycloakError;
      console.error(
        'Keycloak Create Realm Error:',
        err?.response?.data ?? error,
      );
      // Nếu lỗi là do realm đã tồn tại, ta có thể bỏ qua hoặc ném lỗi tiếp
      const kcError =
        err?.response?.data?.errorMessage ??
        err?.message ??
        'Lỗi không xác định khi tạo Realm';
      throw new InternalServerErrorException(`Lỗi tạo Realm: ${kcError}`);
    }
  }

  async disableRealm(tenantId: string) {
    try {
      const client = await this.getAdminClient('master');
      await client.realms.update({ realm: tenantId }, { enabled: false });
    } catch (error: any) {
      console.warn(`Could not disable realm ${tenantId}: ${error.message}`);
    }
  }

  async deleteRealm(tenantId: string) {
    try {
      const client = await this.getAdminClient('master');
      await client.realms.del({ realm: tenantId });
    } catch (error: any) {
      console.warn(`Could not delete realm ${tenantId}: ${error.message}`);
    }
  }
}
