import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import Web3 from 'web3';
import axios from 'axios';
import Moralis from 'moralis';
import { JSDOM } from 'jsdom';
import * as moment from 'moment';
import { ZenRows } from 'zenrows';
import { UNISWAP_ABI } from './abi';
import { v4 as uuidv4 } from 'uuid';
import { logger } from 'src/utils/logger';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { isUniswapV2, isUniswapV3 } from 'src/utils/moralis';
import { TransactionType } from 'src/utils/enums/transaction.enum';
import {
  Action,
  BalancesResponse,
  ExchangesPriceResponse,
  NFTTransaction,
  PortfolioResponse,
  TokenPricesResponse,
  TokenTransaction,
  TopERC20Token,
  TopNFT,
  TopWallet,
} from 'src/utils/types';
import { CovalenthqChain } from 'src/utils/chains';
import { CovalentClient } from '@covalenthq/client-sdk';
import { ServiceConfig } from 'src/config/service.config';
import { NetworkType } from 'src/utils/enums/network.enum';
@Injectable()
export class EtherscanService {
  private readonly web3: Web3;
  private readonly serviceConfig: ServiceConfig;
  private readonly WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // Wrapped Ether address

  constructor(private readonly configService: ConfigService) {
    const provider = `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
    this.web3 = new Web3(provider);
    this.serviceConfig = this.configService.get<ServiceConfig>('service');
  }

  async getTransactionsByAccount(address: string, fromBlock: number = 0) {
    const response = await Moralis.EvmApi.transaction.getWalletTransactionsVerbose({
      chain: EvmChain.ETHEREUM,
      address,
      limit: 4,
      fromBlock,
    });

    const transactions: TokenTransaction[] = [];

    let isParsed = false;
    for (const tx of response.toJSON().result) {
      if (isParsed) continue;
      // Native token transaction
      if (tx.logs.length == 0 && tx.value != '0') {
        Moralis.EvmApi.token
          .getTokenPrice({
            chain: EvmChain.ETHEREUM,
            address: this.WETH_ADDRESS,
            toBlock: Number(tx.block_number),
          })
          .then((response) => {
            const { tokenAddress, usdPrice } = response.toJSON();
            transactions.push({
              id: uuidv4(),
              txHash: tx.hash,
              blockNumber: tx.block_number,
              timestamp: new Date(tx.block_timestamp).getTime(),
              type: TransactionType.TOKEN,
              network: NetworkType.ETHEREUM,
              details: {
                from: tx.from_address,
                to: tx.to_address,
                token0: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: '18',
                  contractAddress: tokenAddress,
                  logo: null,
                  amount: tx.value,
                  price: ((usdPrice * Number(tx.value)) / 1e18).toString(),
                },
              },
              likes: [],
              dislikes: [],
              comments: [],
            });
            isParsed = true;
          });
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
            if (token0Contract && token1Contract) {
              transactions.push({
                id: uuidv4(),
                txHash: tx.hash,
                blockNumber: tx.block_number,
                type: TransactionType.TOKEN,
                network: NetworkType.UNISWAP,
                timestamp: new Date(tx.block_timestamp).getTime(),
                details: {
                  from: tx.from_address,
                  to: toAddress,
                  token0: {
                    name: token0Contract.toJSON().tokenName,
                    symbol: token0Contract.toJSON().tokenSymbol,
                    decimals: token0Contract.toJSON().tokenDecimals,
                    contractAddress: token0Contract.toJSON().tokenAddress,
                    logo: token0Contract.toJSON().tokenLogo,
                    amount: amount0.toString(),
                    price: (
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
                    amount: amount1.toString(),
                    price: (
                      (token1Contract.toJSON().usdPrice * amount1) /
                      10 ** Number(token1Contract.toJSON().tokenDecimals)
                    ).toString(),
                  },
                },
                likes: [],
                dislikes: [],
                comments: [],
              });
            }
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
        if (tokenInContract && tokenOutContract) {
          transactions.push({
            id: uuidv4(),
            txHash: tx.hash,
            blockNumber: tx.block_number,
            timestamp: new Date(tx.block_timestamp).getTime(),
            type: TransactionType.TOKEN,
            network: NetworkType.UNISWAP,
            details: {
              from: tx.from_address,
              to: to,
              token0: {
                name: tokenInContract.toJSON().tokenName,
                symbol: tokenInContract.toJSON().tokenSymbol,
                decimals: tokenInContract.toJSON().tokenDecimals,
                contractAddress: tokenInContract.toJSON().tokenAddress,
                logo: tokenInContract.toJSON().tokenLogo,
                amount: amountIn.toString(),
                price: (
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
                amount: amountOut.toString(),
                price: (
                  (tokenOutContract.toJSON().usdPrice * amountOut) /
                  10 ** Number(tokenOutContract.toJSON().tokenDecimals)
                ).toString(),
              },
            },
            likes: [],
            dislikes: [],
            comments: [],
          });
        }
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

        if (erc20Token) {
          const { tokenName, tokenSymbol, tokenDecimals, tokenLogo, usdPrice } = erc20Token.toJSON();
          transactions.push({
            id: uuidv4(),
            txHash: tx.hash,
            blockNumber: tx.block_number,
            type: TransactionType.TOKEN,
            timestamp: new Date(transferLog.block_timestamp).getTime(),
            network: NetworkType.ETHEREUM,
            details: {
              from: tx.from_address,
              to: transfer_to,
              token0: {
                name: tokenName,
                symbol: tokenSymbol,
                decimals: tokenDecimals,
                contractAddress: transferLog.address,
                logo: tokenLogo,
                amount: tranfer_value,
                price: ((usdPrice * Number(tranfer_value)) / 10 ** Number(tokenDecimals)).toString(),
              },
            },
            likes: [],
            dislikes: [],
            comments: [],
          });
        }
      }
    }

    return transactions;
  }

  async getTransactionsByContract(contractAddress: string, fromBlock: number = 0) {
    let txHashs = [];
    let transactions: TokenTransaction[] = [];

    // Get Token transfers by contract and extract transaction hashs
    let transfers = [];
    await Moralis.EvmApi.token
      .getTokenTransfers({
        chain: EvmChain.ETHEREUM,
        address: contractAddress,
        limit: 4,
        fromBlock,
      })
      .then((response) => {
        transfers = response.toJSON().result;
      });

    for (const transfer of transfers) {
      if (!txHashs.includes(transfer.transaction_hash)) {
        txHashs.push(transfer.transaction_hash);
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
              id: uuidv4(),
              txHash: tx.hash,
              blockNumber: tx.block_number,
              type: TransactionType.TOKEN,
              timestamp: new Date(tx.block_timestamp).getTime(),
              network: NetworkType.UNISWAP,
              details: {
                from: tx.from_address,
                to: toAddress,
                token0: {
                  name: token0Contract.toJSON().tokenName,
                  symbol: token0Contract.toJSON().tokenSymbol,
                  decimals: token0Contract.toJSON().tokenDecimals,
                  contractAddress: token0Contract.toJSON().tokenAddress,
                  logo: token0Contract.toJSON().tokenLogo,
                  amount: amount0.toString(),
                  price: (
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
                  amount: amount1.toString(),
                  price: (
                    (token1Contract.toJSON().usdPrice * amount1) /
                    10 ** Number(token1Contract.toJSON().tokenDecimals)
                  ).toString(),
                },
              },
              likes: [],
              dislikes: [],
              comments: [],
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
          id: uuidv4(),
          txHash: tx.hash,
          blockNumber: tx.block_number,
          type: TransactionType.TOKEN,
          timestamp: new Date(tx.block_timestamp).getTime(),
          network: NetworkType.UNISWAP,
          details: {
            from: tx.from_address,
            to: to,
            token0: {
              name: tokenInContract.toJSON().tokenName,
              symbol: tokenInContract.toJSON().tokenSymbol,
              decimals: tokenInContract.toJSON().tokenDecimals,
              contractAddress: tokenInContract.toJSON().tokenAddress,
              logo: tokenInContract.toJSON().tokenLogo,
              amount: amountIn.toString(),
              price: (
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
              amount: amountOut.toString(),
              price: (
                (tokenOutContract.toJSON().usdPrice * amountOut) /
                10 ** Number(tokenOutContract.toJSON().tokenDecimals)
              ).toString(),
            },
          },
          likes: [],
          dislikes: [],
          comments: [],
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
          id: uuidv4(),
          txHash: tx.hash,
          blockNumber: tx.block_number,
          type: TransactionType.TOKEN,
          timestamp: new Date(transferLog.block_timestamp).getTime(),
          network: NetworkType.ETHEREUM,
          details: {
            from: tx.from_address,
            to: transfer_to,
            token0: {
              name: erc20Token.toJSON().tokenName,
              symbol: erc20Token.toJSON().tokenSymbol,
              decimals: erc20Token.toJSON().tokenDecimals,
              contractAddress: transferLog.address,
              logo: erc20Token.toJSON().tokenLogo,
              amount: tranfer_value,
              price: (
                (erc20Token.toJSON().usdPrice * Number(tranfer_value)) /
                10 ** Number(erc20Token.toJSON().tokenDecimals)
              ).toString(),
            },
          },
          likes: [],
          dislikes: [],
          comments: [],
        });
      }
    }

    return transactions;
  }

  async getTransactionsByNFT(address: string, fromBlock: number = 0) {
    let txHashs = [];
    let transactions: NFTTransaction[] = [];
    try {
      // Get NFT transfers by contract and extract transaction hashs
      let transfers = [];

      await Moralis.EvmApi.nft
        .getNFTContractTransfers({
          chain: EvmChain.ETHEREUM,
          format: 'decimal',
          address: address,
          limit: 4,
          fromBlock,
        })
        .then((response) => {
          transfers = response.toJSON().result;
        });

      for (const transfer of transfers) {
        if (!transfer.possible_spam && !txHashs.includes(transfer.transaction_hash)) {
          txHashs.push(transfer.transaction_hash);
        }
      }

      // Get decoded transaction by hash
      for (const txHash of txHashs) {
        const transaction = await Moralis.EvmApi.transaction.getTransactionVerbose({
          chain: EvmChain.ETHEREUM,
          transactionHash: txHash,
        });

        const { logs, block_number, block_timestamp, from_address, to_address } = transaction.toJSON();
        // Check if there is OrderFulFilled event in logs
        const order = logs.find((log) => log.decoded_event?.label === 'OrderFulfilled');
        if (order) {
          let metadata: any = {};

          /* Metadata Type:
              sales?: number,
              purchases?: number,
              name: string, 
              symbol: string 
              contractType: 'ERC721' | 'ERC1155'
          */

          for (const log of logs) {
            if (log.decoded_event?.label === 'OrderFulfilled') {
              // Check if order type is purchase or sale
              const offer = log.decoded_event.params.find((param) => param.name === 'offer')?.value || '';
              const decodedValue = offer.split(',');
              const spentItems: { itemType: number; address: string; identifier: string; amount: number }[] = [];
              for (let i = 0; i < decodedValue.length; i += 4) {
                if (decodedValue[i] === undefined) return;
                spentItems.push({
                  itemType: Number(decodedValue[i]),
                  address: decodedValue[i + 1],
                  identifier: decodedValue[i + 2],
                  amount: Number(decodedValue[i + 3]),
                });
              }
              for (const item of spentItems) {
                /*
                 itemType 0: Native Token
                          1: ERC20
                          2: ERC721
                */
                if (item.itemType == 2 && metadata[item.address]) {
                  metadata[item.address] = {
                    ...metadata[item.address],
                    sales: metadata[item.address].sales + item.amount,
                  };
                }

                if (item.itemType === 2 && !metadata[item.address]) {
                  await Moralis.EvmApi.nft
                    .getNFTContractMetadata({
                      chain: EvmChain.ETHEREUM,
                      address: item.address,
                    })
                    .then((response) => {
                      metadata[item.address] = { ...response.toJSON(), sales: item.amount };
                    })
                    .catch((error) => {});
                }
              }
            }
          }

          let actions: Action[] = [];
          Object.entries(metadata).map(([key, value]: [key: string, value: any]) => {
            if (value.sales) {
              actions.push({
                type: 'Sale',
                amount: value.sales,
                tokenAddress: key,
                name: value.name,
                symbol: value.symbol,
              });
            }
            if (value.purchases) {
              actions.push({
                type: 'Purchase',
                amount: value.purchases,
                tokenAddress: key,
                name: value.name,
                symbol: value.symbol,
              });
            }
          });

          if (actions.length) {
            transactions.push({
              id: uuidv4(),
              txHash,
              blockNumber: block_number,
              type: TransactionType.NFT,
              network: NetworkType.ETHEREUM,
              timestamp: new Date(block_timestamp).getTime(),
              details: {
                from: from_address,
                to: to_address,
                actions,
              },
              likes: [],
              dislikes: [],
              comments: [],
            });
          }
        } else {
          let metadata: any = {};
          /* Metadata Type:

              mints?: number
              transfers?: number
              burns?: number
              name: string,
              symbol: string
              contractType: 'ERC721' | 'ERC1155'
          */

          // Tranfer
          for (const log of logs) {
            if (!metadata[log.address]) {
              await Moralis.EvmApi.nft
                .getNFTContractMetadata({
                  chain: EvmChain.ETHEREUM,
                  address: log.address,
                })
                .then((response) => {
                  metadata[log.address] = { ...response.toJSON() };
                })
                .catch((error) => {});
            }
            // Parse ERC721 and ERC1155
            if (metadata[log.address]) {
              if (log.decoded_event?.label === 'Transfer') {
                const from = log.decoded_event.params.find((param) => param.name === 'from').value;
                const to = log.decoded_event.params.find((param) => param.name === 'to').value;
                if (Number(from) === 0) {
                  // Mint Tranfer
                  metadata[log.address] = { ...metadata[log.address], mints: (metadata[log.address].mints || 0) + 1 };
                } else if (Number(to) === 0) {
                  // Burn Transfer
                  metadata[log.address] = { ...metadata[log.address], burns: (metadata[log.address].burns || 0) + 1 };
                } else {
                  metadata[log.address] = {
                    ...metadata[log.address],
                    transfers: (metadata[log.address].transfers || 0) + 1,
                  };
                }
              }
            }
          }

          let actions: Action[] = [];
          Object.entries(metadata).map(([key, value]: [key: string, value: any]) => {
            if (value.mints) {
              actions.push({
                type: 'Mint',
                amount: value.mints,
                tokenAddress: key,
                name: value.name,
                symbol: value.symbol,
              });
            }
            if (value.burns) {
              actions.push({
                type: 'Burn',
                amount: value.burns,
                tokenAddress: key,
                name: value.name,
                symbol: value.symbol,
              });
            }
            if (value.transfers) {
              actions.push({
                type: 'Transfer',
                amount: value.transfers,
                tokenAddress: key,
                name: value.name,
                symbol: value.symbol,
              });
            }
          });

          if (actions.length > 0) {
            transactions.push({
              id: uuidv4(),
              txHash,
              blockNumber: block_number,
              type: TransactionType.NFT,
              network: NetworkType.ETHEREUM,
              timestamp: new Date(block_timestamp).getTime(),
              details: {
                from: from_address,
                to: to_address,
                actions,
              },
              likes: [],
              dislikes: [],
              comments: [],
            });
          }
        }
      }
    } catch (error) {
      logger.error(error);
    } finally {
      return transactions;
    }
  }

  async getPriceFromExchanges(address: string) {
    let exchangesPrice: ExchangesPriceResponse = {};

    try {
      const uniswap = await Moralis.EvmApi.token.getTokenPrice({
        chain: EvmChain.ETHEREUM,
        address,
        exchange: 'uniswapv3',
      });

      if (!uniswap) return exchangesPrice;

      const { usdPrice, tokenSymbol } = uniswap.toJSON();

      exchangesPrice.uniswap = usdPrice;
      const [binanceResponse, kucoinResponse] = await Promise.all([
        axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${tokenSymbol}USDT`),
        axios.get(`https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${tokenSymbol}-USDT`),
      ]);

      if (binanceResponse && binanceResponse.data) {
        exchangesPrice.binance = Number(binanceResponse.data.price);
      }

      if (kucoinResponse && kucoinResponse.data) {
        exchangesPrice.kucoin = Number(kucoinResponse.data.data?.price);
      }
    } catch (error) {
      logger.error(error);
    } finally {
      return exchangesPrice;
    }
  }

  async getTopERC20Tokens() {
    let topTokens: TopERC20Token[] = [];
    const url = 'https://etherscan.io/tokens';
    try {
      const client = new ZenRows(this.serviceConfig.zenrows_api_key);
      const { data } = await client.get(url, {});
      const dom = new JSDOM(data);
      const tokenList = dom.window.document.querySelectorAll('#ContentPlaceHolder1_divERC20Tokens tbody tr');
      topTokens = Array.from(tokenList).map((token) => {
        return {
          name: token.querySelector('td:nth-child(2) .hash-tag.text-truncate.fw-medium').innerHTML,
          address: token.querySelector('td:nth-child(2) a:first-child').getAttribute('href').slice(7),
          price: token.querySelector('td:nth-child(3) .d-inline').getAttribute('data-bs-title'),
          change: token.querySelector('td:nth-child(4)').textContent.trim(),
        };
      });
    } catch (error) {
      logger.error(error.message);
    } finally {
      return topTokens;
    }
  }

  async getTopNFTs() {
    let topNFTs: TopNFT[] = [];
    const url = 'https://etherscan.io/nft-top-contracts';
    try {
      const client = new ZenRows(this.serviceConfig.zenrows_api_key);
      const { data } = await client.get(url, { js_render: true, wait_for: '#datatable', wait: 30000 });
      const dom = new JSDOM(data);
      const nfts = dom.window.document.querySelectorAll('#datatable tbody tr');
      topNFTs = Array.from(nfts).map((nft) => {
        return {
          address: nft.querySelector('td:nth-child(2) a').getAttribute('href').slice(7),
          name: nft.querySelector('td:nth-child(2) a div:nth-child(2)').innerHTML,
          volume: nft.querySelector('td:nth-child(4)').innerHTML,
          change: (<HTMLElement>nft.querySelector('td:nth-child(5)')).innerText,
          floor: nft.querySelector('td:nth-child(6)').innerHTML,
          holders: nft.querySelector('td:nth-child(10)').innerHTML,
        };
      });
    } catch (err) {
      logger.error(err);
    } finally {
      return topNFTs;
    }
  }

  async getTopWallets() {
    let accounts: TopWallet[] = [];
    const url = 'https://etherscan.io/accounts';
    try {
      const client = new ZenRows(this.serviceConfig.zenrows_api_key);
      const { data } = await client.get(url, {});
      const dom = new JSDOM(data);
      const accountList = dom.window.document.querySelectorAll('#ContentPlaceHolder1_divTable tbody tr');
      accounts = Array.from(accountList).map((account) => {
        return {
          address: account.querySelector('td a.js-clipboard.link-secondary').getAttribute('data-clipboard-text'),
          balance: account
            .querySelector('td:nth-child(4)')
            .innerHTML.replace(/<[^>]+>/g, '')
            .trim(),
          percentage: account.querySelector('td:nth-child(5)').innerHTML,
        };
      });
    } catch (error) {
      logger.error(error.message);
    } finally {
      return accounts;
    }
  }

  async getTokenPrices(address: string, from: string, to: string): Promise<TokenPricesResponse> {
    if (!moment(from, 'YYYY-MM-DD', true).isValid() || !moment(to, 'YYYY-MM-DD', true).isValid()) {
      throw new BadRequestException('Please use YYYY-MM-DD date format');
    }
    try {
      const client = new CovalentClient(this.serviceConfig.covalenthq_api_key);
      const resp = await client.PricingService.getTokenPrices(CovalenthqChain.Ethereum, 'USD', address, { to, from });
      return resp.data?.[0];
    } catch (error) {
      logger.error(error);
      throw new BadRequestException(`Malformed address provided: ${address}`);
    }
  }

  async getTokenBalancesForWalletAddress(address: string): Promise<BalancesResponse> {
    try {
      const client = new CovalentClient(this.serviceConfig.covalenthq_api_key);
      const resp = await client.BalanceService.getTokenBalancesForWalletAddress(CovalenthqChain.Ethereum, address, {
        nft: true,
        quoteCurrency: 'USD',
      });
      return resp.data.items.map((item) => ({
        logo_url: item.logo_url,
        contract_decimals: item.contract_decimals,
        contract_name: item.contract_name,
        contract_address: item.contract_address,
        contract_ticker_symbol: item.contract_ticker_symbol,
        balance: item.balance?.toString() || '0',
        quote: item.quote?.toString() || '0',
        pretty_quote: item.pretty_quote || '0',
        type: item.type,
      }));
    } catch (error) {
      logger.error(error);
      throw new BadRequestException(`Malformed address provided: ${address}`);
    }
  }

  async getHistoricalPortfolioForWalletAddress(address: string, days: number): Promise<PortfolioResponse> {
    try {
      const response = await Moralis.EvmApi.wallets.getWalletActiveChains({
        chains: [EvmChain.ETHEREUM],
        address,
      });
      const active_chain = response.toJSON().active_chains.find((chain) => chain.chain === 'eth');
      if (!active_chain.first_transaction) return [];
      const offset = moment().diff(moment(active_chain.first_transaction.block_timestamp), 'days');
      const client = new CovalentClient(this.serviceConfig.covalenthq_api_key);
      const resp = await client.BalanceService.getHistoricalPortfolioForWalletAddress(
        CovalenthqChain.Ethereum,
        address,
        {
          days: Math.min(offset, days),
          quoteCurrency: 'USD',
        },
      );
      const transformedData = resp.data.items.reduce((acc, curr) => {
        const singleTokenTimeSeries = curr.holdings.map((holdingsItem) => {
          return {
            timestamp: holdingsItem.timestamp,
            [curr.contract_ticker_symbol]: holdingsItem.close.quote || 0,
          };
        });
        const newArr = singleTokenTimeSeries.map((item, i) => Object.assign(item, acc[i]));
        return newArr;
      }, []);
      return transformedData.map((data) => {
        let total = 0;
        for (const [key, value] of Object.entries(data)) {
          if (key === 'timestamp') continue;
          total += Number(value);
        }
        return {
          timestamp: data.timestamp,
          total_quote: total.toString(),
          pretty_total_quote: `$${total.toLocaleString()}`,
        };
      });
    } catch (error) {
      logger.error(error);
      return [];
    }
  }

  async test() {}
}
