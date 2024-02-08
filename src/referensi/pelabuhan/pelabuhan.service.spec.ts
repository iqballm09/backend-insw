import { Test, TestingModule } from '@nestjs/testing';
import { PelabuhanService } from './pelabuhan.service';

describe('PelabuhanService', () => {
  let service: PelabuhanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PelabuhanService],
    }).compile();

    service = module.get<PelabuhanService>(PelabuhanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
