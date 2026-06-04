import { Injectable, InternalServerErrorException } from '@nestjs/common';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { ConfigService } from '@nestjs/config';

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
    } catch (error: any) {
      console.error(
        'Keycloak Create User Error:',
        error?.response?.data || error,
      );
      const kcError =
        error?.response?.data?.errorMessage ||
        error?.message ||
        'Lỗi không xác định';
      throw new InternalServerErrorException(kcError);
    }
  }
}
