import { Test, TestingModule } from '@nestjs/testing';
import { KursService } from './kurs.service';

describe('KursService', () => {
  let service: KursService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KursService],
    }).compile();

    service = module.get<KursService>(KursService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
