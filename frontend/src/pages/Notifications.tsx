import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Modal, Spin } from 'antd';
import { Mail, Send } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { NFTNotification } from '../components/notifications/NFTNotification';
import { WalletNotification } from '../components/notifications/WalletNotification';

import {
  NFTAlertIcon,
  TokenAlertIcon,
  WalletAlertIcon,
} from '../components/icons/defisensi-icons';
import { NotificationType } from '../types/notification';
import useNotifications from '../lib/hooks/useNotifications';
import { EmptyContainer } from '../components/EmptyContainer';
import { TokenNotification } from '../components/notifications/TokenNotification';

export const Notifications = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { notifications, loading, error, mutate } = useNotifications();

  if (loading) {
    return (
      <div className="grid h-screen place-items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid h-screen place-items-center">
        <span className="font-sora text-2xl font-semibold">
          Network connection error
        </span>
      </div>
    );
  }

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
          <div className="flex flex-col items-start justify-start gap-6 lg:flex-row lg:flex-wrap">
            {notifications.length ? (
              notifications.map((notification) =>
                notification.type === NotificationType.WALLET ? (
                  <WalletNotification
                    notification={notification}
                    setNotifications={mutate}
                    key={notification._id}
                  />
                ) : notification.type === NotificationType.TOKEN ? (
                  <TokenNotification
                    notification={notification}
                    setNotifications={mutate}
                    key={notification._id}
                  />
                ) : (
                  <NFTNotification
                    notification={notification}
                    setNotifications={mutate}
                    key={notification._id}
                  />
                ),
              )
            ) : (
              <EmptyContainer />
            )}
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
        <div
          className="my-2 flex items-center gap-6 rounded-md border border-bali-hai-600/20 px-4 py-2 transition duration-300 hover:border-royal-blue-500"
          onClick={() => navigate('/notification/wallet/create')}
        >
          <WalletAlertIcon />
          <div>
            <div className="font-sora text-sm">Wallet Alert</div>
            <div className="font-sora text-[10px] text-bali-hai-600">
              Create New Alert for Wallet
            </div>
          </div>
        </div>
        <div
          className="my-2 flex items-center gap-6 rounded-md border border-bali-hai-600/20 px-4 py-2 transition duration-300 hover:border-royal-blue-500"
          onClick={() => navigate('/notification/token/create')}
        >
          <TokenAlertIcon />
          <div>
            <div className="font-sora text-sm">Token Alert</div>
            <div className="font-sora text-[10px] text-bali-hai-600">
              Create New Alert for Token
            </div>
          </div>
        </div>
        <div
          className="my-2 flex items-center gap-6 rounded-md border border-bali-hai-600/20 px-4 py-2 transition duration-300 hover:border-royal-blue-500"
          onClick={() => navigate('/notification/nft/create')}
        >
          <NFTAlertIcon />
          <div>
            <div className="font-sora text-sm">NFT Alert</div>
            <div className="font-sora text-[10px] text-bali-hai-600">
              Create New Alert for NFT
            </div>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};
