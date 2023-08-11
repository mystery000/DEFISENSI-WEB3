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
    <div className="w-full rounded-lg border border-[#8E98B04D] p-3 lg:w-[48%]">
      <span className="font-sora text-base font-normal text-[#8E98B0]">
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
