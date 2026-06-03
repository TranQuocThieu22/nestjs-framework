import { Injectable } from '@nestjs/common';

@Injectable()
export class EduStmService {
  getHello(): string {
    return 'Hello World!';
  }
}
