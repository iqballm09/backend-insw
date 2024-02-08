import { Test, TestingModule } from '@nestjs/testing';
import { StatusDoService } from './status-do.service';

describe('StatusDoService', () => {
  let service: StatusDoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusDoService],
    }).compile();

    service = module.get<StatusDoService>(StatusDoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
