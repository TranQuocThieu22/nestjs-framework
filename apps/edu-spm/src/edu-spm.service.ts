import { Injectable } from '@nestjs/common';

@Injectable()
export class EduSpmService {
  getHello(): string {
    return 'Hello World!';
  }
}
