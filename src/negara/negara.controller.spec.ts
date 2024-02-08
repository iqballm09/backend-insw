import { Test, TestingModule } from '@nestjs/testing';
import { NegaraController } from './negara.controller';

describe('NegaraController', () => {
  let controller: NegaraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NegaraController],
    }).compile();

    controller = module.get<NegaraController>(NegaraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
