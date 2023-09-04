import { FC } from 'react';
import cn from 'classnames';
import { Card } from 'antd';
import { useAppContext } from '../../context/app';
import { NFT, Transaction } from '../../types/transaction';

import { getAge, convertHex, standardUnit } from '../../lib/utils';

import {
  ChatBubbleSolid,
  ThumbsDownSolid,
  ThumbsUpSolid,
  NFTIcon,
  PurchaseIcon,
  MintIcon,
} from '../icons/defisensi-icons';

type TransactionCardProps = {
  transaction: Transaction<NFT>;
  likes: any[];
  dislikes: any[];
  comments: any[];
};

export const NFTTransactionCard: FC<TransactionCardProps> = ({
  transaction,
  likes,
  dislikes,
  comments,
}) => {
  const { user } = useAppContext();
  const age = getAge(transaction.details.timestamp);
  return (
    <Card bordered={false} style={{ width: 392 }} className="mb-2 font-inter">
      <div className="flex justify-between font-inter text-sm">
        <NFTIcon />
        <span>{age}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="font-bold" title={transaction.details.from}>
            {convertHex(transaction.details.from).substring(0, 5)}
          </span>
          <span>
            {transaction.details.to === '0' ? <MintIcon /> : <PurchaseIcon />}
          </span>
          <span className="font-bold" title={transaction.details.to}>
            {convertHex(transaction.details.to).substring(0, 5)}
          </span>
        </div>
        <div>
          <img
            src={`/images/exchanges/binance.png`}
            width={32}
            height={32}
            className="rounded-full border"
            alt="platform_icon"
          ></img>
        </div>
      </div>
      <div className="text-base font-semibold">{`Purchase of ${transaction.details.token0.name}(${transaction.details.token0.symbol})`}</div>
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