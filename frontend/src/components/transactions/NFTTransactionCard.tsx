import { Dispatch, FC, SetStateAction, useCallback, useState } from 'react';

import cn from 'classnames';
import { Card } from 'antd';
import { useAppContext } from '../../context/app';
import { getAge, convertHex, standardUnit } from '../../lib/utils';

import {
  ChatBubbleSolid,
  ThumbsDownSolid,
  ThumbsUpSolid,
  NFTIcon,
  PurchaseIcon,
  MintIcon,
  BurnIcon,
  SendIcon,
} from '../icons/defisensi-icons';
import { NFTTransaction, TransactionType } from '../../types/transaction';
import { dislikeTransaction, likeTransaction } from '../../lib/api';
import { toast } from 'react-toastify';

type TransactionCardProps = {
  txn: NFTTransaction;
  transactionType: TransactionType;
  mutate?: Dispatch<SetStateAction<any>>;
};

export const NFTTransactionCard: FC<TransactionCardProps> = ({ txn, transactionType, mutate }) => {
  const { user } = useAppContext();
  const [transaction, setTransaction] = useState<NFTTransaction>(txn);
  const age = getAge(txn.timestamp);
  const { type, amount, name, symbol } = transaction.details.actions[0];

  const handleLike = useCallback(async () => {
    try {
      if (transaction.likes.includes(user.address)) {
        toast.error('You already like this transaction');
        return;
      } else if (transaction.dislikes.includes(user.address)) {
        toast.error('You already dislike this transaction');
        return;
      }

      if (!mutate) {
        await likeTransaction(transaction, user.address, transactionType);
      } else {
        mutate((prev: any) => {
          const txns = prev.transactions.map((txn: any) =>
            txn.id === transaction.id ? { ...transaction, likes: [...transaction.likes, user.address] } : txn,
          );
          return { ...prev, transactions: txns };
        });
      }
      setTransaction({ ...transaction, likes: [...transaction.likes, user.address] });
      toast.success('You liked this transaction');
    } catch (error) {
      toast.error((error as any).message);
    }
  }, [user, transaction, transactionType]);

  const handleDisLike = useCallback(async () => {
    try {
      if (transaction.dislikes.includes(user.address)) {
        toast.error('You already dislike this transaction');
        return;
      } else if (transaction.likes.includes(user.address)) {
        toast.error('You already likes this transaction');
        return;
      }
      if (!mutate) {
        await dislikeTransaction(transaction, user.address, transactionType);
      } else {
        mutate((prev: any) => {
          const txns = prev.transactions.map((txn: any) =>
            txn.id === transaction.id ? { ...transaction, dislikes: [...transaction.dislikes, user.address] } : txn,
          );
          return { ...prev, transactions: txns };
        });
      }
      setTransaction({ ...transaction, dislikes: [...transaction.dislikes, user.address] });
      toast.success('You disliked this transaction');
    } catch (error) {
      toast.error((error as any).message);
    }
  }, [user, transaction, transactionType]);

  return (
    <Card bordered={false} style={{ width: 392 }} className="mb-2 font-inter" key={transaction.txHash}>
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
            {transaction.details.actions.map((action, idx) => {
              if (idx > 0) return;
              switch (action.type) {
                case 'Mint':
                  return <MintIcon key={'mint-icon'} />;
                case 'Burn':
                  return <BurnIcon key={'burn-icon'} />;
                case 'Purchase':
                  return <PurchaseIcon key={'purchase-icon'} />;
                case 'Transfer':
                  return <SendIcon key={'send-icon'} />;
                case 'Sale':
                  return <PurchaseIcon key={'sale-icon'} />;
              }
            })}
          </span>
          <span className="font-bold" title={transaction.details.to}>
            {convertHex(transaction.details.to).substring(0, 5)}
          </span>
        </div>
        <div>
          <img
            src={`/images/network/${transaction.network}.png`}
            width={32}
            height={32}
            className="rounded-full border"
            alt="platform_icon"
          ></img>
        </div>
      </div>
      <div className="text-base font-semibold">{`${type} ${amount} of ${name} (${symbol})`}</div>
      <div className="mt-4 flex justify-around text-center text-sm">
        <div className="flex items-center gap-[3px] hover:cursor-pointer" onClick={handleLike}>
          <ThumbsUpSolid
            className="h-5 w-5 scale-x-[-1]"
            fill={transaction.likes.includes(user.address) ? '#FF5D29' : '#8E98B0'}
          />
          <span
            className={cn('font-inter', {
              'text-orange-400': transaction.likes.includes(user.address),
              'text-bali-hai-600': transaction.likes.includes(user.address),
            })}
          >
            {standardUnit(transaction.likes.length)}
          </span>
        </div>
        <div className="flex items-center gap-[3px] hover:cursor-pointer" onClick={handleDisLike}>
          <ThumbsDownSolid
            className="h-5 w-5"
            fill={transaction.dislikes.includes(user.address) ? '#FF5D29' : '#8E98B0'}
          />
          <span
            className={cn('font-inter', {
              'text-orange-400': transaction.dislikes.includes(user.address),
              'text-bali-hai-600': transaction.dislikes.includes(user.address),
            })}
          >
            {standardUnit(transaction.dislikes.length)}
          </span>
        </div>
        <div className="flex items-center gap-[3px] hover:cursor-pointer">
          <ChatBubbleSolid
            className="h-5 w-5"
            fill={
              transaction.comments.findIndex((comment) => comment.address === user.address) > 0 ? '#FF5D29' : '#8E98B0'
            }
          />
          <span
            className={cn('font-inter', {
              'text-orange-400': transaction.comments.findIndex((comment) => comment.address === user.address) > 0,
              'text-bali-hai-600': transaction.comments.findIndex((comment) => comment.address === user.address) > 0,
            })}
          >
            {standardUnit(transaction.comments.length)}
          </span>
        </div>
      </div>
    </Card>
  );
};
