import { FC } from "react";

import { Token, Transaction, Wallet } from "../../types/transaction";
import { TransactionDetailsCard } from "./TransactionDetailsCard";

type TransactionCardProps = {
  data: Wallet | Token;
};

export const TransactionCard: FC<TransactionCardProps> = ({ data }) => {
  return (
    <div className='flex flex-col'>
      {data.transactions.map((transaction) => (
        <TransactionDetailsCard
          key={transaction.txhash}
          transaction={transaction}
          likes={data.likes}
          dislikes={data.dislikes}
          comments={data.comments}
        />
      ))}
    </div>
  );
};
