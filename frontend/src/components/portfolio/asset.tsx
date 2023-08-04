import { FC } from "react";

interface AssetProps {
  className?: string;
  blockchain: string;
  balance: number;
}

export const Asset: FC<AssetProps> = ({ className, blockchain, balance }) => {
  return (
    <div className='p-3 border lg:w-[48%] w-full border-[#8E98B04D] rounded-lg'>
      <span className='font-sora text-base font-normal text-[#8E98B0]'>
        {blockchain}
      </span>
      <div className='flex justify-between items-center'>
        <span className='font-sora text-[28px]'>
          $<b>{balance}B</b>
        </span>
        <span>
          <svg
            width='62'
            height='32'
            viewBox='0 0 62 32'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M0.5 29.75L12.4874 25.598C12.905 25.4534 13.263 25.1744 13.5054 24.8048L18.2671 17.5416C18.9044 16.5695 20.2334 16.3437 21.1561 17.0506L28.5427 22.7102C28.7914 22.9008 29.0815 23.0303 29.3895 23.0882L40.3531 25.1495C41.0896 25.288 41.8418 25.0031 42.3017 24.4114L46.9807 18.392C47.5105 17.7105 48.4178 17.4457 49.231 17.7354L52.2131 18.7978C53.287 19.1804 54.463 18.5893 54.7967 17.4991L60 0.5'
              stroke='#26B149'
              strokeWidth='3'
            />
          </svg>
        </span>
      </div>
    </div>
  );
};
