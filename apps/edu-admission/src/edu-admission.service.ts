import { Injectable } from '@nestjs/common';

@Injectable()
export class EduAdmissionService {
  getHello(): string {
    return 'Hello World!';
  }
}
