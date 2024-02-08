import { Test, TestingModule } from '@nestjs/testing';
import { FlagService } from './flag.service';

describe('FlagService', () => {
  let service: FlagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlagService],
    }).compile();

    service = module.get<FlagService>(FlagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
