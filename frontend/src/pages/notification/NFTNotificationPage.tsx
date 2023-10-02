import { useNavigate } from 'react-router-dom';
import { ChangeEvent, FC, useCallback, useEffect, useState } from 'react';

import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { isValid } from '../../lib/utils';
import { Button, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import AppLayout from '../../layouts/AppLayout';
import { useAppContext } from '../../context/app';
import { createNotification, updateNotification } from '../../lib/api';

import {
  FilterNotification,
  NotificationType,
  NFTNotificationType,
  Notification,
} from '../../types/notification';

const initialValue = { address: '', name: '', network: [] };

const initialFilterValue = { dir: 'Greater than', value: 0 };

interface NFTNotificationPageProps {
  data?: Notification;
  handleEditAlert?: Function;
}

export const NFTNotificationPage: FC<NFTNotificationPageProps> = ({
  data,
  handleEditAlert,
}) => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [notification, setNotification] = useState<NFTNotificationType>(
    data ? (data as NFTNotificationType) : initialValue,
  );

  const [floor, setFloor] = useState<FilterNotification>(initialFilterValue);
  const [volume, setVolume] = useState<FilterNotification>(initialFilterValue);
  const [sales, setSales] = useState<FilterNotification>(initialFilterValue);

  useEffect(() => {
    if (!user.address) return;
    setNotification((prev) => ({ ...prev, address: user.address }));
  }, [user]);

  const handleCreateNotification = useCallback(async () => {
    if (!isValid(notification)) {
      toast.error('You must fill out all fields');
      return;
    }
    setCreating(true);
    try {
      await createNotification(NotificationType.NFT, notification);
      toast.success('Created the notification successfully');
      setCreating(false);
      setNotification(initialValue);
      setTimeout(() => navigate('/notifications'), 500);
    } catch (error) {
      toast.error('Failed to create a notification');
      setCreating(false);
      console.error(error);
    }
  }, [notification, navigate]);

  const handleUpdateNotification = useCallback(async () => {
    if (!data || !handleEditAlert) return;

    setUpdating(true);
    try {
      const updatedNotification = await updateNotification((data as any)._id, {
        ...data,
        ...notification,
      });
      toast.success('Updated the notification successfully');
      setUpdating(false);
      setTimeout(() => handleEditAlert(updatedNotification), 500);
    } catch (error) {
      toast.error('Failed to update a notification');
      setUpdating(false);
      console.error(error);
    }
  }, [notification, data, handleEditAlert]);

  return (
    <AppLayout noLayout={!!data}>
      <div className="min-w-sm m-4 max-w-5xl bg-white p-6 font-inter lg:mx-auto">
        <div className="font-sora text-2xl font-semibold lg:text-center">
          Create NFT Alert
        </div>
        <hr className="my-2"></hr>
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
              ]}
              size="large"
              mode="multiple"
              onChange={(networks) =>
                setNotification((prev) => ({ ...prev, network: [...networks] }))
              }
            />
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
          <div className="w-full lg:w-[49%]">
            <label className="text-sm text-bali-hai-600">
              Whose alerts do you want to see?
            </label>
            <Input
              placeholder="Add NFT Collection"
              style={{ fontSize: '14px' }}
              size="large"
              value={notification?.subscribeTo?.join(',')}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNotification((prev) => ({
                  ...prev,
                  subscribeTo: e.target.value.split(','),
                }))
              }
            />
          </div>
          <div className="w-full lg:w-[49%]">
            <label className="text-sm text-bali-hai-600">
              Notify when daily floor
            </label>
            <div className="flex items-center gap-[10px]">
              <Select
                placeholder="Greater than"
                style={{
                  fontSize: '14px',
                  width: '100%',
                }}
                options={[
                  { value: 'Greater than', label: 'Greater than' },
                  { value: 'Equal to', label: 'Equal to' },
                  { value: 'Greater less', label: 'Greater less' },
                ]}
                size="large"
                onChange={(value) =>
                  setFloor((prev) => ({
                    ...prev,
                    dir: value,
                  }))
                }
              />
              <span className="w-10 border p-0"> </span>
              <Input
                placeholder="Value (ETH)"
                style={{ fontSize: '14px' }}
                size="large"
                type="number"
                min={0}
                value={floor.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFloor((prev) => ({
                    ...prev,
                    value: Number(e.target.value),
                  }))
                }
              />
              <span
                className="rounded-lg bg-bali-hai-600/20 p-2"
                onClick={() => {
                  setNotification((prev) => ({
                    ...prev,
                    nftDailyFloor: [...(prev?.nftDailyFloor || []), floor],
                  }));
                  setFloor(initialFilterValue);
                }}
              >
                <Plus size={22} />
              </span>
            </div>
          </div>
          <div className="w-full lg:w-[49%]">
            <label className="text-sm text-bali-hai-600">
              Notify when daily volume
            </label>
            <div className="flex items-center gap-[10px]">
              <Select
                placeholder="Greater than"
                style={{
                  fontSize: '14px',
                  width: '100%',
                }}
                options={[
                  { value: 'Greater than', label: 'Greater than' },
                  { value: 'Equal to', label: 'Equal to' },
                  { value: 'Greater less', label: 'Greater less' },
                ]}
                size="large"
                onChange={(value) =>
                  setVolume((prev) => ({
                    ...prev,
                    dir: value,
                  }))
                }
              />
              <span className="w-10 border p-0"> </span>
              <Input
                placeholder="Value (ETH)"
                style={{ fontSize: '14px' }}
                size="large"
                type="number"
                min={0}
                value={volume.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setVolume((prev) => ({
                    ...prev,
                    value: Number(e.target.value),
                  }))
                }
              />
              <span
                className="rounded-lg bg-bali-hai-600/20 p-2"
                onClick={() => {
                  setNotification((prev) => ({
                    ...prev,
                    nftDailyVolume: [...(prev.nftDailyVolume || []), volume],
                  }));
                  setVolume(initialFilterValue);
                }}
              >
                <Plus size={22} />
              </span>
            </div>
          </div>
          <div className="w-full lg:w-[49%]">
            <label className="text-sm text-bali-hai-600">
              Notify when daily sales
            </label>
            <div className="flex items-center gap-[10px]">
              <Select
                placeholder="Greater than"
                style={{
                  fontSize: '14px',
                  width: '100%',
                }}
                options={[
                  { value: 'Greater than', label: 'Greater than' },
                  { value: 'Equal to', label: 'Equal to' },
                  { value: 'Greater less', label: 'Greater less' },
                ]}
                size="large"
                onChange={(value) =>
                  setSales((prev) => ({
                    ...prev,
                    dir: value,
                  }))
                }
              />
              <span className="w-10 border p-0"> </span>
              <Input
                placeholder="Number"
                style={{ fontSize: '14px' }}
                size="large"
                type="number"
                min={0}
                value={sales.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSales((prev) => ({
                    ...prev,
                    value: Number(e.target.value),
                  }))
                }
              />
              <span
                className="rounded-lg bg-bali-hai-600/20 p-2"
                onClick={() => {
                  setNotification((prev) => ({
                    ...prev,
                    nftDailySales: [...(prev.nftDailySales || []), floor],
                  }));
                  setSales(initialFilterValue);
                }}
              >
                <Plus size={22} />
              </span>
            </div>
          </div>
          <div className="w-full text-center">
            {data ? (
              <div className="flex justify-center gap-4">
                <Button
                  size="large"
                  type="primary"
                  style={{ color: 'white', backgroundColor: '#61a146' }}
                  className="w-[350px]"
                  onClick={handleUpdateNotification}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Alert'}
                </Button>
              </div>
            ) : (
              <Button
                size="large"
                type="primary"
                style={{ color: 'white', backgroundColor: '#FF5D29' }}
                className="w-[350px]"
                onClick={handleCreateNotification}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Alert'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
