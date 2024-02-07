import { Test, TestingModule } from '@nestjs/testing';
import { KursController } from './kurs.controller';

describe('KursController', () => {
  let controller: KursController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KursController],
    }).compile();

    controller = module.get<KursController>(KursController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
