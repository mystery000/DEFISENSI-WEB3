import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import Web3 from 'web3';
import axios from 'axios';
import Moralis from 'moralis';
import * as moment from 'moment';
import { UNISWAP_ABI } from './abi';
import { logger } from 'src/utils/logger';
import { ConfigService } from '@nestjs/config';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { MoralisConfig } from 'src/config/moralis.config';
import { EthereumConfig } from 'src/config/ethereum.config';
import { isUniswapV2, isUniswapV3 } from 'src/utils/moralis';
import { TransactionType } from 'src/utils/enums/transaction.enum';
import { ExchangePrice, HistoricalPrice, NFT, TokenBalance, Transaction } from 'src/utils/types';

@Injectable()
export class EtherscanService {
  private readonly web3: Web3;
  private readonly moralisConfig: MoralisConfig;
  private readonly ethereumConfig: EthereumConfig;
  private readonly WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // Wrapped Ether address

  constructor(private readonly http: HttpService, private readonly configService: ConfigService) {
    this.moralisConfig = this.configService.get<MoralisConfig>('moralis');
    this.ethereumConfig = this.configService.get<EthereumConfig>('ethereum');
    const provider = `https://${this.ethereumConfig.network}.infura.io/v3/${this.ethereumConfig.infura_api_key}`;
    this.web3 = new Web3(provider);
  }

