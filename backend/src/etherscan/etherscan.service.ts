import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import Web3 from 'web3';
import Moralis from 'moralis';
import { Transaction } from 'src/utils/types';
import { ConfigService } from '@nestjs/config';
import { MoralisConfig } from 'src/config/moralis.config';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { EthereumConfig } from 'src/config/ethereum.config';
import { UNISWAP_ABI } from './abi';
import { isUniswapV2, isUniswapV3 } from 'src/utils/moralis';

Moralis.start({
  apiKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImQ0ODk2NzY0LWQ3MzEtNGZiNC04M2Q3LTRlMThkM2MxOWE1NiIsIm9yZ0lkIjoiMzUyMTEwIiwidXNlcklkIjoiMzYxOTA5IiwidHlwZUlkIjoiZmE3NTFjNDktMDZjNi00NTU2LWJhOGEtZDkzYzU5ZGZmYWYyIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2OTE1MDE1ODksImV4cCI6NDg0NzI2MTU4OX0.w5pET1PkW95oGG6x9mfn4JFI0MjyiN-zh5LGcHuZAys',
});

@Injectable()
export class EtherscanService {
  private readonly web3: Web3;
  private readonly moralisConfig: MoralisConfig;
  private readonly ethereumConfig: EthereumConfig;

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

    const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

    for (const tx of response.toJSON().result) {
      // Native token transaction
      if (tx.logs.length == 0 && tx.value != '0') {
        const response = await Moralis.EvmApi.token.getTokenPrice({
          chain: EvmChain.ETHEREUM,
          address: WETH_ADDRESS,
          toBlock: Number(tx.block_number),
        });

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
                    Math.pow(10, Number(token0Contract.toJSON().tokenDecimals))
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
                    Math.pow(10, Number(token1Contract.toJSON().tokenDecimals))
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
                Math.pow(10, Number(tokenInContract.toJSON().tokenDecimals))
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
                Math.pow(10, Number(tokenOutContract.toJSON().tokenDecimals))
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
                Math.pow(10, Number(erc20Token.toJSON().tokenDecimals))
              ).toString(),
            },
          },
        });
      }
    }

    return transactions;
  }

  async getTransactionByToken(contractAddress: string, fromBlock: number = 0) {
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
                    Math.pow(10, Number(token0Contract.toJSON().tokenDecimals))
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
                    Math.pow(10, Number(token1Contract.toJSON().tokenDecimals))
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
                Math.pow(10, Number(tokenInContract.toJSON().tokenDecimals))
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
                Math.pow(10, Number(tokenOutContract.toJSON().tokenDecimals))
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
                Math.pow(10, Number(erc20Token.toJSON().tokenDecimals))
              ).toString(),
            },
          },
        });
      }
    }

    return transactions;
  }

  async getTransactionByNFT(contractAddress: string, startBlock?: number) {}

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
    return this.getTransactionByToken('0xdAC17F958D2ee523a2206206994597C13D831ec7');
  }
}
