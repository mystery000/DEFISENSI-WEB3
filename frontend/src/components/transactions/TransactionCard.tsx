import { FC } from 'react';
import cn from 'classnames';
import { Card } from 'antd';
import { Transaction, TransactionType } from '../../types/transaction';

import {
  convertDecimals,
  convertHex,
  getAge,
  getTransferType,
  standardUnit,
} from '../../lib/utils';

import {
  ChatBubbleSolid,
  SwapIcon,
  SendIcon,
  ThumbsDownSolid,
  ThumbsUpSolid,
  TokenIcon,
  NFTIcon,
} from '../icons/defisensi-icons';

import { useAppContext } from '../../context/app';
import { TransferType } from '../../types';

type TransactionCardProps = {
  transaction: Transaction;
  likes: any[];
  dislikes: any[];
  comments: any[];
};

export const TransactionCard: FC<TransactionCardProps> = ({
  transaction,
  likes,
  dislikes,
  comments,
}) => {
  const { user } = useAppContext();
  const age = getAge(transaction.timestamp);
  return (
    <Card bordered={false} style={{ width: 392 }} className="mb-2 font-inter">
      <div className="flex justify-between font-inter text-sm">
        <TokenIcon />
        <span>{age}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="font-bold" title={transaction.details.from}>
            {convertHex(transaction.details.from).substring(0, 5)}
          </span>
          <span>
            {getTransferType(transaction) === TransferType.SEND ? (
              <SendIcon />
            ) : (
              <SwapIcon />
            )}
          </span>
          <span className="font-bold" title={transaction.details.to}>
            {convertHex(transaction.details.to).substring(0, 5)}
          </span>
        </div>
        <div>
          <img
            src={`/images/network/${transaction.network.toLowerCase()}.png`}
            width={32}
            height={32}
            className="rounded-full border"
            alt="platform_icon"
          ></img>
        </div>
      </div>
      {transaction.details.token0 && (
        <div className="my-2 flex items-center font-inter">
          <span className="pr-2">
            <img
              src={
                transaction.details.token0.symbol.toLocaleLowerCase() === 'weth'
                  ? `/images/tokens/eth.png`
                  : transaction.details.token0.logo
                  ? transaction.details.token0.logo
                  : `/images/tokens/empty-eth.png`
              }
              width={24}
              height={24}
              alt="token-icon"
            />
          </span>
          <span>
            {`${convertDecimals(
              transaction.details.token0.amount,
              transaction.details.token0.decimals,
            )} ${transaction.details.token0.symbol}`}
          </span>
          <span className="text-bali-hai-600">{`@${Number(
            transaction.details.token0.price,
          ).toLocaleString()} USD`}</span>
        </div>
      )}
      {transaction.details.token1 && (
        <div className="flex items-center">
          <span className="pr-2">
            <img
              src={
                transaction.details.token1.symbol.toLocaleLowerCase() === 'weth'
                  ? `/images/tokens/eth.png`
                  : transaction.details.token1.logo
                  ? transaction.details.token1.logo
                  : `/images/tokens/empty-eth.png`
              }
              width={24}
              height={24}
              alt="token-icon"
            />
          </span>
          <span>{`${convertDecimals(
            transaction.details.token1.amount,
            transaction.details.token1.decimals,
          )} ${transaction.details.token1.symbol}`}</span>
          <span className="text-bali-hai-600">{`@${Number(
            transaction.details.token1.price,
          ).toLocaleString()} USD`}</span>
        </div>
      )}
      <div className="mt-4 flex justify-around text-center text-sm">
        <div className="flex items-center gap-[3px] hover:cursor-pointer">
          <ThumbsUpSolid
            className="h-5 w-5 scale-x-[-1]"
            fill={likes.includes(user.id) ? '#FF5D29' : '#8E98B0'}
          />
          <span
            className={cn('font-inter', {
              'text-orange-400': likes.includes(user.id),
              'text-bali-hai-600': likes.includes(user.id),
            })}
          >
            {standardUnit(likes.length)}
          </span>
        </div>
        <div className="flex items-center gap-[3px] hover:cursor-pointer">
          <ThumbsDownSolid
            className="h-5 w-5"
            fill={dislikes.includes(user.id) ? '#FF5D29' : '#8E98B0'}
          />
          <span
            className={cn('font-inter', {
              'text-orange-400': dislikes.includes(user.id),
              'text-bali-hai-600': dislikes.includes(user.id),
            })}
          >
            {standardUnit(dislikes.length)}
          </span>
        </div>
        <div className="flex items-center gap-[3px] hover:cursor-pointer">
          <ChatBubbleSolid
            className="h-5 w-5"
            fill={comments.includes(user.id) ? '#FF5D29' : '#8E98B0'}
          />
          <span
            className={cn('font-inter', {
              'text-orange-400': comments.includes(user.id),
              'text-bali-hai-600': comments.includes(user.id),
            })}
          >
            {standardUnit(comments.length)}
          </span>
        </div>
      </div>
    </Card>
  );
};