  async getTransactionsByWallet(address: string, fromBlock: number = 0) {
    const response = await Moralis.EvmApi.transaction.getWalletTransactionsVerbose({
      chain: EvmChain.ETHEREUM,
      address,
      limit: 4,
      fromBlock,
    });

    const transactions: Transaction[] = [];

    for (const tx of response.toJSON().result) {
      // Native token transaction
      if (tx.logs.length == 0 && tx.value != '0') {
        const response = await Moralis.EvmApi.token.getTokenPrice({
          chain: EvmChain.ETHEREUM,
          address: this.WETH_ADDRESS,
          toBlock: Number(tx.block_number),
        });

        transactions.push({
          txhash: tx.hash,
          blockNumber: tx.block_number,
          type: TransactionType.TOKEN,
          details: {
            from: tx.from_address,
            to: tx.to_address,
            timestamp: new Date(tx.block_timestamp).getTime(),
            token0: {
              name: 'Ether',
              symbol: 'ETH',
              decimals: '18',
              contractAddress: response.toJSON().tokenAddress,
              logo: null,
              value: tx.value,
              usdPrice: ((response.toJSON().usdPrice * Number(tx.value)) / 1e18).toString(),
            },
          },
        });
        continue;
      }

      /*
        Swap or Transfer transaction
        check if transaction is swap transaction
       */

      const swapLogs = tx.logs.filter((log) => log.decoded_event?.label === 'Swap');
      if (swapLogs.length > 0) {
        let tokenIn = null;
        let amountIn = null;
        let tokenOut = null;
        let amountOut = null;
        let to = null;

        // Input the token
        let log = swapLogs[0];
        if (isUniswapV2(log.decoded_event.signature) || isUniswapV3(log.decoded_event.signature)) {
          const pairContract = new this.web3.eth.Contract(
            isUniswapV2(log.decoded_event.signature) ? UNISWAP_ABI.v2 : UNISWAP_ABI.v3,
            log.address,
          );
          let token0 = (await pairContract.methods.token0().call()) as any;
          let token1 = (await pairContract.methods.token1().call()) as any;
          let amount0 = isUniswapV2(log.decoded_event.signature)
            ? Number(log.decoded_event.params.find((param) => param.name === 'amount0In').value)
            : Number(log.decoded_event.params.find((param) => param.name === 'amount0').value);
          let amount1 = isUniswapV2(log.decoded_event.signature)
            ? Number(log.decoded_event.params.find((param) => param.name === 'amount1Out').value)
            : Number(log.decoded_event.params.find((param) => param.name === 'amount1').value);
          let toAddress = isUniswapV2(log.decoded_event.signature)
            ? log.decoded_event.params.find((param) => param.name === 'to').value
            : log.decoded_event.params.find((param) => param.name === 'recipient').value;
          if (isUniswapV2(log.decoded_event.signature) && amount0 == 0) {
            amount0 = isUniswapV2(log.decoded_event.signature)
              ? Number(log.decoded_event.params.find((param) => param.name === 'amount1In').value)
              : Number(log.decoded_event.params.find((param) => param.name === 'amount0').value);
            amount1 = isUniswapV2(log.decoded_event.signature)
              ? Number(log.decoded_event.params.find((param) => param.name === 'amount0Out').value)
              : Number(log.decoded_event.params.find((param) => param.name === 'amount1').value);
            const token3 = token0;
            token0 = token1;
            token1 = token3;
          }
          if (isUniswapV3(log.decoded_event.signature) && amount0 < 0) {
            const token3 = token0;
            token0 = token1;
            token1 = token3;
            const amount3 = Math.abs(amount0);
            amount0 = Math.abs(amount1);
            amount1 = amount3;
          }
          amount1 = Math.abs(amount1);
          // Return the transaction
          if (swapLogs.length == 1) {
            const token0Contract = await Moralis.EvmApi.token.getTokenPrice({
              chain: EvmChain.ETHEREUM,
              address: token0,
              toBlock: Number(tx.block_number),
            });
            const token1Contract = await Moralis.EvmApi.token.getTokenPrice({
              chain: EvmChain.ETHEREUM,
              address: token1,
              toBlock: Number(tx.block_number),
            });
            transactions.push({
              txhash: tx.hash,
              blockNumber: tx.block_number,
              type: TransactionType.TOKEN,
              details: {
                from: tx.from_address,
                to: toAddress,
                timestamp: new Date(tx.block_timestamp).getTime(),
                token0: {
                  name: token0Contract.toJSON().tokenName,
                  symbol: token0Contract.toJSON().tokenSymbol,
                  decimals: token0Contract.toJSON().tokenDecimals,
                  contractAddress: token0Contract.toJSON().tokenAddress,
                  logo: token0Contract.toJSON().tokenLogo,
                  value: amount0.toString(),
                  usdPrice: (
                    (token0Contract.toJSON().usdPrice * amount0) /
                    10 ** Number(token0Contract.toJSON().tokenDecimals)
                  ).toString(),
                },
                token1: {
                  name: token1Contract.toJSON().tokenName,
                  symbol: token1Contract.toJSON().tokenSymbol,
                  decimals: token1Contract.toJSON().tokenDecimals,
                  contractAddress: token1Contract.toJSON().tokenAddress,
                  logo: token1Contract.toJSON().tokenLogo,
                  value: amount1.toString(),
                  usdPrice: (
                    (token1Contract.toJSON().usdPrice * amount1) /
                    10 ** Number(token1Contract.toJSON().tokenDecimals)
                  ).toString(),
                },
              },
            });
            continue;
          }
          tokenIn = token0;
          amountIn = amount0;
        }

        // Output the token
        log = swapLogs.at(-1);
        if (isUniswapV2(log.decoded_event.signature) || isUniswapV3(log.decoded_event.signature)) {
          const pairContract = new this.web3.eth.Contract(
            isUniswapV2(log.decoded_event.signature) ? UNISWAP_ABI.v2 : UNISWAP_ABI.v3,
            log.address,
          );
          let token0 = (await pairContract.methods.token0().call()) as any;
          let token1 = (await pairContract.methods.token1().call()) as any;
          let amount0 = isUniswapV2(log.decoded_event.signature)
            ? Number(log.decoded_event.params.find((param) => param.name === 'amount0In').value)
            : Number(log.decoded_event.params.find((param) => param.name === 'amount0').value);
          let amount1 = isUniswapV2(log.decoded_event.signature)
            ? Number(log.decoded_event.params.find((param) => param.name === 'amount1Out').value)
            : Number(log.decoded_event.params.find((param) => param.name === 'amount1').value);
          let toAddress = isUniswapV2(log.decoded_event.signature)
            ? log.decoded_event.params.find((param) => param.name === 'to').value
            : log.decoded_event.params.find((param) => param.name === 'recipient').value;
          if (isUniswapV2(log.decoded_event.signature) && amount0 == 0) {
            amount0 = isUniswapV2(log.decoded_event.signature)
              ? Number(log.decoded_event.params.find((param) => param.name === 'amount1In').value)
              : Number(log.decoded_event.params.find((param) => param.name === 'amount0').value);
            amount1 = isUniswapV2(log.decoded_event.signature)
              ? Number(log.decoded_event.params.find((param) => param.name === 'amount0Out').value)
              : Number(log.decoded_event.params.find((param) => param.name === 'amount1').value);
            const token3 = token0;
            token0 = token1;
            token1 = token3;
          }
          if (isUniswapV3(log.decoded_event.signature) && amount0 < 0) {
            const token3 = token0;
            token0 = token1;
            token1 = token3;
            const amount3 = Math.abs(amount0);
            amount0 = Math.abs(amount1);
            amount1 = amount3;
          }
          amount1 = Math.abs(amount1);
          tokenOut = token1;
          amountOut = amount1;
          to = toAddress;
        }

        const tokenInContract = await Moralis.EvmApi.token.getTokenPrice({
          chain: EvmChain.ETHEREUM,
          address: tokenIn,
          toBlock: Number(tx.block_number),
        });
        const tokenOutContract = await Moralis.EvmApi.token.getTokenPrice({
          chain: EvmChain.ETHEREUM,
          address: tokenOut,
          toBlock: Number(tx.block_number),
        });
        transactions.push({
          txhash: tx.hash,
          blockNumber: tx.block_number,
          type: TransactionType.TOKEN,
          details: {
            from: tx.from_address,
            to: to,
            timestamp: new Date(tx.block_timestamp).getTime(),
            token0: {
              name: tokenInContract.toJSON().tokenName,
              symbol: tokenInContract.toJSON().tokenSymbol,
              decimals: tokenInContract.toJSON().tokenDecimals,
              contractAddress: tokenInContract.toJSON().tokenAddress,
              logo: tokenInContract.toJSON().tokenLogo,
              value: amountIn.toString(),
              usdPrice: (
                (tokenInContract.toJSON().usdPrice * amountIn) /
                10 ** Number(tokenInContract.toJSON().tokenDecimals)
              ).toString(),
            },
            token1: {
              name: tokenOutContract.toJSON().tokenName,
              symbol: tokenOutContract.toJSON().tokenSymbol,
              decimals: tokenOutContract.toJSON().tokenDecimals,
              contractAddress: tokenOutContract.toJSON().tokenAddress,
              logo: tokenOutContract.toJSON().tokenLogo,
              value: amountOut.toString(),
              usdPrice: (
                (tokenOutContract.toJSON().usdPrice * amountOut) /
                10 ** Number(tokenOutContract.toJSON().tokenDecimals)
              ).toString(),
            },
          },
        });
      } else {
        if (tx.logs.length == 0 && tx.value == '0') continue;

        const transferLog = tx.logs.find(
          (log) =>
            log.decoded_event.label === 'Transfer' &&
            log.decoded_event.params.find((param) => param.name == 'from').value.toLowerCase() === tx.from_address,
        );

        if (!transferLog) continue;

        const transfer_to = transferLog.decoded_event.params.find((param) => param.name === 'to').value;
        const tranfer_value = transferLog.decoded_event.params.find((param) => param.name === 'value').value;

        const erc20Token = await Moralis.EvmApi.token.getTokenPrice({
          chain: EvmChain.ETHEREUM,
          address: transferLog.address,
          toBlock: Number(tx.block_number),
        });

        transactions.push({
          txhash: tx.hash,
          blockNumber: tx.block_number,
          type: TransactionType.TOKEN,
          details: {
            from: tx.from_address,
            to: transfer_to,
            timestamp: new Date(transferLog.block_timestamp).getTime(),
            token0: {
              name: erc20Token.toJSON().tokenName,
              symbol: erc20Token.toJSON().tokenSymbol,
              decimals: erc20Token.toJSON().tokenDecimals,
              contractAddress: transferLog.address,
              logo: erc20Token.toJSON().tokenLogo,
              value: tranfer_value,
              usdPrice: (
                (erc20Token.toJSON().usdPrice * Number(tranfer_value)) /
                10 ** Number(erc20Token.toJSON().tokenDecimals)
              ).toString(),
            },
          },
        });
      }
    }

    return transactions;
  }

