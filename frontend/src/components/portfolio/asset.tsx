import { FC } from 'react';

import { Sparklines, SparklinesLine } from 'react-sparklines';

interface AssetProps {
  className?: string;
  blockchain: string;
  balance: string;
  history: number[];
}

export const Asset: FC<AssetProps> = ({
  className,
  blockchain,
  balance,
  history,
}) => {
  return (
    <div className="border-bali-hai-600/30 w-full rounded-lg border p-3 2xl:w-[48%]">
      <span className="text-bali-hai-600 font-sora text-base">
        {blockchain}
      </span>
      <div className="flex items-center justify-between">
        <span className="font-sora text-[28px]">
          $<b>{balance}</b>
        </span>
        <span className="w-16">
          <Sparklines data={history}>
            <SparklinesLine
              style={{ fill: 'none', strokeWidth: 10 }}
              color="#26B149"
            />
          </Sparklines>
        </span>
      </div>
      <span></span>
    </div>
  );
};
