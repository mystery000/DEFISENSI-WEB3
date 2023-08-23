import { Button, Checkbox, Input, Select } from 'antd';
import AppLayout from '../../layouts/AppLayout';
import TextArea from 'antd/es/input/TextArea';
import { Plus } from 'lucide-react';

export const NFTAlert = () => {
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
            />
          </div>
          <div className="w-full lg:w-[49%]">
            <label className="text-sm text-bali-hai-600">Which chains?</label>
            <Select
              placeholder="ETH"
              style={{
                fontSize: '14px',
                width: '100%',
              }}
              options={[
                { value: 'ETH', label: 'ETH' },
                { value: 'TRON', label: 'Tether USD' },
                { value: 'BTC', label: 'BTC' },
              ]}
              size="large"
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
            />
          </div>
          <div className="w-full lg:w-[49%]">
            <label className="text-sm text-bali-hai-600">
              Whose alerts do you want to see?
            </label>
            <Input
              placeholder="Add NFT collection"
              style={{ fontSize: '14px' }}
              size="large"
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
                  { value: 'ETH', label: 'ETH' },
                  { value: 'TRON', label: 'Tether USD' },
                  { value: 'BTC', label: 'BTC' },
                ]}
                size="large"
              />
              <span className="w-10 border p-0"> </span>
              <Input
                placeholder="Value (ETH)"
                style={{ fontSize: '14px' }}
                size="large"
              />
              <span className="rounded-lg bg-bali-hai-600/20 p-2">
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
                  { value: 'ETH', label: 'ETH' },
                  { value: 'TRON', label: 'Tether USD' },
                  { value: 'BTC', label: 'BTC' },
                ]}
                size="large"
              />
              <span className="w-10 border p-0"> </span>
              <Input
                placeholder="Value (ETH)"
                style={{ fontSize: '14px' }}
                size="large"
              />
              <span className="rounded-lg bg-bali-hai-600/20 p-2">
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
                  { value: 'ETH', label: 'ETH' },
                  { value: 'TRON', label: 'Tether USD' },
                  { value: 'BTC', label: 'BTC' },
                ]}
                size="large"
              />
              <span className="w-10 border p-0"> </span>
              <Input
                placeholder="Number"
                style={{ fontSize: '14px' }}
                size="large"
              />
              <span className="rounded-lg bg-bali-hai-600/20 p-2">
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
            >
              Create Alert
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
