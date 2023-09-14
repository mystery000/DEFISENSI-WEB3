import { Injectable } from '@nestjs/common';

import Web3 from 'web3';
import axios from 'axios';
import Moralis from 'moralis';
import * as moment from 'moment';
import { UNISWAP_ABI } from './abi';
import { logger } from 'src/utils/logger';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { isUniswapV2, isUniswapV3 } from 'src/utils/moralis';
import { TransactionType } from 'src/utils/enums/transaction.enum';
import {
  Action,
  ChainbaseChain,
  ExchangePrice,
  HistoricalPrice,
  NFTTransaction,
  TokenBalance,
  TokenTransaction,
} from 'src/utils/types';
import { NetworkType } from 'src/utils/enums/network.enum';

@Injectable()
export class EtherscanService {
  private readonly web3: Web3;
  private readonly WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // Wrapped Ether address

  constructor() {
    const provider = `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
    this.web3 = new Web3(provider);
  }

  async getTransactionsByAccount(address: string, fromBlock: number = 0) {
    const response = await Moralis.EvmApi.transaction.getWalletTransactionsVerbose({
      chain: EvmChain.ETHEREUM,
      address,
      limit: 4,
      fromBlock,
    });

    const transactions: TokenTransaction[] = [];

    for (const tx of response.toJSON().result) {
      // Native token transaction
      if (tx.logs.length == 0 && tx.value != '0') {
        const response = await Moralis.EvmApi.token.getTokenPrice({
          chain: EvmChain.ETHEREUM,
          address: this.WETH_ADDRESS,
          toBlock: Number(tx.block_number),
        });

        transactions.push({
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
              contractAddress: response.toJSON().tokenAddress,
              logo: null,
              amount: tx.value,
              price: ((response.toJSON().usdPrice * Number(tx.value)) / 1e18).toString(),
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
        });
      }
    }

    return transactions;
  }

  async getTransactionsByContract(contractAddress: string, fromBlock: number = 0) {
    let txHashs = [];
    let transactions: TokenTransaction[] = [];

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
  async getPriceHistory(address: string) {
    // const CHAINBASE_BASE_URL = 'https://api.chainbase.online';
    const CHAINBASE_BASE_URL = 'http://95.217.141.220:3000';
    const CHAINBASE_API_KEY = process.env.CHAINBASE_API_KEY;
    let toTimestamp = Math.round(new Date().getTime() / 1000);
    let fromTimestamp = toTimestamp - 86400 * 90;

    try {
      const response = await axios.get(
        `${CHAINBASE_BASE_URL}/v1/token/price/history?chain_id=${ChainbaseChain.ETHEREUM}&contract_address=${address}&from_timestamp=${fromTimestamp}&end_timestamp=${toTimestamp}`,
        {
          headers: { accept: 'application/json', 'x-api-key': CHAINBASE_API_KEY },
        },
      );
      return response.data.data as HistoricalPrice[];
    } catch (error) {
      logger.error(error);
    }
  }

  async getPriceFromExchanges(address: string) {
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
        address,
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

    return this.getPriceHistory('0xdac17f958d2ee523a2206206994597c13d831ec7');
  }
}
