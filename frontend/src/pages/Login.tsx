import { useWeb3Modal } from '@web3modal/react';
import { useAccount, useNetwork } from 'wagmi';
import { useAppContext } from '../context/app';
import { findUserByAddress } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const naviate = useNavigate();
  const { open } = useWeb3Modal();
  const { user, setUser } = useAppContext();
  // const { chain, chains } = useNetwork();

  const account = useAccount({
    async onConnect({ address, connector, isReconnected }) {
      // console.log("Connected", { address, connector, isReconnected });
      // console.log(`Connected to ${chain?.name}`);

      if (!address) return;

      try {
        const user = await findUserByAddress(address);
        setUser({ id: user._id, address });
        naviate('/transactions');
      } catch (error) {
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
      <button
        onClick={() => open()}
        className="rounded-lg bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        Connect
      </button>
    </div>
  );
};
