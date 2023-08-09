import { HttpService } from '@nestjs/axios';
import { Injectable, forwardRef, Inject } from '@nestjs/common';

import Web3 from 'web3';
import Moralis from 'moralis';
import { logger } from 'src/utils/logger';
import { Transaction } from 'src/utils/types';
import { MIN_BLOCK_NUMBER } from './constants';
import { ConfigService } from '@nestjs/config';
import { TokenService } from 'src/token/token.service';
import { WalletService } from 'src/wallet/wallet.service';
import { MoralisConfig } from 'src/config/moralis.config';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { EthereumConfig } from 'src/config/ethereum.config';

@Injectable()
export class EtherscanService {
  private readonly web3: Web3;
  private readonly moralisConfig: MoralisConfig;
  private readonly ethereumConfig: EthereumConfig;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    @Inject(forwardRef(() => TokenService))
    private readonly tokenService: TokenService,
  ) {
    this.moralisConfig = this.configService.get<MoralisConfig>('moralis');
    this.ethereumConfig = this.configService.get<EthereumConfig>('ethereum');
    const provider = `https://${this.ethereumConfig.network}.infura.io/v3/${this.ethereumConfig.infura_api_key}`;
    this.web3 = new Web3(provider);
  }

  async getTransactionsByWallet(address: string, startBlock: number = MIN_BLOCK_NUMBER) {
    const transactions: Transaction[] = [];
    try {
      await Moralis.start({
        apiKey: this.moralisConfig.secretKey,
      });

      let cursor = null;

      // Get native transactions by wallet
      do {
        const response = await Moralis.EvmApi.transaction.getWalletTransactions({
          chain: EvmChain.ETHEREUM,
          fromBlock: startBlock,
          address: address,
          limit: 25,
          cursor: cursor,
        });

        let priceKey = '';
        const tokenPrice = {};
        const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH(Wrapped Ether) Address

        for (const tx of response.toJSON().result) {
          // Calculate the ETH's USD price at given block on Uniswap V3
          priceKey = `${wethAddress}-${tx.block_number}`;

          try {
            if (!tokenPrice[priceKey]) {
              if (Number(tx.value) !== 0) {
                const res = await Moralis.EvmApi.token.getTokenPrice({
                  address: wethAddress,
                  chain: EvmChain.ETHEREUM,
                  toBlock: Number(tx.block_number),
                });
                tokenPrice[priceKey] = res.toJSON().usdPrice;
              } else tokenPrice[priceKey] = 0;
            }
          } catch (err) {
            tokenPrice[priceKey] = 0;
          }

          transactions.push({
            txhash: tx.hash,
            blockNumber: tx.block_number,
            details: {
              from: tx.from_address,
              to: tx.to_address,
              timestamp: new Date(tx.block_timestamp).getTime(),
              token0: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: '18',
                contractAddress: wethAddress,
                logo: null,
                value: tx.value,
                usdPrice: ((tokenPrice[priceKey] * Number(tx.value)) / 1e18).toString(),
              },
            },
          });
        }

        cursor = response.pagination.cursor;

        // Fetch the latest 25 transactions if its first time to get transactions of wallet
        if (startBlock === MIN_BLOCK_NUMBER) break;
      } while (cursor != '' && cursor != null);

      // Get ERC20 token transfers by wallet
      do {
        const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
          chain: EvmChain.ETHEREUM,
          fromBlock: startBlock,
          address: address,
          limit: 25,
          cursor: cursor,
        });

        let priceKey = '';
        const tokenPrice = {};

        for (const tx of response.toJSON().result) {
          // Calculate the ETH's USD price at given block on Uniswap V3
          priceKey = `${tx.address}-${tx.block_number}`;
          try {
            if (!tokenPrice[priceKey]) {
              if (Number(tx.value) !== 0) {
                const res = await Moralis.EvmApi.token.getTokenPrice({
                  address: tx.address,
                  chain: EvmChain.ETHEREUM,
                  toBlock: Number(tx.block_number),
                });
                tokenPrice[priceKey] = res.toJSON().usdPrice;
              } else tokenPrice[priceKey] = 0;
            }
          } catch (err) {
            tokenPrice[priceKey] = 0;
          }
          transactions.push({
            txhash: tx.transaction_hash,
            blockNumber: tx.block_number,
            details: {
              from: tx.from_address,
              to: tx.to_address,
              timestamp: new Date(tx.block_timestamp).getTime(),
              token0: {
                name: tx.token_name,
                symbol: tx.token_symbol,
                logo: tx.token_logo,
                decimals: tx.token_decimals,
                contractAddress: tx.address,
                value: tx.value,
                usdPrice: (tokenPrice[priceKey] * Number(tx.value_decimal)).toString(),
              },
            },
          });
        }

        cursor = response.pagination.cursor;

        // Fetch the latest 25 transactions if its first time to get transactions of wallet
        if (startBlock === MIN_BLOCK_NUMBER) break;
      } while (cursor != '' && cursor != null);
    } catch (err) {
      logger.error(err);
      return transactions;
    }
    return transactions;
  }
  async getTransactionByToken(contractAddress: string, startBlock: number = MIN_BLOCK_NUMBER) {}

  async getTransactionByNFT(contractAddress: string, startBlock: number = 0) {}

  async getTransactionDetail(txhash: string) {}

  async test() {
    return this.getTransactionsByWallet('0xB8cDA067FaBEDD1bB6C11C626862D7255a2414Fe');
  }
}
