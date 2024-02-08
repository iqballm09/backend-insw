import { Test, TestingModule } from '@nestjs/testing';
import { SizeTypecodeService } from './size-typecode.service';

describe('SizeTypecodeService', () => {
  let service: SizeTypecodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SizeTypecodeService],
    }).compile();

    service = module.get<SizeTypecodeService>(SizeTypecodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