  async getTransactionsByToken(contractAddress: string, fromBlock: number = 0) {
    let txHashs = [];
    let transactions: Transaction[] = [];

    const contractLogs = await Moralis.EvmApi.events.getContractLogs({
      address: contractAddress,
      chain: EvmChain.ETHEREUM,
      limit: 4,
      fromBlock: fromBlock.toString(),
    });

    for (const log of contractLogs.toJSON().result) {
      if (!txHashs.includes(log.transaction_hash)) {
        txHashs.push(log.transaction_hash);
      }
    }

    for (const txHash of txHashs) {
      const tx = (
        await Moralis.EvmApi.transaction.getTransactionVerbose({
          chain: EvmChain.ETHEREUM,
          transactionHash: txHash,
        })
      ).toJSON();

      /*
        Swap or Transfer transaction
        check if transaction is swap transaction
       */

      const swapLogs = tx.logs.filter((log) => log.decoded_event?.label === 'Swap');
      if (swapLogs.length > 0) {
        let tokenIn = null;
        let amountIn = null;
        let tokenOut = null;
        let amountOut = null;
        let to = null;

        // Input the token
        let log = swapLogs[0];
        if (isUniswapV2(log.decoded_event.signature) || isUniswapV3(log.decoded_event.signature)) {
          const pairContract = new this.web3.eth.Contract(
            isUniswapV2(log.decoded_event.signature) ? UNISWAP_ABI.v2 : UNISWAP_ABI.v3,
            log.address,
          );
          let token0 = (await pairContract.methods.token0().call()) as any;
          let token1 = (await pairContract.methods.token1().call()) as any;
          let amount0 = isUniswapV2(log.decoded_event.signature)
            ? Number(log.decoded_event.params.find((param) => param.name === 'amount0In').value)
            : Number(log.decoded_event.params.find((param) => param.name === 'amount0').value);
          let amount1 = isUniswapV2(log.decoded_event.signature)
            ? Number(log.decoded_event.params.find((param) => param.name === 'amount1Out').value)
            : Number(log.decoded_event.params.find((param) => param.name === 'amount1').value);
          let toAddress = isUniswapV2(log.decoded_event.signature)
            ? log.decoded_event.params.find((param) => param.name === 'to').value
            : log.decoded_event.params.find((param) => param.name === 'recipient').value;
          if (isUniswapV2(log.decoded_event.signature) && amount0 == 0) {
            amount0 = isUniswapV2(log.decoded_event.signature)
              ? Number(log.decoded_event.params.find((param) => param.name === 'amount1In').value)
              : Number(log.decoded_event.params.find((param) => param.name === 'amount0').value);
            amount1 = isUniswapV2(log.decoded_event.signature)
              ? Number(log.decoded_event.params.find((param) => param.name === 'amount0Out').value)
              : Number(log.decoded_event.params.find((param) => param.name === 'amount1').value);
            const token3 = token0;
            token0 = token1;
            token1 = token3;
          }
          if (isUniswapV3(log.decoded_event.signature) && amount0 < 0) {
            const token3 = token0;
            token0 = token1;
            token1 = token3;
            const amount3 = Math.abs(amount0);
            amount0 = Math.abs(amount1);
            amount1 = amount3;
          }
          amount1 = Math.abs(amount1);
          // Return the transaction
          if (swapLogs.length == 1) {
            const token0Contract = await Moralis.EvmApi.token.getTokenPrice({
              chain: EvmChain.ETHEREUM,
              address: token0,
              toBlock: Number(tx.block_number),
            });
            const token1Contract = await Moralis.EvmApi.token.getTokenPrice({
              chain: EvmChain.ETHEREUM,
              address: token1,
              toBlock: Number(tx.block_number),
            });
            transactions.push({
              txhash: tx.hash,
              blockNumber: tx.block_number,
              type: TransactionType.TOKEN,
              details: {
                from: tx.from_address,
                to: toAddress,
                timestamp: new Date(tx.block_timestamp).getTime(),
                token0: {
                  name: token0Contract.toJSON().tokenName,
                  symbol: token0Contract.toJSON().tokenSymbol,
                  decimals: token0Contract.toJSON().tokenDecimals,
                  contractAddress: token0Contract.toJSON().tokenAddress,
                  logo: token0Contract.toJSON().tokenLogo,
                  value: amount0.toString(),
                  usdPrice: (
                    (token0Contract.toJSON().usdPrice * amount0) /
                    10 ** Number(token0Contract.toJSON().tokenDecimals)
                  ).toString(),
                },
                token1: {
                  name: token1Contract.toJSON().tokenName,
                  symbol: token1Contract.toJSON().tokenSymbol,
                  decimals: token1Contract.toJSON().tokenDecimals,
                  contractAddress: token1Contract.toJSON().tokenAddress,
                  logo: token1Contract.toJSON().tokenLogo,
                  value: amount1.toString(),
                  usdPrice: (
                    (token1Contract.toJSON().usdPrice * amount1) /
                    10 ** Number(token1Contract.toJSON().tokenDecimals)
                  ).toString(),
                },
              },
            });
            continue;
          }
          tokenIn = token0;
          amountIn = amount0;
        }

        // Output the token
        log = swapLogs.at(-1);
        if (isUniswapV2(log.decoded_event.signature) || isUniswapV3(log.decoded_event.signature)) {
          const pairContract = new this.web3.eth.Contract(
            isUniswapV2(log.decoded_event.signature) ? UNISWAP_ABI.v2 : UNISWAP_ABI.v3,
            log.address,
          );
          let token0 = (await pairContract.methods.token0().call()) as any;
          let token1 = (await pairContract.methods.token1().call()) as any;
          let amount0 = isUniswapV2(log.decoded_event.signature)
            ? Number(log.decoded_event.params.find((param) => param.name === 'amount0In').value)
            : Number(log.decoded_event.params.find((param) => param.name === 'amount0').value);
          let amount1 = isUniswapV2(log.decoded_event.signature)
            ? Number(log.decoded_event.params.find((param) => param.name === 'amount1Out').value)
            : Number(log.decoded_event.params.find((param) => param.name === 'amount1').value);
          let toAddress = isUniswapV2(log.decoded_event.signature)
            ? log.decoded_event.params.find((param) => param.name === 'to').value
            : log.decoded_event.params.find((param) => param.name === 'recipient').value;
          if (isUniswapV2(log.decoded_event.signature) && amount0 == 0) {
            amount0 = isUniswapV2(log.decoded_event.signature)
              ? Number(log.decoded_event.params.find((param) => param.name === 'amount1In').value)
              : Number(log.decoded_event.params.find((param) => param.name === 'amount0').value);
            amount1 = isUniswapV2(log.decoded_event.signature)
              ? Number(log.decoded_event.params.find((param) => param.name === 'amount0Out').value)
              : Number(log.decoded_event.params.find((param) => param.name === 'amount1').value);
            const token3 = token0;
            token0 = token1;
            token1 = token3;
          }
          if (isUniswapV3(log.decoded_event.signature) && amount0 < 0) {
            const token3 = token0;
            token0 = token1;
            token1 = token3;
            const amount3 = Math.abs(amount0);
            amount0 = Math.abs(amount1);
            amount1 = amount3;
          }
          amount1 = Math.abs(amount1);
          tokenOut = token1;
          amountOut = amount1;
          to = toAddress;
        }

        const tokenInContract = await Moralis.EvmApi.token.getTokenPrice({
          chain: EvmChain.ETHEREUM,
          address: tokenIn,
          toBlock: Number(tx.block_number),
        });
        const tokenOutContract = await Moralis.EvmApi.token.getTokenPrice({
          chain: EvmChain.ETHEREUM,
          address: tokenOut,
          toBlock: Number(tx.block_number),
        });
        transactions.push({
          txhash: tx.hash,
          blockNumber: tx.block_number,
          type: TransactionType.TOKEN,
          details: {
            from: tx.from_address,
            to: to,
            timestamp: new Date(tx.block_timestamp).getTime(),
            token0: {
              name: tokenInContract.toJSON().tokenName,
              symbol: tokenInContract.toJSON().tokenSymbol,
              decimals: tokenInContract.toJSON().tokenDecimals,
              contractAddress: tokenInContract.toJSON().tokenAddress,
              logo: tokenInContract.toJSON().tokenLogo,
              value: amountIn.toString(),
              usdPrice: (
                (tokenInContract.toJSON().usdPrice * amountIn) /
                10 ** Number(tokenInContract.toJSON().tokenDecimals)
              ).toString(),
            },
            token1: {
              name: tokenOutContract.toJSON().tokenName,
              symbol: tokenOutContract.toJSON().tokenSymbol,
              decimals: tokenOutContract.toJSON().tokenDecimals,
              contractAddress: tokenOutContract.toJSON().tokenAddress,
              logo: tokenOutContract.toJSON().tokenLogo,
              value: amountOut.toString(),
              usdPrice: (
                (tokenOutContract.toJSON().usdPrice * amountOut) /
                10 ** Number(tokenOutContract.toJSON().tokenDecimals)
              ).toString(),
            },
          },
        });
      } else {
        if (tx.logs.length == 0 && tx.value == '0') continue;

        const transferLog = tx.logs.find(
          (log) =>
            log.decoded_event.label === 'Transfer' &&
            log.decoded_event.params.find((param) => param.name == 'from').value.toLowerCase() === tx.from_address,
        );

        if (!transferLog) continue;

        const transfer_to = transferLog.decoded_event.params.find((param) => param.name === 'to').value;
        const tranfer_value = transferLog.decoded_event.params.find((param) => param.name === 'value').value;

        const erc20Token = await Moralis.EvmApi.token.getTokenPrice({
          chain: EvmChain.ETHEREUM,
          address: transferLog.address,
          toBlock: Number(tx.block_number),
        });

        transactions.push({
          txhash: tx.hash,
          blockNumber: tx.block_number,
          type: TransactionType.TOKEN,
          details: {
            from: tx.from_address,
            to: transfer_to,
            timestamp: new Date(transferLog.block_timestamp).getTime(),
            token0: {
              name: erc20Token.toJSON().tokenName,
              symbol: erc20Token.toJSON().tokenSymbol,
              decimals: erc20Token.toJSON().tokenDecimals,
              contractAddress: transferLog.address,
              logo: erc20Token.toJSON().tokenLogo,
              value: tranfer_value,
              usdPrice: (
                (erc20Token.toJSON().usdPrice * Number(tranfer_value)) /
                10 ** Number(erc20Token.toJSON().tokenDecimals)
              ).toString(),
            },
          },
        });
      }
    }

    return transactions;
  }

