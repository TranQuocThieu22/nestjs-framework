import { Controller, Get } from '@nestjs/common';
import { EduSpmService } from './edu-spm.service';

@Controller()
export class EduSpmController {
  constructor(private readonly eduSpmService: EduSpmService) {}

  @Get()
  getHello(): string {
    return this.eduSpmService.getHello();
  }
}
