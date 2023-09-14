import { Test, TestingModule } from '@nestjs/testing';
import { ArbitrumController } from './arbitrum.controller';

describe('ArbitrumController', () => {
  let controller: ArbitrumController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArbitrumController],
    }).compile();

    controller = module.get<ArbitrumController>(ArbitrumController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