  async getTransactionsByNFT(address: string, fromBlock: number = 0) {
    let transactions: Transaction[] = [];
    try {
      const response = await Moralis.EvmApi.nft.getNFTContractTransfers({
        chain: EvmChain.ETHEREUM,
        format: 'decimal',
        address,
        limit: 4,
        fromBlock,
      });
      const transfers = response.toJSON().result;
      for (const transfer of transfers) {
        const res = await Moralis.EvmApi.nft.getNFTMetadata({
          chain: EvmChain.ETHEREUM,
          format: 'decimal',
          address,
          normalizeMetadata: false,
          mediaItems: false,
          tokenId: transfer.token_id,
        });

        const metadata = res.toJSON();
        transactions.push({
          txhash: transfer.transaction_hash,
          blockNumber: transfer.block_number,
          type: TransactionType.NFT,
          details: {
            from: transfer.from_address,
            to: transfer.to_address,
            timestamp: new Date(transfer.block_timestamp).getTime(),
            token0: {
              name: metadata.name,
              symbol: metadata.symbol,
              tokenAddress: metadata.token_address,
              amount: metadata.amount,
              tokenId: metadata.token_id,
              contractType: metadata.contract_type,
            },
          },
        });
      }
    } catch (error) {
      logger.error(error);
    } finally {
      return transactions;
    }
  }

