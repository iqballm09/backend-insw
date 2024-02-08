import { Test, TestingModule } from '@nestjs/testing';
import { ShippinglineController } from './shippingline.controller';

describe('ShippinglineController', () => {
  let controller: ShippinglineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShippinglineController],
    }).compile();

    controller = module.get<ShippinglineController>(ShippinglineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
