import { Test, TestingModule } from '@nestjs/testing';
import { BscscanController } from './bscscan.controller';

describe('BscscanController', () => {
  let controller: BscscanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BscscanController],
    }).compile();

    controller = module.get<BscscanController>(BscscanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
