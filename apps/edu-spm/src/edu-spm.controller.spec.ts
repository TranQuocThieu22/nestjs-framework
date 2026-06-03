import { Test, TestingModule } from '@nestjs/testing';
import { EduSpmController } from './edu-spm.controller';
import { EduSpmService } from './edu-spm.service';

describe('EduSpmController', () => {
  let eduSpmController: EduSpmController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EduSpmController],
      providers: [EduSpmService],
    }).compile();

    eduSpmController = app.get<EduSpmController>(EduSpmController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(eduSpmController.getHello()).toBe('Hello World!');
    });
  });
});
