import { FC } from 'react';
import cn from 'classnames';
import { Empty } from 'antd';

type EmptyContainerProps = {
  descirption?: string;
  border?: boolean;
};

export const EmptyContainer: FC<EmptyContainerProps> = ({
  descirption,
  border,
}) => {
  return (
    <div
      className={cn('w-[392px] rounded-md  p-4 text-center', {
        'border border-bali-hai-200': border,
      })}
    >
      <Empty description={descirption || 'No data'} />
    </div>
  );
};
