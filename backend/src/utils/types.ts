import { ApiProperty } from '@nestjs/swagger';

export class ApiTokenType {
  @ApiProperty({ description: 'The name of token' })
  name: String;

  @ApiProperty({ description: 'The symbol of token' })
  symbol: String;

  @ApiProperty({ description: 'The logo of token' })
  logo: String;

  @ApiProperty({ description: 'The contract address of the token contract' })
  contractAddress?: String;

  @ApiProperty({ description: 'The processed amount during payment' })
  value: String;

  @ApiProperty({ description: 'The decimals of the contract' })
  decimals: String;

  @ApiProperty({ description: 'USD value of this token' })
  usdPrice: String;
}

export class ApiTransactionDetails {
  @ApiProperty({ description: 'The wallet address of the sender' })
  from: String;

  @ApiProperty({ description: 'The wallet address of the receiver' })
  to: String;

  @ApiProperty({ description: 'The type of token0' })
  token0: ApiTokenType;

  @ApiProperty({ description: 'The type of token1' })
  token1?: ApiTokenType;

  @ApiProperty({ description: 'The creation timestamp of the transaction' })
  timestamp: Number;
}

export class ApiTransaction {
  @ApiProperty({ description: 'Transaction hash' })
  txhash: String;

  @ApiProperty({ description: 'The block number of the transaction' })
  blockNumber: String;

  @ApiProperty({ description: 'The details of the transactions' })
  details: ApiTransactionDetails;
}

export type Token = {
  name: string;
  symbol: string;
  logo?: string;
  decimals: string;
  contractAddress?: string;
  value: string;
  usdPrice: string;
};

export type Transaction = {
  txhash: string;
  blockNumber: string;
  details: {
    from: string;
    to: string;
    token0: Token;
    token1?: Token;
    timestamp: number;
  };
};

export type TokenBalance = {
  logo?: string;
  name: string;
  symbol: string;
  contractAddress: string;
  decimals: string;
  balance: string;
  usdPrice: string;
};

export type Balance = {
  ethereum?: [
    {
      date: number;
      tokens: [TokenBalance];
    },
  ];

  polygon?: [
    {
      date: number;
      tokens: [TokenBalance];
    },
  ];

  binance?: [
    {
      date: number;
      tokens: [TokenBalance];
    },
  ];
};

export class ApiTokenBalance {
  @ApiProperty()
  decimals: string;

  @ApiProperty()
  logo?: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  value: string;

  @ApiProperty()
  usdPrice: string;

  @ApiProperty()
  contractAddress: string;
}

export class ApiBalance {
  @ApiProperty()
  ethereum?: {
    date: number;
    tokens: [ApiTokenBalance];
  };

  @ApiProperty()
  polygon?: {
    date: number;
    tokens: [ApiTokenBalance];
  };

  @ApiProperty()
  binance?: {
    date: number;
    tokens: [ApiTokenBalance];
  };
}

export class ApiBalanceHistory {
  @ApiProperty()
  ethereum?: [
    {
      date: number;
      tokens: [ApiTokenBalance];
    },
  ];

  @ApiProperty()
  polygon?: [
    {
      date: number;
      tokens: [ApiTokenBalance];
    },
  ];

  @ApiProperty()
  binance?: [
    {
      date: number;
      tokens: [ApiTokenBalance];
    },
  ];
}
