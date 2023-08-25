import { ChangeEvent, useCallback, useEffect, useState } from 'react';

import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { isValid } from '../../lib/utils';
import { Button, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import AppLayout from '../../layouts/AppLayout';
import { useAppContext } from '../../context/app';
import { createNotification } from '../../lib/api';

import {
  CreateNFTNotification,
  FilterNotification,
  NotificationType,
} from '../../types/notification';

const initialValue = {
  address: '',
  name: '',
  description: '',
  subscribeTo: [],
  nftDailyFloor: [],
  nftDailyVolume: [],
  nftDailySales: [],
  network: [],
};

const initialFilterValue = {
  dir: 'Greater than',
  value: 0,
};

export const NFTNotificationPage = () => {
  const { user } = useAppContext();
  const [creating, setCreating] = useState(false);
  const [notification, setNotification] =
    useState<CreateNFTNotification>(initialValue);

  const [floor, setFloor] = useState<FilterNotification>(initialFilterValue);
  const [volume, setVolume] = useState<FilterNotification>(initialFilterValue);
  const [sales, setSales] = useState<FilterNotification>(initialFilterValue);

  useEffect(() => {
    if (!user.address) return;
    setNotification((prev) => ({ ...prev, address: user.address }));
  }, [user]);

  const handleCreateTokenNotification = useCallback(async () => {
    if (!isValid(notification)) {
      toast.error('You must fill out all fields');
      return;
    }
    setCreating(true);
    try {
      const newNotification = await createNotification(
        NotificationType.NFT,
        notification,
      );
      toast.success('Created the notification successfully');
      setCreating(false);
      setNotification(initialValue);
    } catch (error) {
      toast.error('Failed to create a notification');
      setCreating(false);
      console.error(error);
    }
  }, [notification]);

  return (
    <AppLayout>
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
              value={notification.subscribeTo.join(',')}
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
                    nftDailyFloor: [...prev.nftDailyFloor, floor],
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
                    nftDailyVolume: [...prev.nftDailyVolume, volume],
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
                    nftDailySales: [...prev.nftDailySales, floor],
                  }));
                  setSales(initialFilterValue);
                }}
              >
                <Plus size={22} />
              </span>
            </div>
          </div>
          <div className="w-full text-center">
            <Button
              size="large"
              type="primary"
              style={{ color: 'white', backgroundColor: '#FF5D29' }}
              className="w-[350px]"
              onClick={handleCreateTokenNotification}
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Alert'}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
