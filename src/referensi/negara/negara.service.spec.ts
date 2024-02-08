import { Test, TestingModule } from '@nestjs/testing';
import { NegaraService } from './negara.service';

describe('NegaraService', () => {
  let service: NegaraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NegaraService],
    }).compile();

    service = module.get<NegaraService>(NegaraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
