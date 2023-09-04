import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Spin } from 'antd';
import { login } from '../lib/api';
import { useAccount } from 'wagmi';
import { useAppContext } from '../context/app';
import { useWeb3Modal } from '@web3modal/react';

export const Login = () => {
  const naviate = useNavigate();
  const { open } = useWeb3Modal();
  const { setUser } = useAppContext();
  const [loading, setLoading] = useState(false);

  useAccount({
    async onConnect({ address, connector, isReconnected }) {
      if (!address) return;

      try {
        setLoading(true);
        const user = await login(address);
        setUser({ id: user._id, address });
        setLoading(false);
        setTimeout(() => naviate(`/portfolio/wallet/${address}`), 100);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    },
    onDisconnect() {
      console.log('Disconnected');
      setUser({ id: '', address: '' });
    },
  });

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      {loading ? (
        <div className="grid h-screen place-items-center">
          <Spin size="large" />
        </div>
      ) : (
        <button
          onClick={() => open()}
          className="rounded-lg bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          Connect
        </button>
      )}
    </div>
  );
};
