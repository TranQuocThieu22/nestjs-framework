import { Test, TestingModule } from '@nestjs/testing';
import { EduAdmissionController } from './edu-admission.controller';
import { EduAdmissionService } from './edu-admission.service';

describe('EduAdmissionController', () => {
  let eduAdmissionController: EduAdmissionController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EduAdmissionController],
      providers: [EduAdmissionService],
    }).compile();

    eduAdmissionController = app.get<EduAdmissionController>(EduAdmissionController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(eduAdmissionController.getHello()).toBe('Hello World!');
    });
  });
});
