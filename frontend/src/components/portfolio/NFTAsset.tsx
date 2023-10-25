import { FC } from 'react';

interface NFTAssetProps {
  chainName: string;
  value?: string;
  symbol?: string;
}

export const NFTAsset: FC<NFTAssetProps> = ({ chainName, value, symbol }) => {
  return (
    <div className="w-full rounded-lg border border-bali-hai-600/30 p-3 2xl:w-[48%]">
      <span className="font-sora text-base text-bali-hai-600">{chainName}</span>
      <div className="flex items-center justify-between">
        <span className="font-sora text-[28px]" title={value}>
          {Number(value || 0).toLocaleString()}
          <span className="text-sm">{` ${symbol || ''}`}</span>
        </span>
      </div>
      <span></span>
    </div>
  );
};
