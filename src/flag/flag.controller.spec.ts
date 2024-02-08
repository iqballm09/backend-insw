import { Test, TestingModule } from '@nestjs/testing';
import { FlagController } from './flag.controller';

describe('FlagController', () => {
  let controller: FlagController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlagController],
    }).compile();

    controller = module.get<FlagController>(FlagController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
