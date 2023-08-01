import { FC } from "react";
import cn from "classnames";
import { Card, Tag } from "antd";
import { TransactionType } from "../../types/enums";
import { Transaction } from "../../types/transaction";
import { Minus, MoveLeft, MoveRight } from "lucide-react";
import {
  converBaseUnit,
  convertHex,
  getAge,
  standardUnit,
} from "../../lib/utils";
import {
  ChatBubbleSolid,
  ThumbsDownSolid,
  ThumbsUpSolid,
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
      <Card bordered={false} style={{ width: 400 }} className='font-inter my-2'>
        Processing...
      </Card>
    );
  }
  const age = getAge(Number(transaction.details.created));
  return (
    <>
      <Card bordered={false} style={{ width: 400 }} className='font-inter my-2'>
        <div className='flex justify-between text-sm font-inter'>
          <Tag color='#FFD25F'>
            <span className='text-black font-bold'>TOKEN</span>
            <div className='relative'>
              <div className='absolute bottom-full left-1/2 ml-[-5px] border-t-2 border-black'>
                <svg
                  className='absolute h-2 w-full left-0 text-black fill-current'
                  viewBox='0 0 3 1'
                >
                  <polygon points='1.5,0 3,1 0,1' />
                </svg>
              </div>
            </div>
          </Tag>
          <span>{age}</span>
        </div>
        <div className='flex justify-between items-center'>
          <div className='flex gap-1'>
            <span className='font-bold'>
              {convertHex(transaction.details.from).substring(0, 5)}
            </span>
            <span>
              {transaction.details.type !== TransactionType.SEND ? (
                <MoveLeft />
              ) : (
                <Minus />
              )}
            </span>
            <span>
              <Tag
                className={cn("text-white rounded-md py-0.5 px-1.5", {
                  "bg-[#139433]":
                    transaction.details.type === TransactionType.RECEIVE,
                  "bg-[#7353F2]":
                    transaction.details.type === TransactionType.SWAP,
                  "bg-[#0048D4]":
                    transaction.details.type === TransactionType.SEND,
                })}
              >
                {transaction.details.type}
              </Tag>
            </span>
            <span>
              {transaction.details.type === TransactionType.RECEIVE ? (
                <Minus />
              ) : (
                <MoveRight />
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
              />
            </span>
            <span>
              {`${converBaseUnit(
                transaction.details.token0.amount,
                transaction.details.token0.decimals
              )} ${transaction.details.token0.symbol}`}
            </span>
            <span className='text-[#8E98B0]'>{`@${transaction.details.token0.price.toFixed(
              2
            )} USD`}</span>
          </div>
        )}
        {transaction.details.token1 ? (
          <div className='flex items-center'>
            <span className='pr-2'>
              <img
                src={`./images/tokens/${transaction.details.token1.symbol.toLowerCase()}.png`}
                width={24}
                height={24}
              />
            </span>
            <span>{`${converBaseUnit(
              transaction.details.token1.amount,
              transaction.details.token1.decimals
            )} ${transaction.details.token1.symbol}`}</span>
            <span className='text-[#8E98B0]'>{`@${transaction.details.token1.price.toFixed(
              2
            )} USD`}</span>
          </div>
        ) : (
          <div className='h-[24px]'></div>
        )}
        <div className='flex justify-around mt-4 text-center text-sm'>
          <div className='flex items-center hover:cursor-pointer'>
            <ThumbsUpSolid
              className='w-5 h-5 scale-x-[-1]'
              fill={likes.includes(user._id) ? "#FF5D29" : "#8E98B0"}
            />
            <span>{standardUnit(likes.length)}</span>
          </div>
          <div className='flex items-center hover:cursor-pointer gap-1'>
            <ThumbsDownSolid
              className='w-5 h-5'
              fill={dislikes.includes(user._id) ? "#FF5D29" : "#8E98B0"}
            />
            <span>{standardUnit(dislikes.length)}</span>
          </div>
          <div className='flex items-center hover:cursor-pointer'>
            <ChatBubbleSolid
              className='w-5 h-5'
              fill={comments.includes(user._id) ? "#FF5D29" : "#8E98B0"}
            />
            <span>{standardUnit(comments.length)}</span>
          </div>
        </div>
      </Card>
    </>
  );
};
