import { Test, TestingModule } from '@nestjs/testing';
import { PolygonscanService } from './polygonscan.service';

describe('PolygonscanService', () => {
  let service: PolygonscanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PolygonscanService],
    }).compile();

    service = module.get<PolygonscanService>(PolygonscanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
