import { Controller, Get } from '@nestjs/common';
import { EduAdmissionService } from './edu-admission.service';

@Controller()
export class EduAdmissionController {
  constructor(private readonly eduAdmissionService: EduAdmissionService) {}

  @Get()
  getHello(): string {
    return this.eduAdmissionService.getHello();
  }
}
