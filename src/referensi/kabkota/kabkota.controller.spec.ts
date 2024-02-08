import { Test, TestingModule } from '@nestjs/testing';
import { KabkotaController } from './kabkota.controller';

describe('KabkotaController', () => {
  let controller: KabkotaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KabkotaController],
    }).compile();

    controller = module.get<KabkotaController>(KabkotaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
