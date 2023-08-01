import { Test, TestingModule } from '@nestjs/testing';
import { PolygonscanController } from './polygonscan.controller';
import { PolygonscanService } from './polygonscan.service';

describe('PolygonscanController', () => {
  let controller: PolygonscanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PolygonscanController],
      providers: [PolygonscanService],
    }).compile();

    controller = module.get<PolygonscanController>(PolygonscanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
