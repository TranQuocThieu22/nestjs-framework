import { Controller, Get } from '@nestjs/common';
import { EduStmService } from './edu-stm.service';

@Controller()
export class EduStmController {
  constructor(private readonly eduStmService: EduStmService) {}

  @Get()
  getHello(): string {
    return this.eduStmService.getHello();
  }
}
