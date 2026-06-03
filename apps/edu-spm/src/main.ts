import { NestFactory } from '@nestjs/core';
import { EduSpmModule } from './edu-spm.module';

async function bootstrap() {
  const app = await NestFactory.create(EduSpmModule);
  await app.listen(process.env.port ?? 3002);
}
bootstrap();
