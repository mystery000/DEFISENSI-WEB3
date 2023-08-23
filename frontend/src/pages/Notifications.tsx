import { Button, Modal } from 'antd';
import AppLayout from '../layouts/AppLayout';
import { Mail, Send } from 'lucide-react';
import { NFTNotification } from '../components/notifications/NFTNotification';
import { WalletNotification } from '../components/notifications/WalletNotification';
import { useState } from 'react';
import {
  NFTAlertIcon,
  TokenAlertIcon,
  WalletAlertIcon,
} from '../components/icons/defisensi-icons';

export const Notifications = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AppLayout>
      <div className="w-full font-inter xl:mx-auto xl:w-2/3">
        <div
          className="flex flex-col p-6 text-center xl:flex-row xl:justify-between xl:py-12"
          style={{
            background:
              'radial-gradient(100% 100% at 50% 100%, #FFECE6 0%, #FFFFFF 100%)',
          }}
        >
          <div>
            <div className="font-sora text-[32px] font-semibold">
              Notifications
            </div>
            <div className="text-sm">
              How do you want us to send you notifications?
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-[10px] xl:items-end">
            <button className="flex w-[185px] items-center justify-center gap-1 rounded-md bg-black px-4 py-2 text-[14px] font-medium text-white xl:py-3">
              <Send size={16} />
              Telegram
            </button>
            <button className="flex w-[185px] items-center justify-center gap-1 rounded-md bg-black px-4 py-2 text-[14px] font-medium text-white xl:py-3">
              <Mail size={16} />
              Email
            </button>
          </div>
        </div>
        <div className="min-w-sm m-4 p-6 font-inter lg:mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-sora text-[22px]">Your alerts</span>
            <button
              className="rounded-md bg-orange-400 px-4 py-2 text-base font-medium text-white"
              onClick={() => setIsModalOpen(true)}
            >
              + Add Alert
            </button>
          </div>
          <div className="flex flex-col items-center justify-center gap-6 lg:flex-row lg:flex-wrap">
            <NFTNotification />
            <NFTNotification />
            <NFTNotification />
            <WalletNotification />
            <WalletNotification />
            <WalletNotification />
          </div>
        </div>
      </div>
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okButtonProps={{ className: 'hidden' }}
        cancelButtonProps={{ className: 'hidden' }}
        width={350}
      >
        <p className="my-2 font-sora text-2xl font-semibold">
          Create New Alert
        </p>
        <div className="my-2 flex items-center gap-6 rounded-md border border-bali-hai-600/20 px-4 py-2">
          <WalletAlertIcon />
          <div>
            <div className="font-sora text-sm">Wallet Alert</div>
            <div className="font-sora text-[10px] text-bali-hai-600">
              Create New Alert for Wallet
            </div>
          </div>
        </div>
        <div className="my-2 flex items-center gap-6 rounded-md border border-bali-hai-600/20 px-4 py-2">
          <TokenAlertIcon />
          <div>
            <div className="font-sora text-sm">Wallet Alert</div>
            <div className="font-sora text-[10px] text-bali-hai-600">
              Create New Alert for Wallet
            </div>
          </div>
        </div>
        <div className="my-2 flex items-center gap-6 rounded-md border border-bali-hai-600/20 px-4 py-2">
          <NFTAlertIcon />
          <div>
            <div className="font-sora text-sm">Wallet Alert</div>
            <div className="font-sora text-[10px] text-bali-hai-600">
              Create New Alert for Wallet
            </div>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};
