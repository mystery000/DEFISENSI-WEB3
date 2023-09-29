import { ApiProperty } from '@nestjs/swagger';
import { NetworkType } from './enums/network.enum';
import { TransactionType } from './enums/transaction.enum';

export type TokenBalance = {
  logo?: string;
  name: string;
  symbol: string;
  contractAddress: string;
  decimals: number;
  value: string;
  usdPrice: string;
};

export type Balance = {
  ethereum?: [
    {
      timestamp: number;
      tokens: [TokenBalance];
    },
  ];

  polygon?: [
    {
      timestamp: number;
      tokens: [TokenBalance];
    },
  ];

  binance?: [
    {
      timestamp: number;
      tokens: [TokenBalance];
    },
  ];

  arbitrum?: [
    {
      timestamp: number;
      tokens: [TokenBalance];
    },
  ];
};

export class ApiTokenBalance {
  @ApiProperty()
  logo?: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  contractAddress: string;

  @ApiProperty()
  decimals: number;

  @ApiProperty()
  value: string;

  @ApiProperty()
  usdPrice: string;
}

export class ApiBalance {
  @ApiProperty()
  ethereum?: {
    timestamp: number;
    tokens: [ApiTokenBalance];
  };

  @ApiProperty()
  polygon?: {
    timestamp: number;
    tokens: [ApiTokenBalance];
  };

  @ApiProperty()
  binance?: {
    timestamp: number;
    tokens: [ApiTokenBalance];
  };

  @ApiProperty()
  arbitrum?: {
    timestamp: number;
    tokens: [ApiTokenBalance];
  };
}

export class ApiBalanceHistory {
  @ApiProperty()
  ethereum?: [
    {
      timestamp: number;
      tokens: [ApiTokenBalance];
    },
  ];

  @ApiProperty()
  polygon?: [
    {
      timestamp: number;
      tokens: [ApiTokenBalance];
    },
  ];

  @ApiProperty()
  binance?: [
    {
      timestamp: number;
      tokens: [ApiTokenBalance];
    },
  ];

  @ApiProperty()
  arbitrum?: [
    {
      timestamp: number;
      tokens: [ApiTokenBalance];
    },
  ];
}

export type HistoricalPrice = {
  price: number;
  symbol: string;
  decimals: number;
  updated_at: string;
};

export type ExchangePrice = {
  tokenName: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenLogo: string;
  tokenDecimals: string;
  usdPrice: {
    uniswap?: string;
    kucoin?: string;
    binance?: string;
    coinbase?: string;
  };
};

// Normal Token Transcation Type Definition (ERC-20, BEP-20)
export type Token = {
  name: string;
  symbol: string;
  logo?: string;
  contractAddress: string;
  decimals: string;
  amount: string;
  price: string;
};

export type TokenTransaction = {
  txHash: string;
  blockNumber: string;
  type: TransactionType;
  network: NetworkType;
  timestamp: number;
  details: {
    from: string;
    to: string;
    token0: Token;
    token1?: Token;
  };
};

// NFT Transcation Type Definition
export type ActionType = 'Burn' | 'Transfer' | 'Sale' | 'Mint' | 'Purchase';

export type Action = {
  type: ActionType;
  amount: number;
  tokenAddress: string;
  name: string;
  symbol: string;
  floor?: string;
};

export type NFTTransaction = {
  txHash: string;
  blockNumber: string;
  type: TransactionType;
  network: NetworkType;
  timestamp: number;
  details: {
    from: string;
    to: string;
    actions: Action[];
  };
};

export enum ChainbaseChain {
  ETHEREUM = '1',
  POLYGON = '137',
  BSC = '56',
  AVALANCHE = '43114',
  ARBITRUM = '42161',
  OPTIMISM = '10',
}

export type TopERC20Token = {
  address: string;
  name: string;
  price: string;
  change: string;
  followers?: number;
};

export type TopNFT = {
  address: string;
  name: string;
  floor: string;
  volume: string;
  change: string;
  holders: string;
};

export type TopWallet = { address: string; balance: string; percentage: string; followers?: number };
