import { FC } from "react";
import cn from "classnames";
import { Card } from "antd";
import { TransactionType } from "../../types/enums";
import { Transaction } from "../../types/transaction";
import {
  convertBaseUnit,
  convertHex,
  getAge,
  standardUnit,
} from "../../lib/utils";
import {
  ChatBubbleSolid,
  ReceiveIcon,
  SwapIcon,
  SendIcon,
  ThumbsDownSolid,
  ThumbsUpSolid,
  TokenIcon,
} from "../icons/defisensi-icons";
import { useAppContext } from "../../context/app";

type TransactionCardProps = {
  transaction: Transaction;
  likes: any[];
  dislikes: any[];
  comments: any[];
};

export const TransactionDetailsCard: FC<TransactionCardProps> = ({
  transaction,
  likes,
  dislikes,
  comments,
}) => {
  const { user } = useAppContext();
  if (!transaction.details) {
    return (
      <Card bordered={false} style={{ width: 392 }} className='font-inter my-2'>
        Processing...
      </Card>
    );
  }
  const age = getAge(Number(transaction.details.timestamp));

  return (
    <Card bordered={false} style={{ width: 392 }} className='font-inter mb-2'>
      <div className='flex justify-between text-sm font-inter'>
        <TokenIcon />
        <span>{age}</span>
      </div>
      <div className='flex justify-between items-center'>
        <div className='flex gap-1 items-center'>
          <span className='font-bold'>
            {convertHex(transaction.details.from).substring(0, 5)}
          </span>
          <span>
            {transaction.details.type === TransactionType.RECEIVE ? (
              <ReceiveIcon />
            ) : transaction.details.type === TransactionType.SEND ? (
              <SendIcon />
            ) : (
              <SwapIcon />
            )}
          </span>
          <span className='font-bold'>
            {transaction.details.type !== TransactionType.SWAP ? (
              convertHex(transaction.details.to).substring(0, 5)
            ) : (
              <></>
            )}
          </span>
        </div>
        <div>
          <img
            src='./images/platforms/uniswap.png'
            width={32}
            height={32}
            className='rounded-full border'
            alt='platform_icon'
          ></img>
        </div>
      </div>
      {transaction.details.token0 && (
        <div className='flex items-center font-inter my-2'>
          <span className='pr-2'>
            <img
              src={`./images/tokens/${transaction.details.token0.symbol.toLowerCase()}.png`}
              width={24}
              height={24}
              alt='token-icon'
            />
          </span>
          <span>
            {`${convertBaseUnit(
              transaction.details.token0.amount,
              transaction.details.token0.decimals
            )} ${transaction.details.token0.symbol}`}
          </span>
          <span className='text-[#8E98B0]'>{`@${transaction.details.token0.price.toLocaleString()} USD`}</span>
        </div>
      )}
      {transaction.details.token1 && (
        <div className='flex items-center'>
          <span className='pr-2'>
            <img
              src={`./images/tokens/${transaction.details.token1.symbol.toLowerCase()}.png`}
              width={24}
              height={24}
              alt='token-icon'
            />
          </span>
          <span>{`${convertBaseUnit(
            transaction.details.token1.amount,
            transaction.details.token1.decimals
          )} ${transaction.details.token1.symbol}`}</span>
          <span className='text-[#8E98B0]'>{`@${transaction.details.token1.price.toFixed(
            2
          )} USD`}</span>
        </div>
      )}
      <div className='flex justify-around mt-4 text-center text-sm'>
        <div className='flex items-center hover:cursor-pointer gap-[3px]'>
          <ThumbsUpSolid
            className='w-5 h-5 scale-x-[-1]'
            fill={likes.includes(user) ? "#FF5D29" : "#8E98B0"}
          />
          <span
            className={cn("font-inter", {
              "text-[#FF5D29]": likes.includes(user),
              "text-[#8E98B0]": likes.includes(user),
            })}
          >
            {standardUnit(likes.length)}
          </span>
        </div>
        <div className='flex items-center hover:cursor-pointer gap-[3px]'>
          <ThumbsDownSolid
            className='w-5 h-5'
            fill={dislikes.includes(user) ? "#FF5D29" : "#8E98B0"}
          />
          <span
            className={cn("font-inter", {
              "text-[#FF5D29]": dislikes.includes(user),
              "text-[#8E98B0]": dislikes.includes(user),
            })}
          >
            {standardUnit(dislikes.length)}
          </span>
        </div>
        <div className='flex items-center hover:cursor-pointer gap-[3px]'>
          <ChatBubbleSolid
            className='w-5 h-5'
            fill={comments.includes(user) ? "#FF5D29" : "#8E98B0"}
          />
          <span
            className={cn("font-inter", {
              "text-[#FF5D29]": comments.includes(user),
              "text-[#8E98B0]": comments.includes(user),
            })}
          >
            {standardUnit(comments.length)}
          </span>
        </div>
      </div>
    </Card>
  );
};
