import { NestFactory } from '@nestjs/core';
import { EduAdmissionModule } from './edu-admission.module';

async function bootstrap() {
  const app = await NestFactory.create(EduAdmissionModule);
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
