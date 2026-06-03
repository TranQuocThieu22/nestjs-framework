import { Test, TestingModule } from '@nestjs/testing';
import { EduStmController } from './edu-stm.controller';
import { EduStmService } from './edu-stm.service';

describe('EduStmController', () => {
  let eduStmController: EduStmController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EduStmController],
      providers: [EduStmService],
    }).compile();

    eduStmController = app.get<EduStmController>(EduStmController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(eduStmController.getHello()).toBe('Hello World!');
    });
  });
});
