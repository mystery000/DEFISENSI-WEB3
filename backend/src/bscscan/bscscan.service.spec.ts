import { Test, TestingModule } from '@nestjs/testing';
import { BscscanService } from './bscscan.service';

describe('BscscanService', () => {
  let service: BscscanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BscscanService],
    }).compile();

    service = module.get<BscscanService>(BscscanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
