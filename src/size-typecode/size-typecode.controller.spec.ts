import { Test, TestingModule } from '@nestjs/testing';
import { SizeTypecodeController } from './size-typecode.controller';

describe('SizeTypecodeController', () => {
  let controller: SizeTypecodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SizeTypecodeController],
    }).compile();

    controller = module.get<SizeTypecodeController>(SizeTypecodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
