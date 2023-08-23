import { Button, Input, Select } from 'antd';
import AppLayout from '../../layouts/AppLayout';
import TextArea from 'antd/es/input/TextArea';

export const WalletAlert = () => {
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
          <div className="w-full lg:w-[49%]">
            <label className="text-sm text-bali-hai-600">
              Whose alerts do you want to see?
            </label>
            <Input
              placeholder="Add addresses"
              style={{ fontSize: '14px' }}
              size="large"
            />
          </div>
          <div className="w-full lg:w-[49%]">
            <label className="text-sm text-bali-hai-600">Receiving from?</label>
            <Input
              placeholder="Add addresses"
              style={{ fontSize: '14px' }}
              size="large"
            />
          </div>
          <div className="w-full lg:w-[49%]">
            <label className="text-sm text-bali-hai-600">Sending to?</label>
            <Input
              placeholder="Add addresses"
              style={{ fontSize: '14px' }}
              size="large"
            />
          </div>
          <div className="w-full lg:w-[49%]">
            <label className="text-sm text-bali-hai-600">What USD Value?</label>
            <div className="flex items-center gap-[10px]">
              <Input
                placeholder="Min value"
                style={{ fontSize: '14px' }}
                size="large"
              />
              <span className="w-10 border p-0"> </span>
              <Input
                placeholder="Max value"
                style={{ fontSize: '14px' }}
                size="large"
              />
            </div>
          </div>
          <div className="w-full lg:w-[49%]">
            <label className="text-sm text-bali-hai-600">Which tokens?</label>
            <Input
              placeholder="Alert name"
              style={{ fontSize: '14px' }}
              size="large"
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
              />
              <span className="w-10 border p-0"> </span>
              <Input
                placeholder="Max value"
                style={{ fontSize: '14px' }}
                size="large"
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
            />
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
