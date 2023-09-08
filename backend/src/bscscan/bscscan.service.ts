import { Injectable } from '@nestjs/common';

import Web3 from 'web3';
import Moralis from 'moralis';
import { DEX_ABI } from './abi/dex';
import { logger } from 'src/utils/logger';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { NFTTransaction, Token, TokenTransaction } from 'src/utils/types';
import { NetworkType } from 'src/utils/enums/network.enum';
import { TransactionType } from 'src/utils/enums/transaction.enum';
@Injectable()
export class BscscanService {
  private readonly web3: Web3;

  constructor() {
    // BSCSCAN Public RPC Nodes: https://docs.bscscan.com/misc-tools-and-utilities/public-rpc-nodes#json-rpc-methods
    const provider = `https://bsc-dataseed1.binance.org/`;
    this.web3 = new Web3(provider);
  }
  async getTransactionsByWallet(address: string, fromBlock: number = 0) {
    let txHashs = [];
    let transactions: TokenTransaction[] = [];
    const WRAPPED_BNB_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

    try {
      // Get NFT transfers by contract and extract transaction hashs
      let transfers = [];

      const bnbPrice = await Moralis.EvmApi.token.getTokenPrice({
        chain: EvmChain.BSC,
        address: WRAPPED_BNB_ADDRESS,
        exchange: 'uniswapv3',
      });

      // Native token (BNB) transfer
      await Moralis.EvmApi.transaction
        .getWalletTransactions({
          chain: EvmChain.BSC,
          address: address,
          limit: 4,
          fromBlock,
        })
        .then((response) => {
          const transfers = response.toJSON().result;
          for (const transfer of transfers) {
            transactions.push({
              txHash: transfer.hash,
              blockNumber: transfer.block_number,
              type: TransactionType.TOKEN,
              network: NetworkType.BSC,
              timestamp: new Date(transfer.block_timestamp).getTime(),
              details: {
                from: transfer.from_address,
                to: transfer.to_address,
                token0: {
                  name: 'Binance Chain Native Token',
                  symbol: 'BNB',
                  contractAddress: WRAPPED_BNB_ADDRESS,
                  decimals: '18',
                  amount: transfer.value,
                  price: bnbPrice?.toJSON().usdPrice.toString() || '0',
                },
              },
            });
          }
        });

      // BEP-20 token transfers
      await Moralis.EvmApi.token
        .getWalletTokenTransfers({
          chain: EvmChain.BSC,
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
      console.log(txHashs);
      for (const txHash of txHashs) {
        const transaction = await Moralis.EvmApi.transaction.getTransactionVerbose({
          chain: EvmChain.BSC,
          transactionHash: txHash,
        });

        const { logs, block_number, block_timestamp } = transaction.toJSON();
        // check if there is swap event in the logs
        const isSwapTransaction = logs.find((log) => log.decoded_event?.label === 'Swap');
        for (const log of logs) {
          if (log.decoded_event?.label === 'Transfer') {
            if (isSwapTransaction) continue;

            // Get only first Transfer Event, ignore others
            await Moralis.EvmApi.token
              .getTokenPrice({
                chain: EvmChain.BSC,
                address: log.address,
                exchange: 'uniswapv3',
              })
              .then((response) => {
                const { tokenName, tokenSymbol, tokenLogo, tokenDecimals, usdPrice } = response.toJSON();
                const from = log.decoded_event.params.find((param) => param.name === 'from').value;
                const to = log.decoded_event.params.find((param) => param.name === 'to').value;
                const value = log.decoded_event.params.find((param) => param.name === 'value').value;
                transactions.push({
                  txHash,
                  blockNumber: block_number,
                  type: TransactionType.TOKEN,
                  network: NetworkType.BSC,
                  timestamp: new Date(block_timestamp).getTime(),
                  details: {
                    from,
                    to,
                    token0: {
                      name: tokenName,
                      symbol: tokenSymbol,
                      logo: tokenLogo,
                      contractAddress: log.address,
                      decimals: tokenDecimals,
                      amount: value,
                      price: usdPrice.toString(),
                    },
                  },
                });
              });

            break;
          } else if (log.decoded_event?.label === 'Swap') {
            if (log.decoded_event.signature === 'Swap(address,uint256,uint256,uint256,uint256,address)') {
              // V2 Contract
              const contract = new this.web3.eth.Contract(DEX_ABI.v2, log.address);
              const [tokenAddress0, tokenAddress1]: [any, any] = await Promise.all([
                contract.methods.token0().call(),
                contract.methods.token1().call(),
              ]);
              if (!tokenAddress0 || !tokenAddress1) continue;
              const sender = log.decoded_event.params.find((param) => param.name === 'sender').value;
              const amount0In = log.decoded_event.params.find((param) => param.name === 'amount0In').value;
              const amount1In = log.decoded_event.params.find((param) => param.name === 'amount1In').value;
              const amount0Out = log.decoded_event.params.find((param) => param.name === 'amount0Out').value;
              const amount1Out = log.decoded_event.params.find((param) => param.name === 'amount1Out').value;
              const to = log.decoded_event.params.find((param) => param.name === 'to').value;

              let [token0, token1]: [Token, Token] = [undefined, undefined];

              await Moralis.EvmApi.token
                .getTokenPrice({
                  chain: EvmChain.BSC,
                  address: Number(amount0In) > 0 ? tokenAddress0 : tokenAddress1,
                  exchange: 'uniswapv3',
                })
                .then((response) => {
                  const { tokenAddress, tokenDecimals, tokenLogo, tokenName, tokenSymbol, usdPrice } =
                    response.toJSON();
                  token0 = {
                    name: tokenName,
                    symbol: tokenSymbol,
                    logo: tokenLogo,
                    contractAddress: tokenAddress,
                    decimals: tokenDecimals,
                    amount: Number(amount0In) > 0 ? amount0In : amount1In,
                    price: usdPrice.toString(),
                  };
                });

              await Moralis.EvmApi.token
                .getTokenPrice({
                  chain: EvmChain.BSC,
                  address: Number(amount0Out) > 0 ? tokenAddress0 : tokenAddress1,
                  exchange: 'uniswapv3',
                })
                .then((response) => {
                  const { tokenAddress, tokenDecimals, tokenLogo, tokenName, tokenSymbol, usdPrice } =
                    response.toJSON();
                  token1 = {
                    name: tokenName,
                    symbol: tokenSymbol,
                    logo: tokenLogo,
                    contractAddress: tokenAddress,
                    decimals: tokenDecimals,
                    amount: Number(amount0Out) > 0 ? amount0Out : amount1Out,
                    price: usdPrice.toString(),
                  };
                });

              if (!token0 || !token0) continue;

              transactions.push({
                txHash,
                blockNumber: block_number,
                type: TransactionType.TOKEN,
                network: NetworkType.BSC,
                timestamp: new Date(block_timestamp).getTime(),
                details: {
                  from: sender,
                  to,
                  token0,
                  token1,
                },
              });
            } else if (log.decoded_event.signature === 'Swap(address,address,int256,int256,uint160,uint128,int24)') {
              // V3 Contract
              const contract = new this.web3.eth.Contract(DEX_ABI.v3, log.address);
              const [token0, token1] = await Promise.all([
                contract.methods.token0().call(),
                contract.methods.token1().call(),
              ]);
              const sender = log.decoded_event.params.find((param) => param.name === 'sender').value;
              const recipient = log.decoded_event.params.find((param) => param.name === 'recipient').value;
              const amount0 = log.decoded_event.params.find((param) => param.name === 'amount0').value;
              const amount1 = log.decoded_event.params.find((param) => param.name === 'amount1').value;
            }
          }
        }
      }
    } catch (error) {
      logger.error(error);
    } finally {
      return transactions;
    }
  }

  async getTransactionsByToken(address: string, fromBlock: number = 0) {
    let txHashs = [];
    let transactions: TokenTransaction[] = [];

    try {
      // Get NFT transfers by contract and extract transaction hashs
      let transfers = [];
      await Moralis.EvmApi.token
        .getTokenTransfers({
          chain: EvmChain.BSC,
          address: address,
          limit: 4,
          fromBlock,
          //   toBlock: 31568295,
        })
        .then((response) => {
          transfers = response.toJSON().result;
        });

      for (const transfer of transfers) {
        if (!transfer.possible_spam && !txHashs.includes(transfer.transaction_hash)) {
          txHashs.push(transfer.transaction_hash);
        }
      }
      console.log(txHashs);
      for (const txHash of txHashs) {
        const transaction = await Moralis.EvmApi.transaction.getTransactionVerbose({
          chain: EvmChain.BSC,
          transactionHash: txHash,
        });

        const { logs, block_number, block_timestamp } = transaction.toJSON();
        // check if there is swap event in the logs
        const isSwapTransaction = logs.find((log) => log.decoded_event?.label === 'Swap');
        for (const log of logs) {
          if (log.decoded_event?.label === 'Transfer') {
            if (isSwapTransaction) continue;

            // Get only first Transfer Event, ignore others
            await Moralis.EvmApi.token
              .getTokenPrice({
                chain: EvmChain.BSC,
                address: log.address,
                exchange: 'uniswapv3',
              })
              .then((response) => {
                const { tokenName, tokenSymbol, tokenLogo, tokenDecimals, usdPrice } = response.toJSON();
                const from = log.decoded_event.params.find((param) => param.name === 'from').value;
                const to = log.decoded_event.params.find((param) => param.name === 'to').value;
                const value = log.decoded_event.params.find((param) => param.name === 'value').value;
                transactions.push({
                  txHash,
                  blockNumber: block_number,
                  type: TransactionType.TOKEN,
                  network: NetworkType.BSC,
                  timestamp: new Date(block_timestamp).getTime(),
                  details: {
                    from,
                    to,
                    token0: {
                      name: tokenName,
                      symbol: tokenSymbol,
                      logo: tokenLogo,
                      contractAddress: log.address,
                      decimals: tokenDecimals,
                      amount: value,
                      price: usdPrice.toString(),
                    },
                  },
                });
              });

            break;
          } else if (log.decoded_event?.label === 'Swap') {
            if (log.decoded_event.signature === 'Swap(address,uint256,uint256,uint256,uint256,address)') {
              // V2 Contract
              const contract = new this.web3.eth.Contract(DEX_ABI.v2, log.address);
              const [tokenAddress0, tokenAddress1]: [any, any] = await Promise.all([
                contract.methods.token0().call(),
                contract.methods.token1().call(),
              ]);
              if (!tokenAddress0 || !tokenAddress1) continue;
              const sender = log.decoded_event.params.find((param) => param.name === 'sender').value;
              const amount0In = log.decoded_event.params.find((param) => param.name === 'amount0In').value;
              const amount1In = log.decoded_event.params.find((param) => param.name === 'amount1In').value;
              const amount0Out = log.decoded_event.params.find((param) => param.name === 'amount0Out').value;
              const amount1Out = log.decoded_event.params.find((param) => param.name === 'amount1Out').value;
              const to = log.decoded_event.params.find((param) => param.name === 'to').value;

              let [token0, token1]: [Token, Token] = [undefined, undefined];

              await Moralis.EvmApi.token
                .getTokenPrice({
                  chain: EvmChain.BSC,
                  address: Number(amount0In) > 0 ? tokenAddress0 : tokenAddress1,
                  exchange: 'uniswapv3',
                })
                .then((response) => {
                  const { tokenAddress, tokenDecimals, tokenLogo, tokenName, tokenSymbol, usdPrice } =
                    response.toJSON();
                  token0 = {
                    name: tokenName,
                    symbol: tokenSymbol,
                    logo: tokenLogo,
                    contractAddress: tokenAddress,
                    decimals: tokenDecimals,
                    amount: Number(amount0In) > 0 ? amount0In : amount1In,
                    price: usdPrice.toString(),
                  };
                });

              await Moralis.EvmApi.token
                .getTokenPrice({
                  chain: EvmChain.BSC,
                  address: Number(amount0Out) > 0 ? tokenAddress0 : tokenAddress1,
                  exchange: 'uniswapv3',
                })
                .then((response) => {
                  const { tokenAddress, tokenDecimals, tokenLogo, tokenName, tokenSymbol, usdPrice } =
                    response.toJSON();
                  token1 = {
                    name: tokenName,
                    symbol: tokenSymbol,
                    logo: tokenLogo,
                    contractAddress: tokenAddress,
                    decimals: tokenDecimals,
                    amount: Number(amount0Out) > 0 ? amount0Out : amount1Out,
                    price: usdPrice.toString(),
                  };
                });

              if (!token0 || !token0) continue;

              transactions.push({
                txHash,
                blockNumber: block_number,
                type: TransactionType.TOKEN,
                network: NetworkType.BSC,
                timestamp: new Date(block_timestamp).getTime(),
                details: {
                  from: sender,
                  to,
                  token0,
                  token1,
                },
              });
            } else if (log.decoded_event.signature === 'Swap(address,address,int256,int256,uint160,uint128,int24)') {
              // V3 Contract
              const contract = new this.web3.eth.Contract(DEX_ABI.v3, log.address);
              const [token0, token1] = await Promise.all([
                contract.methods.token0().call(),
                contract.methods.token1().call(),
              ]);
              const sender = log.decoded_event.params.find((param) => param.name === 'sender').value;
              const recipient = log.decoded_event.params.find((param) => param.name === 'recipient').value;
              const amount0 = log.decoded_event.params.find((param) => param.name === 'amount0').value;
              const amount1 = log.decoded_event.params.find((param) => param.name === 'amount1').value;
            }
          }
        }
      }
    } catch (error) {
      logger.error(error);
    } finally {
      return transactions;
    }
  }

  async getTransactionsByNFT(address: string, fromBlock: number = 0) {
    let transactions: NFTTransaction[] = [];
    return transactions;
  }

  async test() {
    // return this.getTransactionsByToken('0x2170Ed0880ac9A755fd29B2688956BD959F933F8');
    return this.getTransactionsByWallet('0x5770815B0c2a09A43C9E5AEcb7e2f3886075B605');
    // Instantiate the contract
    // const contract = new this.web3.eth.Contract(DEX_ABI, '0x7Da3fF95A3566287aFEc13b154794eee52A2e00d');
    // // Get the addresses of the pair's tokens
    // const [token0, token1] = await Promise.all([contract.methods.token0().call(), contract.methods.token1().call()]);
    // // let token0 = (await contract.methods.token0().call()) as any;
    // // let token1 = (await contract.methods.token1().call()) as any;
    // console.log(token0, token1);
    // const contract1 = new this.web3.eth.Contract(DEX_ABI, '0x531FEbfeb9a61D948c384ACFBe6dCc51057AEa7e');
    // const [token01, token11] = await Promise.all([
    //   contract1.methods.token0().call(),
    //   contract1.methods.token1().call(),
    // ]);
    // console.log(token01, token11);
  }
}
