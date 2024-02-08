import { Test, TestingModule } from '@nestjs/testing';
import { TerminalOperatorService } from './terminal-operator.service';

describe('TerminalOperatorService', () => {
  let service: TerminalOperatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TerminalOperatorService],
    }).compile();

    service = module.get<TerminalOperatorService>(TerminalOperatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
