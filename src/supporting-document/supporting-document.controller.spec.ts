import { Test, TestingModule } from '@nestjs/testing';
import { SupportingDocumentController } from './supporting-document.controller';

describe('SupportingDocumentController', () => {
  let controller: SupportingDocumentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupportingDocumentController],
    }).compile();

    controller = module.get<SupportingDocumentController>(SupportingDocumentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
