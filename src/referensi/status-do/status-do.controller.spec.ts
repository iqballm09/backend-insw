import { Test, TestingModule } from '@nestjs/testing';
import { StatusDoController } from './status-do.controller';

describe('StatusDoController', () => {
  let controller: StatusDoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusDoController],
    }).compile();

    controller = module.get<StatusDoController>(StatusDoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
