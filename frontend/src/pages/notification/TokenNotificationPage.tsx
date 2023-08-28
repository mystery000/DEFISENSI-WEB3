import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { isValid } from '../../lib/utils';
import TextArea from 'antd/es/input/TextArea';
import AppLayout from '../../layouts/AppLayout';
import { useAppContext } from '../../context/app';
import { createNotification } from '../../lib/api';
import { Button, Checkbox, Input, Select } from 'antd';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import {
  TokenNotificationType,
  FilterNotification,
  NotificationType,
} from '../../types/notification';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

const initialValue = {
  address: '',
  name: '',
  description: '',
  subscribeTo: [],
  minUsd: 0,
  maxUsd: 0,
  tokens: [],
  changePercent: '',
  changePercentDir: '',
  tokenFilter: [],
  network: [],
};

const initialFilterValue = {
  dir: '',
  value: 0,
};

export const TokenNotificationPage = () => {
  const { user } = useAppContext();
  const [creating, setCreating] = useState(false);
  const [notification, setNotification] =
    useState<TokenNotificationType>(initialValue);

  const [filter, setFilter] = useState<FilterNotification>(initialFilterValue);

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
        NotificationType.TOKEN,
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
          Create Token Alert
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
            <label className="text-sm text-bali-hai-600">What % Change?</label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="% Above"
                style={{ fontSize: '14px' }}
                size="large"
                type="number"
                min={0}
                max={100}
                value={notification?.changePercent}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNotification((prev) => ({
                    ...prev,
                    changePercent: e.target.value,
                  }))
                }
              />
              <Checkbox
                className="rounded-lg border border-bali-hai-600/40 py-1.5 pl-4 pr-2 text-bali-hai-600"
                value={'up'}
                checked={notification.changePercentDir === 'up'}
                onChange={(e: CheckboxChangeEvent) =>
                  setNotification((prev) => ({
                    ...prev,
                    changePercentDir: e.target.checked ? e.target.value : '',
                  }))
                }
              >
                Up
              </Checkbox>
              <Checkbox
                className="rounded-lg border border-bali-hai-600/40 py-1.5 pl-4 pr-2 text-bali-hai-600"
                value={'down'}
                checked={notification.changePercentDir === 'down'}
                onChange={(e: CheckboxChangeEvent) =>
                  setNotification((prev) => ({
                    ...prev,
                    changePercentDir: e.target.checked ? e.target.value : '',
                  }))
                }
              >
                Down
              </Checkbox>
            </div>
          </div>
          <div className="w-full lg:w-[49%]">
            <label className="text-sm text-bali-hai-600">
              What token Value?
            </label>
            <div className="flex items-center gap-[10px]">
              <Select
                placeholder="Above"
                style={{
                  fontSize: '14px',
                  width: '100%',
                }}
                options={[
                  { value: 'ETH', label: 'ETH' },
                  { value: 'TRON', label: 'Tether USD' },
                ]}
                size="large"
                onChange={(network) =>
                  setFilter((prev) => ({
                    ...prev,
                    dir: network,
                  }))
                }
              />
              <span className="w-10 border p-0"> </span>
              <Input
                placeholder="Value (USD)"
                style={{ fontSize: '14px' }}
                size="large"
                min={0}
                value={filter.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFilter((prev) => ({
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
                    tokenFilter: [...prev.tokenFilter, filter],
                  }));
                  setFilter(initialFilterValue);
                }}
              >
                <Plus size={22} />
              </span>
            </div>
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
