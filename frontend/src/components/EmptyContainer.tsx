import { FC } from 'react';
import { Empty } from 'antd';

type EmptyContainerProps = {
  descirption?: string;
};
export const EmptyContainer: FC<EmptyContainerProps> = ({ descirption }) => {
  return (
    <div className="w-[392px] rounded-md border border-bali-hai-200 p-4 text-center">
      <Empty description={descirption || 'No data'} />
    </div>
  );
};
