import { useNavigate } from 'react-router-dom';
import { ChangeEvent, FC, useCallback, useEffect, useState } from 'react';

import {
  WalletNotificationType,
  Notification,
  NotificationType,
} from '../../types/notification';
import { Input, Select } from 'antd';
import { toast } from 'react-toastify';
import TextArea from 'antd/es/input/TextArea';
import AppLayout from '../../layouts/AppLayout';
import { useAppContext } from '../../context/app';
import { createNotification, updateNotification } from '../../lib/api';

const initialValue = { address: '', name: '', network: [] };

interface WalletNotificationPageProps {
  data?: Notification;
  handleEditAlert?: Function;
}

export const WalletNotificationPage: FC<WalletNotificationPageProps> = ({
  data,
  handleEditAlert,
}) => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [notification, setNotification] = useState<WalletNotificationType>(
    data ? (data as WalletNotificationType) : initialValue,
  );

  useEffect(() => {
    if (!user.address) return;
    setNotification((prev) => ({ ...prev, address: user.address }));
  }, [user]);

  const handleCreateNotification = useCallback(
    async (e: any) => {
      e.preventDefault();
      if (!notification.network.length) {
        toast.error('You must select at least one chain');
        return;
      }
      try {
        setCreating(true);
        await createNotification(NotificationType.WALLET, notification);
        toast.success('Created the notification successfully');
        setCreating(false);
        setNotification(initialValue);
        setTimeout(() => navigate('/notifications'), 500);
      } catch (error) {
        toast.error('Failed to create a notification');
        setCreating(false);
        console.error(error);
      }
    },
    [notification, navigate],
  );

  const handleUpdateNotification = useCallback(
    async (e: any) => {
      e.preventDefault();
      if (!data || !handleEditAlert) return;

      setUpdating(true);
      try {
        const updatedNotification = await updateNotification(
          (data as any)._id,
          {
            ...data,
            ...notification,
          },
        );
        toast.success('Updated the notification successfully');
        setUpdating(false);
        setTimeout(() => handleEditAlert(updatedNotification), 500);
      } catch (error) {
        toast.error('Failed to update a notification');
        setUpdating(false);
        console.error(error);
      }
    },
    [notification, data, handleEditAlert],
  );

  return (
    <AppLayout noLayout={!!data}>
      <div className="m-4 min-w-[430px] max-w-5xl bg-white p-4 font-inter lg:mx-auto">
        <div className="font-sora text-2xl font-semibold lg:text-center">
          {data ? 'Edit Wallet Alert' : 'Create Wallet Alert'}
        </div>
        <hr className="my-2"></hr>
        <form
          onSubmit={data ? handleUpdateNotification : handleCreateNotification}
        >
          <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row">
            <div className="w-full lg:w-[49%]">
              <label className="text-sm text-bali-hai-600">Alert name</label>
              <Input
                placeholder="Alert name"
                style={{ fontSize: '14px' }}
                size="large"
                value={notification?.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNotification((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="w-full lg:w-[49%]">
              <label className="text-sm text-bali-hai-600">Which chains?</label>
              <Select
                placeholder="Ethereum"
                style={{
                  fontSize: '14px',
                  width: '100%',
                }}
                options={[
                  { value: 'ethereum', label: 'Ethereum' },
                  { value: 'polygon', label: 'Polygon' },
                  { value: 'binance', label: 'BNB Smart Chain' },
                  { value: 'arbitrum', label: 'Arbitrum' },
                ]}
                size="large"
                mode="multiple"
                value={notification.network}
                onChange={(networks) =>
                  setNotification((prev) => ({
                    ...prev,
                    network: [...networks],
                  }))
                }
              />
            </div>
            <div className="w-full lg:w-[49%]">
              <label className="text-sm text-bali-hai-600">
                Whose alerts do you want to see?
              </label>
              <Input
                placeholder="Add addresses"
                style={{ fontSize: '14px' }}
                size="large"
                value={notification?.subscribeTo?.join(',')}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNotification((prev) => ({
                    ...prev,
                    subscribeTo: e.target.value.split(','),
                  }))
                }
                required
              />
            </div>
            <div className="w-full lg:w-[49%]">
              <label className="text-sm text-bali-hai-600">
                Receiving from?
              </label>
              <Input
                placeholder="Add addresses"
                style={{ fontSize: '14px' }}
                size="large"
                value={notification?.receivingFrom?.join(',')}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNotification((prev) => ({
                    ...prev,
                    receivingFrom: e.target.value.split(','),
                  }))
                }
              />
            </div>
            <div className="w-full lg:w-[49%]">
              <label className="text-sm text-bali-hai-600">Sending to?</label>
              <Input
                placeholder="Add addresses"
                style={{ fontSize: '14px' }}
                size="large"
                value={notification?.sendingTo?.join(',')}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNotification((prev) => ({
                    ...prev,
                    sendingTo: e.target.value.split(','),
                  }))
                }
              />
            </div>
            <div className="w-full lg:w-[49%]">
              <label className="text-sm text-bali-hai-600">
                What USD Value?
              </label>
              <div className="flex items-center gap-[10px]">
                <Input
                  placeholder="Min value"
                  style={{ fontSize: '14px' }}
                  size="large"
                  type="number"
                  min={0}
                  value={notification.minUsd}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNotification((prev) => ({
                      ...prev,
                      minUsd: Number(e.target.value),
                    }))
                  }
                />
                <span className="w-10 border p-0"> </span>
                <Input
                  placeholder="Max value"
                  style={{ fontSize: '14px' }}
                  size="large"
                  value={notification.maxUsd}
                  type="number"
                  min={0}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNotification((prev) => ({
                      ...prev,
                      maxUsd: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="w-full lg:w-[49%]">
              <label className="text-sm text-bali-hai-600">Which tokens?</label>
              <Input
                placeholder="Add tokens"
                style={{ fontSize: '14px' }}
                size="large"
                value={notification?.tokens?.join(',')}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNotification((prev) => ({
                    ...prev,
                    tokens: e.target.value.split(','),
                  }))
                }
              />
            </div>
            <div className="w-full lg:w-[49%]">
              <label className="text-sm text-bali-hai-600">
                What token Value?
              </label>
              <div className="flex items-center gap-[10px]">
                <Input
                  placeholder="Min value"
                  style={{ fontSize: '14px' }}
                  size="large"
                  type="number"
                  min={0}
                  value={notification.minTokenValue}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNotification((prev) => ({
                      ...prev,
                      minTokenValue: Number(e.target.value),
                    }))
                  }
                />
                <span className="w-10 border p-0"> </span>
                <Input
                  placeholder="Max value"
                  style={{ fontSize: '14px' }}
                  size="large"
                  type="number"
                  min={0}
                  value={notification.maxTokenValue}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNotification((prev) => ({
                      ...prev,
                      maxTokenValue: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="w-full">
              <label className="text-sm text-bali-hai-600">
                Alert description
              </label>
              <TextArea
                placeholder="Alert description"
                style={{ fontSize: '14px' }}
                size="large"
                value={notification.description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setNotification((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="w-full text-center">
              {data ? (
                <div className="flex justify-center gap-4">
                  <button
                    type="submit"
                    style={{ color: 'white', backgroundColor: '#61a146' }}
                    className="w-[350px] rounded-lg px-4 py-3"
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Update Alert'}
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  style={{ color: 'white', backgroundColor: '#FF5D29' }}
                  className="w-[350px] rounded-lg px-4 py-3"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Alert'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
