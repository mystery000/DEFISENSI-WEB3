import { FC } from 'react';

import { keyFormatter } from '../../lib/utils';
import { Sparklines, SparklinesLine } from 'react-sparklines';

interface AssetProps {
  chainName: string;
  data?: number[];
}

export const Asset: FC<AssetProps> = ({ chainName, data }) => {
  if (!data) return <div></div>;
  const quote = keyFormatter(Number(data.at(-1)));
  return (
    <div className="w-full rounded-lg border border-bali-hai-600/30 p-3 2xl:w-[48%]">
      <span className="font-sora text-base text-bali-hai-600">{chainName}</span>
      <div className="flex items-center justify-between">
        <span className="font-sora text-[28px]" title={`${data[0]}`}>
          {quote}
        </span>
        <span className="w-16">
          <Sparklines data={data}>
            <SparklinesLine style={{ fill: 'none', strokeWidth: 10 }} color="#26B149" />
          </Sparklines>
        </span>
      </div>
      <span></span>
    </div>
  );
};
