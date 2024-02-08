import { Test, TestingModule } from '@nestjs/testing';
import { KabkotaService } from './kabkota.service';

describe('KabkotaService', () => {
  let service: KabkotaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KabkotaService],
    }).compile();

    service = module.get<KabkotaService>(KabkotaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
