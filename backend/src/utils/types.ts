import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from 'src/utils/enums/transaction.enum';

export class ApiTokenType {
  @ApiProperty({ description: 'The symbol of token' })
  symbol: String;

  @ApiProperty({ description: 'The  address of the token contract' })
  address: String;

  @ApiProperty({ description: 'The processed amount during payment' })
  amount: Number;

  @ApiProperty({ description: 'The decimals of the contract' })
  decimals: Number;
}

export class ApiTransactionDetails {
  @ApiProperty({ description: 'The wallet address of the sender' })
  from: String;

  @ApiProperty({ description: 'The wallet address of the receiver' })
  to: String;

  @ApiProperty({ description: 'The address of the wallet' })
  type: String;

  @ApiProperty({ description: 'The creation timestamp of the transaction' })
  created: Number;

  @ApiProperty({ description: 'The type of token0' })
  token0: ApiTokenType;

  @ApiProperty({ description: 'The type of token1' })
  token1?: ApiTokenType;
}

export class ApiTransaction {
  @ApiProperty({ description: 'Transaction hash' })
  txhash: String;

  @ApiProperty({ description: 'The block number of the transaction' })
  blockNumber: String;

  @ApiProperty({ description: 'The details of the transactions' })
  details: ApiTransactionDetails;
}

export type Transaction = {
  txhash: String;
  blockNumber: String;
  details: {
    from: String;
    to: String;
    created: Number;
    type: TransactionType;
    token0: { symbol: String; address: String; amount: Number; decimal: Number; price: Number };
    token1?: { symbol: String; address: String; amount: Number; decimal: Number; price: Number };
  };
};

export type TokenBalance = {
  logo: string;
  name: string;
  symbol: string;
  contractAddress: string;
  decimals: Number;
  balance: string;
  usd: string;
};

export class ApiTokenBalance {
  @ApiProperty()
  decimals: Number;

  @ApiProperty()
  logo: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  balance: string;

  @ApiProperty()
  usd: string;

  @ApiProperty()
  contractAddress: string;
}

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
