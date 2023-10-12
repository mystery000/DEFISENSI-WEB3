import { FC } from 'react';
import Select from 'react-select';
import { NetworkType } from '../types';

interface ChainSelectionProps {
  onChange?: (chain: any) => void;
  value: NetworkType;
}

export const ChainSelection: FC<ChainSelectionProps> = ({
  onChange,
  value,
}) => {
  const options = [
    {
      value: NetworkType.ETHEREUM,
      name: 'ethereum',
      label: 'Ethereum',
      logo: '/images/network/ethereum.png',
    },
    {
      value: NetworkType.BSC,
      name: 'bsc',
      label: 'BNB Chain',
      logo: '/images/network/binance.png',
    },
    {
      value: NetworkType.ARBITRUM,
      name: 'arbitrum',
      label: 'Arbitrum',
      logo: '/images/network/arbitrum.png',
    },
    {
      value: NetworkType.POLYGON,
      name: 'polygon',
      label: 'Polygon',
      logo: '/images/network/polygon.png',
    },
    {
      value: NetworkType.AVALANCHE,
      name: 'avalanche',
      label: 'Avalanche',
      logo: '/images/network/avalanche.png',
    },
  ];

  const formatOptionLabel = ({
    label,
    logo,
  }: {
    label: string;
    logo: string;
  }) => (
    <div className="flex items-center gap-2">
      <img
        src={logo}
        width={24}
        height={24}
        alt="noimg"
        className="rounded-full"
        loading="lazy"
      />
      <div className="grow text-center">{label}</div>
    </div>
  );

  return (
    <Select
      defaultValue={options[0]}
      formatOptionLabel={formatOptionLabel}
      options={options}
      onChange={onChange}
      className="w-44"
      value={options.find((option) => option.value === value)}
    />
  );
};
