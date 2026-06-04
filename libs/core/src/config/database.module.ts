import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Cấu hình kết nối Postgres dùng chung cho mọi app trong monorepo.
 *
 * Mỗi app có 1 database riêng; chỉ khác nhau ở tên DB nên truyền vào khóa biến
 * môi trường tương ứng.
 *
 * @example
 *   imports: [DatabaseModule.forApp('SPM_DB_NAME')]
 */
export class DatabaseModule {
  static forApp(dbNameEnvKey: string): DynamicModule {
    return TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>(dbNameEnvKey),
        autoLoadEntities: true,
        // Chỉ bật synchronize ngoài production. Production phải dùng migrations.
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    });
  }
}
