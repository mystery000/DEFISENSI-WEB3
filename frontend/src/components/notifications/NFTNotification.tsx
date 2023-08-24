import { AlertIcon, PauseIcon } from '../icons/defisensi-icons';

export const NFTNotification = () => {
  return (
    <div className="w-[382px] rounded-md bg-white p-[20px]">
      <div className="text-center font-sora text-xl font-semibold leading-6">
        NFT Alert1
      </div>
      <div className="bg-persian-red-600 mx-auto my-4 w-fit rounded-[24px] px-4 py-2 text-center text-white">
        Alert for all BAYC NFTs
      </div>
      <hr />
      <div className="my-3 flex flex-col gap-3">
        <div className="flex items-center gap-12">
          <div className="w-1/3 text-sm text-bali-hai-600">NFT Collection</div>
          <span className="font-sora font-semibold">BAYC</span>
        </div>
        <div className="flex items-center gap-12">
          <div className="w-1/3 text-sm text-bali-hai-600">Daily Floor</div>
          <div className="flex items-center gap-2">
            <img
              src={`/images/tokens/eth.png`}
              width={20}
              height={20}
              alt="noIcon"
            />
            <span className="font-sora font-semibold">10 {'<'} 22</span>
          </div>
        </div>
        <div className="flex items-center gap-12">
          <div className="w-1/3 text-sm text-bali-hai-600">Daily Volume</div>
          <div className="flex items-center gap-2">
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
          <div className="w-1/3 text-sm text-bali-hai-600">Daily Sales</div>
          <div className="flex items-center gap-2">
            <img
              src={`/images/tokens/eth.png`}
              width={20}
              height={20}
              alt="noIcon"
            />
            <span className="font-sora font-semibold">22</span>
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