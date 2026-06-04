import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { apiReference } from '@scalar/nestjs-api-reference';
import { EduAdmissionModule } from './edu-admission.module';
import { AllExceptionsFilter, TransformInterceptor } from '@app/core';

async function bootstrap() {
  const app = await NestFactory.create(EduAdmissionModule);

  // Security
  app.use(
    helmet({
      contentSecurityPolicy: false, // Cho phép tải các script bên ngoài của Scalar UI
    }),
  );
  app.enableCors();

  // API Versioning theo URI: mặc định v1
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Validation & Transformation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Exception Filters & Interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('AQ Edu Smart - Admission API')
    .setDescription('Tài liệu API cho phân hệ Tuyển sinh')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/api',
    apiReference({
      spec: {
        content: document,
      },
      theme: 'purple',
    }),
  );

  await app.listen(process.env.port ?? 3001);
}
void bootstrap();
