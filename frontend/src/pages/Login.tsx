import { useWeb3Modal } from '@web3modal/react';
import { useAccount, useNetwork } from 'wagmi';
import { useAppContext } from '../context/app';
import { login } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const Login = () => {
  const naviate = useNavigate();
  const { open } = useWeb3Modal();
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAppContext();
  // const { chain, chains } = useNetwork();

  const account = useAccount({
    async onConnect({ address, connector, isReconnected }) {
      // console.log("Connected", { address, connector, isReconnected });
      // console.log(`Connected to ${chain?.name}`);

      if (!address) return;

      try {
        setLoading(true);
        const user = await login(address);
        setUser({ id: user._id, address });
        setLoading(false);
        naviate('/portfolio/wallet');
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
        <div className="text-center">Loading...</div>
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
