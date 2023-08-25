import { ChangeEvent, useCallback, useEffect, useState } from 'react';

import { Button, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import AppLayout from '../../layouts/AppLayout';
import {
  CreateWalletNotification,
  NotificationType,
} from '../../types/notification';
import { useAppContext } from '../../context/app';
import { isValid } from '../../lib/utils';
import { toast } from 'react-toastify';
import { createNotification } from '../../lib/api';

const initialValue = {
  address: '',
  name: '',
  description: '',
  subscribeTo: [],
  receivingFrom: [],
  sendingTo: [],
  minUsd: 0,
  maxUsd: 0,
  tokens: [],
  minTokenValue: 0,
  maxTokenValue: 0,
  network: [],
};
export const WalletNotificationPage = () => {
  const { user } = useAppContext();
  const [creating, setCreating] = useState(false);
  const [notification, setNotification] =
    useState<CreateWalletNotification>(initialValue);

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
      const newNotification = await createNotification(
        NotificationType.WALLET,
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
      <div className="min-w-sm m-4 max-w-5xl bg-white p-4 font-inter lg:mx-auto">
        <div className="font-sora text-2xl font-semibold lg:text-center">
          Create Wallet Alert
        </div>
        <hr className="my-2"></hr>
        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row">
          <div className="w-full lg:w-[49%]">
            <label className="text-sm text-bali-hai-600">Alert name</label>
            <Input
              placeholder="Alert name"
              style={{ fontSize: '14px' }}
              size="large"
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
          <div className="w-full lg:w-[49%]">
            <label className="text-sm text-bali-hai-600">
              Whose alerts do you want to see?
            </label>
            <Input
              placeholder="Add addresses"
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
            <label className="text-sm text-bali-hai-600">Receiving from?</label>
            <Input
              placeholder="Add addresses"
              style={{ fontSize: '14px' }}
              size="large"
              value={notification.receivingFrom.join(',')}
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
              value={notification.sendingTo.join(',')}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNotification((prev) => ({
                  ...prev,
                  sendingTo: e.target.value.split(','),
                }))
              }
            />
          </div>
          <div className="w-full lg:w-[49%]">
            <label className="text-sm text-bali-hai-600">What USD Value?</label>
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
              value={notification.tokens.join(',')}
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
          </div>
        </div>
      </div>
    </AppLayout>
  );
};