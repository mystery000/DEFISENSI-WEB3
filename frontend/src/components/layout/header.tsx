import { useNavigate } from 'react-router-dom';

import { Dropdown } from 'antd';
import { AlignJustifyIcon } from 'lucide-react';
import { MailOutlined } from '@ant-design/icons';
import { useAppContext } from '../../context/app';

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();

  const items = [
    {
      label: (
        <div
          className="flex items-center gap-2"
          onClick={() => navigate('/transactions')}
        >
          <MailOutlined />
          <span>Transactions</span>
        </div>
      ),
      key: 'transactions',
    },
    {
      label: (
        <div
          className="flex items-center gap-2"
          onClick={() => navigate(`/portfolio/wallet/${user.address}`)}
        >
          <MailOutlined />
          <span>Portfolio</span>
        </div>
      ),
      key: 'portfolio',
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <MailOutlined />
          <span>Discover</span>
        </div>
      ),
      key: 'discover',
      children: [
        {
          label: (
            <div
              className="flex items-center gap-2"
              onClick={() => navigate('/discover/wallet')}
            >
              <MailOutlined />
              <span>Top Wallets</span>
            </div>
          ),
          key: 'wallet',
        },
        {
          label: (
            <div
              className="flex items-center gap-2"
              onClick={() => navigate('/discover/token')}
            >
              <MailOutlined />
              <span>Top tokens</span>
            </div>
          ),
          key: 'token',
        },
        {
          label: (
            <div
              className="flex items-center gap-2"
              onClick={() => navigate('/discover/nft')}
            >
              <MailOutlined />
              <span>Top NFTs</span>
            </div>
          ),
          key: 'nft',
        },
      ],
    },
  ];

  return (
    <div className="sticky flex w-full items-center justify-between px-5 py-[15px] shadow-[0px_5px_4px_-3px_#8E98B066]">
      <span className="font-sora text-[40px] font-light leading-[48px]">
        <span className="font-extrabold">Defi</span>Sensi
      </span>

      <div className="flex hidden gap-4 md:flex">
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => navigate('/transactions')}
        >
          <MailOutlined />
          <span>Transactions</span>
        </div>
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => navigate(`/portfolio/wallet/${user.address}`)}
        >
          <MailOutlined />
          <span>Portfolio</span>
        </div>
        <div className="flex cursor-pointer items-center gap-2">
          <MailOutlined />
          <Dropdown
            menu={{
              items: items.find((item) => item.key === 'discover')?.children,
            }}
            placement="bottom"
          >
            <span>Discover</span>
          </Dropdown>
        </div>
      </div>

      <Dropdown menu={{ items }} placement="bottom" className="block md:hidden">
        <AlignJustifyIcon />
      </Dropdown>
    </div>
  );
};

export default Header;
