import { Test, TestingModule } from '@nestjs/testing';
import { PelabuhanController } from './pelabuhan.controller';

describe('PelabuhanController', () => {
  let controller: PelabuhanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PelabuhanController],
    }).compile();

    controller = module.get<PelabuhanController>(PelabuhanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
