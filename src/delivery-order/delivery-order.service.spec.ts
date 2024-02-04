import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryOrderService } from './delivery-order.service';

describe('DeliveryOrderService', () => {
  let service: DeliveryOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryOrderService],
    }).compile();

    service = module.get<DeliveryOrderService>(DeliveryOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
