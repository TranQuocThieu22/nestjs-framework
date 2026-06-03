import { NestFactory } from '@nestjs/core';
import { EduStmModule } from './edu-stm.module';

async function bootstrap() {
  const app = await NestFactory.create(EduStmModule);
  await app.listen(process.env.port ?? 3003);
}
bootstrap();
