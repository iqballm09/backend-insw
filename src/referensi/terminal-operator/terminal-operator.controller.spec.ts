import { Test, TestingModule } from '@nestjs/testing';
import { TerminalOperatorController } from './terminal-operator.controller';

describe('TerminalOperatorController', () => {
  let controller: TerminalOperatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TerminalOperatorController],
    }).compile();

    controller = module.get<TerminalOperatorController>(TerminalOperatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
