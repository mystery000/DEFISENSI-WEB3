import { Dispatch, FC, SetStateAction, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ChatBubbleSolid,
  SwapIcon,
  SendIcon,
  ThumbsDownSolid,
  ThumbsUpSolid,
  TokenIcon,
} from '../icons/defisensi-icons';

import cn from 'classnames';
import { toast } from 'react-toastify';
import { TransferType } from '../../types';
import { Card, Modal, Input, Image } from 'antd';
import { useAppContext } from '../../context/app';
import { TokenTransaction, TransactionType } from '../../types/transaction';
import {
  commentTransaction,
  dislikeTransaction,
  likeTransaction,
  unDislikeTransaction,
  unlikeTransaction,
} from '../../lib/api';
import { convertDecimals, convertHex, getAge, getExplorerLink, getTransferType, standardUnit } from '../../lib/utils';

const { TextArea } = Input;

type TransactionCardProps = {
  txn: TokenTransaction;
  transactionType: TransactionType;
  mutate?: Dispatch<SetStateAction<any>>;
};

export const TransactionCard: FC<TransactionCardProps> = ({ txn, transactionType, mutate }) => {
  const [transaction, setTransaction] = useState<TokenTransaction>(txn);
  const { user } = useAppContext();
  const [content, setContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const age = getAge(transaction.timestamp);

  const handleLike = useCallback(async () => {
    try {
      if (transaction.likes.includes(user.address)) {
        if (!mutate) {
          await unlikeTransaction(transaction, user.address, transactionType);
        } else {
          mutate((prev: any) => {
            const txns = prev.transactions.map((txn: any) =>
              txn.id === transaction.id
                ? { ...transaction, likes: transaction.likes.filter((address) => address !== user.address) }
                : txn,
            );
            return { ...prev, transactions: txns };
          });
        }
        setTransaction({ ...transaction, likes: transaction.likes.filter((address) => address !== user.address) });
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
    } catch (error) {
      toast.error((error as any).message);
    }
  }, [user, transaction, transactionType]);

  const handleDisLike = useCallback(async () => {
    try {
      if (transaction.dislikes.includes(user.address)) {
        if (!mutate) {
          await unDislikeTransaction(transaction, user.address, transactionType);
        } else {
          mutate((prev: any) => {
            const txns = prev.transactions.map((txn: any) =>
              txn.id === transaction.id
                ? { ...transaction, dislikes: transaction.dislikes.filter((address) => address !== user.address) }
                : txn,
            );
            return { ...prev, transactions: txns };
          });
        }
        setTransaction({
          ...transaction,
          dislikes: transaction.dislikes.filter((address) => address !== user.address),
        });
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
    } catch (error) {
      toast.error((error as any).message);
    }
  }, [user, transaction, transactionType]);

  const handleComment = useCallback(async () => {
    try {
      if (transaction.comments.findIndex((comment) => comment.address === user.address) > -1) {
        toast.error('You already comented this transaction');
        return;
      }
      if (!mutate) {
        await commentTransaction(transaction, user.address, content, transactionType);
      } else {
        mutate((prev: any) => {
          const txns = prev.transactions.map((txn: any) =>
            txn.id === transaction.id
              ? { ...transaction, comments: [...transaction.comments, { address: user.address, comment: content }] }
              : txn,
          );
          return { ...prev, transactions: txns };
        });
      }
      setTransaction({
        ...transaction,
        comments: [...transaction.comments, { address: user.address, comment: content }],
      });
    } catch (error) {
      toast.error((error as any).message);
    }
  }, [user, transaction, transactionType, content]);

  return (
    <>
      <Card bordered={false} style={{ width: 392 }} className="mb-2 font-inter">
        <Link className="cursor-pointer" to={getExplorerLink(transaction)} target="_blank">
          <div className="flex justify-between font-inter text-sm">
            <TokenIcon />
            <span>{age}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="font-bold" title={transaction.details.from}>
                {convertHex(transaction.details.from).substring(0, 5)}
              </span>
              <span>{getTransferType(transaction) === TransferType.SEND ? <SendIcon /> : <SwapIcon />}</span>
              <span className="font-bold" title={transaction.details.to}>
                {convertHex(transaction.details.to).substring(0, 5)}
              </span>
            </div>
            <Image
              width={32}
              height={32}
              className="rounded-full"
              alt="#"
              src={`/images/network/${transaction.network}.png`}
              loading="lazy"
              preview={false}
            />
          </div>
          {transaction.details.token0 && (
            <div className="my-2 flex items-center space-x-2 font-inter">
              <Image
                width={24}
                height={24}
                className="rounded-full"
                alt="#"
                src={`/images/tokens/${transaction.details.token0.symbol.toUpperCase()}.png`}
                fallback={`/images/tokens/default/empty-${transaction.network}.png`}
                loading="lazy"
                preview={false}
              />
              <span>
                {`${convertDecimals(transaction.details.token0.amount, transaction.details.token0.decimals)} ${
                  transaction.details.token0.symbol
                }`}
              </span>
              <span className="text-bali-hai-600">{`@${Number(
                transaction.details.token0.price,
              ).toLocaleString()} USD`}</span>
            </div>
          )}
          {transaction.details.token1 && (
            <div className="flex items-center">
              <span className="pr-2">
                <Image
                  width={24}
                  height={24}
                  className="rounded-full"
                  alt="#"
                  src={`/images/tokens/${transaction.details.token1?.symbol.toUpperCase()}.png`}
                  fallback={`/images/tokens/default/empty-${transaction.network}.png`}
                  loading="lazy"
                  preview={false}
                />
              </span>
              <span>{`${convertDecimals(transaction.details.token1.amount, transaction.details.token1.decimals)} ${
                transaction.details.token1.symbol
              }`}</span>
              <span className="text-bali-hai-600">{`@${Number(
                transaction.details.token1.price,
              ).toLocaleString()} USD`}</span>
            </div>
          )}
        </Link>
        <div className="mt-4 flex justify-around text-center text-sm">
          <div className="flex items-center gap-[3px] hover:cursor-pointer" onClick={handleLike}>
            <ThumbsUpSolid
              className="h-5 w-5 scale-x-[-1]"
              fill={transaction.likes.length > 0 ? '#FF5D29' : '#8E98B0'}
            />
            <span
              className={cn('font-inter', {
                'text-orange-400': transaction.likes.length > 0,
                'text-bali-hai-600': transaction.likes.length > 0,
              })}
            >
              {standardUnit(transaction.likes.length)}
            </span>
          </div>
          <div className="flex items-center gap-[3px] hover:cursor-pointer" onClick={handleDisLike}>
            <ThumbsDownSolid className="h-5 w-5" fill={transaction.dislikes.length > 0 ? '#FF5D29' : '#8E98B0'} />
            <span
              className={cn('font-inter', {
                'text-orange-400': transaction.dislikes.length > 0,
                'text-bali-hai-600': transaction.dislikes.length > 0,
              })}
            >
              {standardUnit(transaction.dislikes.length)}
            </span>
          </div>
          <div className="flex items-center gap-[3px] hover:cursor-pointer" onClick={() => setIsModalOpen(true)}>
            <ChatBubbleSolid className="h-5 w-5" fill={transaction.comments.length > 0 ? '#FF5D29' : '#8E98B0'} />
            <span
              className={cn('font-inter', {
                'text-orange-400': transaction.comments.length > 0,
                'text-bali-hai-600': transaction.comments.length > 0,
              })}
            >
              {standardUnit(transaction.comments.length)}
            </span>
          </div>
        </div>
      </Card>
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={512}
        okText="Comment"
        okButtonProps={{ className: 'bg-black hover:bg-black-800' }}
        onOk={handleComment}
      >
        <div className="my-4 border-b-2 border-silver-sand-300 font-bold">{`${transaction.comments.length} Comments`}</div>
        {transaction.comments.map((comment, idx) => (
          <div className="flex items-center gap-2" key={`${transaction.id}-${idx}`}>
            <div className="flex h-10 w-11 items-center  justify-center rounded-full bg-blue-600 text-2xl text-white">
              A
            </div>
            <div className="my-2 w-full rounded-lg border border-silver-sand-200 px-3 py-2 text-lg">
              {comment.comment}
            </div>
          </div>
        ))}
        <TextArea
          rows={4}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Start the discussion..."
          value={content}
        />
      </Modal>
    </>
  );
};
