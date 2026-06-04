import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { EduSpmService } from './edu-spm.service';
import { JwtAuthGuard } from '@app/iam';

@Controller()
export class EduSpmController {
  constructor(private readonly eduSpmService: EduSpmService) {}

  @Get()
  getHello(): string {
    return this.eduSpmService.getHello();
  }

  // API Test Bảo mật
  @Get('test-auth')
  @UseGuards(JwtAuthGuard)
  getTestAuth(@Req() req) {
    return {
      message: 'Chúc mừng! Bạn đã vượt qua chốt chặn JWT.',
      user_info: req.user,
    };
  }
}
