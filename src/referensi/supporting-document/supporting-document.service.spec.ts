import { Test, TestingModule } from '@nestjs/testing';
import { SupportingDocumentService } from './supporting-document.service';

describe('SupportingDocumentService', () => {
  let service: SupportingDocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupportingDocumentService],
    }).compile();

    service = module.get<SupportingDocumentService>(SupportingDocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