  // Get the current block's token balances (native token and ERC20 tokens)
  async getBalances(address: string) {
    let tokens: TokenBalance[] = [];

    // Get the latest block number
    const now = moment();
    const response = await Moralis.EvmApi.block.getDateToBlock({
      chain: EvmChain.ETHEREUM,
      date: now.toString(),
    });

    const latestBlockNumber = response.toJSON().block;
    const timestamp = response.toJSON().block_timestamp;

    // Get native balance by wallet
    const nativeToken = await Moralis.EvmApi.balance.getNativeBalance({
      chain: EvmChain.ETHEREUM,
      address: address,
      toBlock: latestBlockNumber,
    });

    const nativePrice = await Moralis.EvmApi.token.getTokenPrice({
      chain: EvmChain.ETHEREUM,
      address: this.WETH_ADDRESS,
      toBlock: latestBlockNumber,
    });

    tokens.push({
      logo: null,
      name: 'Ether',
      symbol: 'ETH',
      contractAddress: this.WETH_ADDRESS,
      decimals: 18,
      value: nativeToken.toJSON().balance,
      usdPrice: ((nativePrice.toJSON().usdPrice * Number(nativeToken.toJSON().balance)) / 1e18).toFixed(2),
    });

    // Get ERC20 token balance by wallet
    const erc20Tokens = await Moralis.EvmApi.token.getWalletTokenBalances({
      chain: EvmChain.ETHEREUM,
      address,
      toBlock: latestBlockNumber,
    });

    for (const token of erc20Tokens.toJSON()) {
      let price = 0;
      if (!token.possible_spam) {
        try {
          const response = await Moralis.EvmApi.token.getTokenPrice({
            chain: EvmChain.ETHEREUM,
            address: token.token_address,
            toBlock: latestBlockNumber,
          });
          price = response.toJSON().usdPrice;
        } catch (error) {
          // logger.error(error);
        }
      }
      tokens.push({
        logo: token.logo,
        name: token.name,
        symbol: token.symbol,
        contractAddress: token.token_address,
        decimals: token.decimals,
        value: token.balance,
        usdPrice: ((price * Number(token.balance)) / 10 ** token.decimals).toFixed(2),
      });
    }

    return { timestamp, tokens };
  }

