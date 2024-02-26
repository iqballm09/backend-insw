import { Test, TestingModule } from '@nestjs/testing';
import { SmartContractController } from './smart-contract.controller';

describe('SmartContractController', () => {
  let controller: SmartContractController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmartContractController],
    }).compile();

    controller = module.get<SmartContractController>(SmartContractController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
