import { Test, TestingModule } from '@nestjs/testing';
import { ShippinglineService } from './shippingline.service';

describe('ShippinglineService', () => {
  let service: ShippinglineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShippinglineService],
    }).compile();

    service = module.get<ShippinglineService>(ShippinglineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
