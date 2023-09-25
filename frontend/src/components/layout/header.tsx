import { useNavigate } from 'react-router-dom';

import { Dropdown } from 'antd';
import { useDisconnect } from 'wagmi';
import { AlignJustifyIcon } from 'lucide-react';
import { useAppContext } from '../../context/app';

import {
  MailOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useCallback } from 'react';

const Header = () => {
  const navigate = useNavigate();
  const { disconnect } = useDisconnect();
  const { user, setUser } = useAppContext();

  const logout = useCallback(() => {
    disconnect();
    setUser({ address: '', id: '' });
  }, [setUser]);

  const items = [
    {
      label: (
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => navigate('/transactions')}
        >
          <MailOutlined />
          <span>Transactions</span>
        </div>
      ),
      icon: <MailOutlined />,
      key: 'transactions',
    },
    {
      label: (
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => navigate(`/portfolio/wallet/${user.address}`)}
        >
          <MailOutlined />
          <span>Portfolio</span>
        </div>
      ),
      key: 'portfolio',
      icon: <MailOutlined />,
    },
    {
      type: 'group',
      label: (
        <div className="flex cursor-pointer items-center gap-2">
          <MailOutlined />
          <span>Discover</span>
        </div>
      ),
      key: 'Discover',
      icon: <MailOutlined />,
      children: [
        {
          label: (
            <div
              className="flex cursor-pointer items-center gap-2"
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
              className="flex cursor-pointer items-center gap-2"
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
              className="flex cursor-pointer items-center gap-2"
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
    {
      label: (
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => navigate('/notifications')}
        >
          <MailOutlined />
          <span>Notifications</span>
        </div>
      ),
      icon: <MailOutlined />,
      key: 'notifications',
    },
    {
      label: (
        <div className="flex cursor-pointer items-center gap-2">
          <UserOutlined />
          <span title={user.address}>{user.address.slice(0, 5)}</span>
        </div>
      ),
      key: 'User',
      type: 'group',
      address: user.address,
      icon: <UserOutlined />,
      children: [
        !user.address
          ? {
              label: (
                <div
                  className="flex cursor-pointer items-center gap-2"
                  onClick={() => navigate('/login')}
                >
                  <LoginOutlined />
                  <span>Login</span>
                </div>
              ),
              key: 'login',
            }
          : {
              label: (
                <div
                  className="flex cursor-pointer items-center gap-2"
                  onClick={logout}
                >
                  <LogoutOutlined />
                  <span>Logout</span>
                </div>
              ),
              key: 'logout',
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
        {items.map((item) => {
          if (item.children) {
            return (
              <div
                key={item.key}
                className="flex cursor-pointer items-center gap-2"
              >
                {item.icon}
                <Dropdown menu={{ items: item.children }} placement="bottom">
                  {item.key === 'User' ? (
                    <span title={item.address}>
                      {item.address?.slice(0, 5)}
                    </span>
                  ) : (
                    <span>{item.key}</span>
                  )}
                </Dropdown>
              </div>
            );
          }
          return <div key={item.key}>{item.label}</div>;
        })}
      </div>

      <Dropdown
        menu={{ items }}
        placement="bottom"
        className="block cursor-pointer md:hidden"
        arrow={false}
      >
        <AlignJustifyIcon />
      </Dropdown>
    </div>
  );
};

export default Header;
