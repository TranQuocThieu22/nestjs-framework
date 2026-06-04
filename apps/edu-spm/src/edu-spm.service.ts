import { Injectable } from '@nestjs/common';

@Injectable()
export class EduSpmService {
  getProjectTitle(): string {
    return 'Dự án SPM - Hệ thống Quản lý Đối tác Tuyển sinh';
  }
}
