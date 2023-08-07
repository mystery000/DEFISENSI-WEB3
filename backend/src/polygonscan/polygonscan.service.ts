import Web3 from 'web3';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { firstValueFrom } from 'rxjs';
import { Transaction } from 'src/utils/types';
import { Network, Alchemy, AssetTransfersCategory, SortingOrder } from 'alchemy-sdk';
import { TokenService } from 'src/token/token.service';
import { PolygonConfig } from 'src/config/polygon.config';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class PolygonscanService {
  private readonly web3: Web3;
  private readonly alchemy: Alchemy;
  private readonly polygonscanApiBaseUrl = 'https://api.polygonscan.com/api';
  private config: PolygonConfig;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    @Inject(forwardRef(() => TokenService))
    private readonly tokenService: TokenService,
  ) {
    const settings = {
      apiKey: process.env.ALCHEMY_MATIC_MAINNET_API_KEY,
      network: Network.MATIC_MAINNET,
    };
    this.alchemy = new Alchemy(settings);

    this.config = this.configService.get<PolygonConfig>('polygon');
    const provider = `https://${this.config.network}.infura.io/v3/${this.config.infura_api_key}`;
    this.web3 = new Web3(provider);
  }

  async getTransactionsByWallet(address: string, startBlockNumber: number) {
    const latestBlockNumber = await this.alchemy.core.getBlockNumber();
    try {
      const res = this.http.get(
        `${this.polygonscanApiBaseUrl}?module=account&action=txlist&address=${address}&startblock=${startBlockNumber}&endblock=${latestBlockNumber}&sort=asc&apikey=${this.config.polygonscanApiKey}`,
      );
      const txs = ((await firstValueFrom(res)).data.result || []) as any[];

      const transactions = txs.map((tx) => ({
        txhash: tx.hash,
        blockNumber: tx.blockNumber,
        details: null,
      })) as Transaction[];
    } catch (error) {
      console.log(error);
    }
  }

  async getTransactionsByToken(address: string, startBlockNumber: number = 0) {
    const MAX_BLOCKS = 100;
    const latestBlockNumber = (await this.alchemy.core.getBlockNumber()) - MAX_BLOCKS;

    // const allTransfers = await this.alchemy.core.getAssetTransfers({
    //   fromBlock: '0x0',
    //   toBlock: 'latest',
    //   contractAddresses: [address], // You can replace with contract of your choosing
    //   excludeZeroValue: true,
    //   category: [AssetTransfersCategory.ERC20],
    //   maxCount: 1000,
    //   order: SortingOrder.DESCENDING,
    // });
    // console.log(allTransfers);

    for (let i = startBlockNumber; i < latestBlockNumber; i++) {
      const txs = await this.alchemy.core.getTransactionReceipts({ blockNumber: i.toString() });
    }
  }

  async test() {
    // this.getTransactionsByWallet('0x98dC5C7fB775C01cab30D3f71e31d6606972Bd57', 0);
    this.getTransactionsByToken('0xc2132D05D31c914a87C6611C10748AEb04B58e8F');
  }
}