  // Get the price history of ERC20 token for 90 days
  async getPriceHistory(contractAddress: string) {
    // const CHAINBASE_BASE_URL = 'https://api.chainbase.online';
    const CHAINBASE_BASE_URL = 'http://95.217.141.220:3000';
    const CHAINBASE_API_KEY = process.env.CHAINBASE_API_KEY;
    let toTimestamp = Math.round(new Date().getTime() / 1000);
    let fromTimestamp = toTimestamp - 86400 * 90;

    try {
      const response = await axios.get(
        `${CHAINBASE_BASE_URL}/v1/token/price/history?chain_id=1&contract_address=${contractAddress}&from_timestamp=${fromTimestamp}&end_timestamp=${toTimestamp}`,
        {
          headers: { accept: 'application/json', 'x-api-key': CHAINBASE_API_KEY },
        },
      );
      return response.data.data as HistoricalPrice[];
    } catch (error) {
      logger.error(error);
      return [] as HistoricalPrice[];
    }
  }

  async getPriceFromExchanges(contractAddress: string) {
    let exchangesPrice: ExchangePrice = {
      tokenName: '',
      tokenAddress: '',
      tokenSymbol: '',
      tokenLogo: '',
      tokenDecimals: '',
      usdPrice: {},
    };

    try {
      // Uniswap V3
      const uniswap = await Moralis.EvmApi.token.getTokenPrice({
        chain: EvmChain.ETHEREUM,
        address: contractAddress,
      });

      if (!uniswap) return exchangesPrice;

      const { tokenDecimals, tokenLogo, tokenName, tokenSymbol, usdPrice } = uniswap.toJSON();

      exchangesPrice.tokenDecimals = tokenDecimals;
      exchangesPrice.tokenLogo = tokenLogo;
      exchangesPrice.tokenName = tokenName;
      exchangesPrice.tokenSymbol = tokenSymbol;
      exchangesPrice.usdPrice = { ...exchangesPrice.usdPrice, uniswap: usdPrice.toString() };
      // Get prices from Binance and Kucoin in parallel
      const [binanceResponse, kucoinResponse] = await Promise.all([
        axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${tokenSymbol}USDT`).catch((error) => {}),
        axios
          .get(`https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${tokenSymbol}-USDT`)
          .catch((error) => {}),
      ]);

      if (binanceResponse && binanceResponse.data) {
        exchangesPrice.usdPrice = { ...exchangesPrice.usdPrice, binance: binanceResponse.data.price };
      }

      if (kucoinResponse && kucoinResponse.data) {
        exchangesPrice.usdPrice = { ...exchangesPrice.usdPrice, kucoin: kucoinResponse.data.data?.price };
      }

      return exchangesPrice;
    } catch (error) {
      logger.error(error);
      return exchangesPrice;
    }
  }

  async getTopERC20Tokens() {
    try {
      // const response = await Moralis.EvmApi.marketData.getTopERC20TokensByMarketCap();

      const sampleData = [1, 2, 3, 4, 5].map((rank) => ({
        rank: rank.toString(),
        token_name: 'Wrapped Ether',
        token_symbol: 'WETH',
        token_logo: 'https://cdn.moralis.io/eth/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
        token_decimals: '18',
        contract_address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        price_usd: '0.0285',
        price_24h_percent_change: '0.0285',
        price_7d_percent_change: '0.0285',
        market_cap_usd: '0.0285',
        followers: 0,
      }));
      return sampleData;
    } catch (error) {
      logger.error(error);
      return [];
    }
  }

  async getTopNFTs() {
    try {
      // const response = await Moralis.EvmApi.marketData.getTopNFTCollectionsByMarketCap();
      const sampleData = [1, 2, 3, 4, 5].map((rank) => ({
        rank: rank.toString(),
        collection_title: 'CryptoPunks',
        floor_price_usd: '0.0',
        floor_price_24hr_percent_change: '20.11',
        market_cap_usd: '0.0',
        market_cap_24hr_percent_change: '0.0',
        volume_usd: '0.0',
        volume_24hr_percent_change: '20.11',
        holders: 0,
      }));

      return sampleData;
    } catch (error) {
      logger.error(error);
      return [];
    }
  }

  async test() {
    /*
      Examples of wallet address
      address: '0x2890810659c27947830b0950f19170B4D3B1BE4A',
      address: '0xb779547DA0a2f5b866AA803a02124EDE4daab10f',
    */
    // return this.getTransactionsByWallet('0xb779547DA0a2f5b866AA803a02124EDE4daab10f');

    /*
      Examples of ERC20 token address
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', Tether USDT
      address: '0x50327c6c5a14DCaDE707ABad2E27eB517df87AB5', TRON (TRX)
    */
    // return this.getTransactionsByToken('0x76BE3b62873462d2142405439777e971754E8E77');

    // return this.getBalances('0xb779547da0a2f5b866aa803a02124ede4daab10f');
    // return this.getPriceHistory('0xB8c77482e45F1F44dE1745F52C74426C631bDD52');
    // return this.getPriceFromExchanges('0xB8c77482e45F1F44dE1745F52C74426C631bDD52'); // BNB Token Contract Address
    // return this.getTopERC20Tokens();

    return this.getTransactionsByNFT('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D');
  }
}
