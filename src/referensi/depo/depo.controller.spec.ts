import { Test, TestingModule } from '@nestjs/testing';
import { DepoController } from './depo.controller';

describe('DepoController', () => {
  let controller: DepoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepoController],
    }).compile();

    controller = module.get<DepoController>(DepoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
