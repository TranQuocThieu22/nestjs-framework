import { NestFactory } from '@nestjs/core';
import { EduSpmModule } from './edu-spm.module';
import { AllExceptionsFilter, TransformInterceptor } from '@app/core';

async function bootstrap() {
  const app = await NestFactory.create(EduSpmModule);
  
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  
  await app.listen(process.env.port ?? 3002);
}
bootstrap();
