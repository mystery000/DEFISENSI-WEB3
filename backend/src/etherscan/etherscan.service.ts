import Web3 from 'web3';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { logger } from 'src/utils/logger';
import { ERC20_CONTRACT_ABI } from './abi';
import { ETHEREUM_SWAP_TOPICS } from './constants';
import { TokenService } from 'src/token/token.service';
import { WalletService } from 'src/wallet/wallet.service';
import { EthereumConfig } from '../config/ethereum.config';
import { NetworkType } from 'src/utils/enums/network.enum';
import { TransactionType } from 'src/utils/enums/transaction.enum';

@Injectable()
export class EtherscanService {
  private readonly web3: Web3;
  private readonly etherscanApiBaseUrl = 'https://api.etherscan.io/api';
  private config: EthereumConfig;
  private coinGeckoCoinIds: { id: string; symbol: string; name: string }[] = [];

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    @Inject(forwardRef(() => TokenService))
    private readonly tokenService: TokenService,
  ) {
    this.config = this.configService.get<EthereumConfig>('ethereum');
    const provider = `https://${this.config.network}.infura.io/v3/${this.config.infura_api_key}`;
    this.web3 = new Web3(provider);
  }

  async initializeWalletTransactions(address: string) {
    try {
      const currentBlock = await this.web3.eth.getBlock('latest');
      const axiosResponse = this.http.get(
        `${this.etherscanApiBaseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=${
          currentBlock.number + 1n
        }&sort=asc&apikey=${this.config.etherscanApiKey}`,
      );
      const transactions = (await firstValueFrom(axiosResponse)).data.result || [];

      // save all transactions to wallet database using wallet service
      this.walletService.initializeTransactions(
        address,
        transactions.map((transaction) => ({
          txhash: transaction.hash,
          blockNumber: transaction.blockNumber,
          details: null,
        })),
      );
    } catch (error) {
      logger.error(error);
    }
  }

  async updateWalletTransactions(address: string, startBlockNumber: number) {
    const currentBlock = await this.web3.eth.getBlock('latest');

    try {
      const axiosResponse = this.http.get(
        `${
          this.etherscanApiBaseUrl
        }?module=account&action=txlist&address=${address}&startblock=${startBlockNumber}&endblock=${
          currentBlock.number + 1n
        }&sort=asc&apikey=${this.config.etherscanApiKey}`,
      );

      const transactions = (await firstValueFrom(axiosResponse)).data.result;

      // save all transactions to wallet database using wallet service
      this.walletService.updateTransactions(
        address,
        transactions.map((transaction) => ({
          txhash: transaction.hash,
          blockNumber: transaction.blockNumber,
          details: null,
        })),
      );
    } catch (error) {
      logger.error(error);
    }
  }

  async initializeTokenTransactions(address: string, network: string) {
    try {
      const contract = new this.web3.eth.Contract(ERC20_CONTRACT_ABI, address);
      const currentBlock = await this.web3.eth.getBlock('latest');
      const events: any = await contract.getPastEvents('allEvents', {
        fromBlock: currentBlock.number - 100n,
        toBlock: 'latest',
      });

      // save all transactions to wallet database using wallet service
      this.tokenService.initializeTransactions(
        address,
        network,
        events.map((event) => ({
          txhash: event.transactionHash,
          blockNumber: event.blockNumber,
          details: null,
        })),
      );
    } catch (error) {
      logger.error(error);
    }
  }

  async updateTokenTransactions(address: string, network: string, startBlockNumber: number) {
    const contract = new this.web3.eth.Contract(ERC20_CONTRACT_ABI, address);
    const currentBlock = await this.web3.eth.getBlock('latest');
    let toBlockNumber = Number(currentBlock.number);
    if (toBlockNumber - startBlockNumber > 50) toBlockNumber = startBlockNumber + 50;

    try {
      const events: any = await contract.getPastEvents('allEvents', {
        fromBlock: BigInt(startBlockNumber) + 1n,
        toBlock: BigInt(toBlockNumber),
      });

      // save all transactions to wallet database using wallet service
      this.tokenService.updateTransactions(
        address,
        network,
        events.map((event) => ({
          txhash: event.transactionHash,
          blockNumber: event.blockNumber,
          details: null,
        })),
      );
    } catch (error) {
      logger.error(error);
    }
  }

  async getTransactionDetail(txhash: string, address: string, network: string = NetworkType.Ethereum) {
    try {
      const transactionDetails = await this.web3.eth.getTransaction(txhash);
      const blockData = await this.web3.eth.getBlock(transactionDetails.blockNumber);
      const created = Number(blockData.timestamp) * 1000;
      let type: TransactionType = TransactionType.SEND;
      const transactionReceipt = await this.web3.eth.getTransactionReceipt(txhash);

      // Check if logs contain swap topic
      const isSwap =
        transactionReceipt.logs.findIndex(
          (log) =>
            log.topics && log.topics.length > 0 && Object.keys(ETHEREUM_SWAP_TOPICS).includes(log.topics[0].toString()),
        ) >= 0;
      if (isSwap) {
        let swaps = [];
        type = TransactionType.SWAP;
        for (let i = 0; i < transactionReceipt.logs.length; i++) {
          const log = transactionReceipt.logs[i];
          let topic = '';
          if (log.topics && log.topics.length > 0) {
            topic = log.topics[0].toString();
          }
          if (Object.keys(ETHEREUM_SWAP_TOPICS).includes(topic)) {
            const swapAbi = ETHEREUM_SWAP_TOPICS[topic].abi.find((abi) => abi.name == 'Swap' && abi.type == 'event');
            const decodedLog = this.web3.eth.abi.decodeLog(
              [...swapAbi.inputs],
              log.data.toString(),
              log.topics.map((topic) => topic.toString()),
            );

            const pairContract = new this.web3.eth.Contract(ETHEREUM_SWAP_TOPICS[topic].abi, log.address);

            let amount0: any;
            let amount1: any;
            let token0: any;
            let token1: any;

            if (ETHEREUM_SWAP_TOPICS[topic].name == 'Uniswap_V3') {
              amount0 = decodedLog.amount0;
              amount1 = decodedLog.amount1;
              token0 = await pairContract.methods.token0().call();
              token1 = await pairContract.methods.token1().call();
              if (Number(decodedLog.amount0) < 0) {
                const token3 = token0;
                token0 = token1;
                token1 = token3;
                const amount3 = amount0;
                amount0 = amount1;
                amount1 = amount3;
              }
            } else if (ETHEREUM_SWAP_TOPICS[topic].name == 'Uniswap_V2') {
              amount0 = Number(decodedLog.amount0In) > 0 ? decodedLog.amount0In : decodedLog.amount0Out;
              amount1 = Number(decodedLog.amount1In) > 0 ? decodedLog.amount1In : decodedLog.amount1Out;
              token0 = await pairContract.methods.token0().call();
              token1 = await pairContract.methods.token1().call();
            }
            swaps.push({
              token0: {
                address: token0,
                amount: amount0,
              },
              token1: {
                address: token1,
                amount: amount1,
              },
            });
          }
        }

        const len = swaps.length;
        const tokenContract0 = new this.web3.eth.Contract(ERC20_CONTRACT_ABI, swaps[0].token0.address);
        const symbol0 = (await tokenContract0.methods.symbol().call()) as string;
        const decimals0 = await tokenContract0.methods.decimals().call();
        const price0 = await this.getPrice(symbol0, created);

        const tokenContract1 = new this.web3.eth.Contract(ERC20_CONTRACT_ABI, swaps[len - 1].token1.address);
        const symbol1 = (await tokenContract1.methods.symbol().call()) as string;
        const decimals1 = await tokenContract1.methods.decimals().call();
        const price1 = await this.getPrice(symbol1, created);

        return {
          from: address,
          to: address,
          type: type,
          token0: {
            symbol: symbol0,
            address: swaps[0].token0.address,
            amount: Number(swaps[0].token0.amount),
            decimals: decimals0,
            price: price0,
          },
          token1: {
            symbol: symbol1,
            address: swaps[len - 1].token1.address,
            amount: Number(swaps[len - 1].token1.amount),
            decimals: decimals1,
            price: price1,
          },
          created,
        };
      } else {
        const transferFunctionSelector = '0xa9059cbb';
        const extractedFunctionSelector = transactionDetails.input.substring(0, 10);
        if (extractedFunctionSelector === transferFunctionSelector) {
          const tokenContract = new this.web3.eth.Contract(ERC20_CONTRACT_ABI, transactionReceipt.logs[0].address);
          const symbol = (await tokenContract.methods.symbol().call()) as string;
          const decimals = await tokenContract.methods.decimals().call();
          const amount = parseInt(transactionReceipt.logs[0].data.toString());
          const from = transactionReceipt.logs[0].topics[1];
          const to = transactionReceipt.logs[0].topics[2];
          const price = await this.getPrice(symbol, created);

          return {
            from,
            to,
            type: address === to ? TransactionType.RECEIVE : TransactionType.SEND,
            created,
            token0: { address: transactionReceipt.logs[0].address, symbol, amount, decimals, price },
          };
        } else {
          if (Number(transactionDetails.value) > 0 && transactionDetails.input === '0x') {
            const price = await this.getPrice('eth', created);
            return {
              from: transactionDetails.from,
              to: transactionDetails.to,
              type: address === transactionDetails.to ? TransactionType.RECEIVE : TransactionType.SEND,
              created,
              token0: {
                address: 'NATIVE TOKEN',
                symbol: 'ETH',
                amount: Number(transactionDetails.value),
                decimals: 18,
                price,
              },
            };
          }
        }
      }
    } catch (error) {
      logger.error(error);
    }
    return null;
  }

  // This function fetches the currecy of the tokens
  async getPrice(symbol: string, timestamp: number) {
    const COINGECKO_API = 'https://api.coingecko.com/api/v3';
    try {
      if (!this.coinGeckoCoinIds.length) {
        const coingecko_coins = (await firstValueFrom(this.http.get(`${COINGECKO_API}/coins/list`))).data as {
          id: string;
          symbol: string;
          name: string;
        }[];
        this.coinGeckoCoinIds = coingecko_coins;
      }
    } catch (error) {
      logger.error(error);
      this.coinGeckoCoinIds = [];
    }
    const coinId = this.coinGeckoCoinIds.find((coin) => coin.symbol === symbol.toLowerCase())?.id;

    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
    const year = date.getFullYear();
    const coingeckoDate = `${day}-${month}-${year}`;

    try {
      const price = this.http.get(`${COINGECKO_API}/coins/${coinId}/history?date=${coingeckoDate}&localization=false`);
      const usd = (await firstValueFrom(price)).data['market_data']['current_price'].usd;
      return usd;
    } catch (error) {
      logger.error(error);
      return 0;
    }
  }

  async test() {
    // this.tokenService.setTransactionDetail(
    //   '0xc6303745577b56a70fed0f9a8a710f0e40fbdcb1c2d118a86416d08be16ac767',
    //   '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    // );
    // return this.updateTokenTransactions('0xdAC17F958D2ee523a2206206994597C13D831ec7', '17773652');
    // await this.walletService.setTransactionDetail(
    //   '0x9459f9b8249b8b51ce29cf74e5f4d8c404ec093c5b738829e61fd832e57db929',
    //   '0x6593cDf7B55900cE51FaDd3E2660cF8A9b85d32f',
    // );
    // await this.initWalletTransactions('0x6593cDf7B55900cE51FaDd3E2660cF8A9b85d32f');
    // console.log(
    //   await this.getTransactionDetail(
    //     '0xc59553ee3b2417dde18c6c364dd23ab19dde17c6612a890aea13a257a9bce67f',
    //     '0xDe10E8d03b9E293A332A248a114F6ae37eADB6Ce',
    //   ),
    // );
    // return this.getPrice('bnb', convertToCoinGeckoDate(1690821573764));
    // Setup: npm install alchemy-sdk
    console.log(await this.walletService.getTokenBalances('0x98dC5C7fB775C01cab30D3f71e31d6606972Bd57'));
  }
}
