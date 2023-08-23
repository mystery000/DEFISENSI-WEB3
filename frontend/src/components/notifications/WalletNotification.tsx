import { AlertIcon, PauseIcon } from '../icons/defisensi-icons';

export const WalletNotification = () => {
  return (
    <div className="w-[382px] rounded-md bg-white p-[20px]">
      <div className="text-center font-sora text-xl font-semibold leading-6">
        Whale Alert1
      </div>
      <div className="mx-auto my-4 w-fit rounded-[24px] bg-persian-red-600 px-4 py-2 text-center text-white">
        Alert for all Whale wallets
      </div>
      <hr />
      <div className="my-3 flex flex-col gap-3">
        <div className="flex items-center gap-12">
          <div className="w-1/3 text-sm text-bali-hai-600">Wallets (4)</div>
          <span className="font-sora font-semibold">024175, W4551d</span>
        </div>
        <div className="flex items-center gap-12">
          <div className="w-1/3 text-sm text-bali-hai-600">USD Value</div>
          <span className="font-sora font-semibold">{'<'} 22,000</span>
        </div>
        <div className="flex items-center gap-12">
          <div className="w-1/3 text-sm text-bali-hai-600">Token Value</div>
          <div className="flex items-center">
            <img
              src={`/images/tokens/eth.png`}
              width={20}
              height={20}
              alt="noIcon"
            />
            <img
              src={`/images/tokens/eth.png`}
              width={20}
              height={20}
              alt="noIcon"
            />
            <span className="font-sora font-semibold">150</span>
          </div>
        </div>
        <div className="flex items-center gap-12">
          <div className="w-1/3 text-sm text-bali-hai-600">Tokens</div>
          <div className="flex items-center gap-2">
            <img
              src={`/images/tokens/eth.png`}
              width={20}
              height={20}
              alt="noIcon"
            />
            <span className="font-sora font-semibold">{'<'} 22,000</span>
          </div>
        </div>
        <div className="flex items-center gap-12">
          <div className="w-1/3 text-sm text-bali-hai-600">Chains</div>
          <div className="flex items-center">
            <img
              src={`/images/tokens/eth.png`}
              width={20}
              height={20}
              alt="noIcon"
            />
            <img
              src={`/images/tokens/eth.png`}
              width={20}
              height={20}
              alt="noIcon"
            />
            <span className="font-sora font-semibold"></span>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-start gap-3">
        <button className="flex items-center justify-center gap-[6px] rounded-md border border-bali-hai-600/40 px-4 py-2">
          <AlertIcon />
          <span className="text-sm font-medium">Edit Alert</span>
        </button>
        <button className="flex items-center justify-center gap-[6px] rounded-md border border-bali-hai-600/40 px-4 py-2">
          <PauseIcon />
          <span className="text-sm font-medium">Pause Alert</span>
        </button>
      </div>
    </div>
  );
};
