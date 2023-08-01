import { Test, TestingModule } from '@nestjs/testing';
import { EtherscanController } from './etherscan.controller';
import { EtherscanService } from './etherscan.service';

describe('EtherscanController', () => {
  let controller: EtherscanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EtherscanController],
      providers: [EtherscanService],
    }).compile();

    controller = module.get<EtherscanController>(EtherscanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
