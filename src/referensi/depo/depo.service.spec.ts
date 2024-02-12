import { Test, TestingModule } from '@nestjs/testing';
import { DepoService } from './depo.service';

describe('DepoService', () => {
  let service: DepoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepoService],
    }).compile();

    service = module.get<DepoService>(DepoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
