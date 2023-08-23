import { Button } from 'antd';
import AppLayout from '../layouts/AppLayout';
import { Mail, Send } from 'lucide-react';

export const Notifications = () => {
  return (
    <AppLayout>
      <div className="w-full font-inter xl:mx-auto xl:w-2/3">
        <div
          className="flex flex-col p-6 text-center xl:flex-row xl:justify-between"
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
        <div className="flex">
          <span>Your alerts</span>
          <Button
            size="large"
            type="primary"
            style={{ color: 'white', backgroundColor: '#FF5D29' }}
          >
            + Add Alert
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};
