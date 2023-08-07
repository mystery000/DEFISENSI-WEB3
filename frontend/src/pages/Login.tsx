import { useWeb3Modal } from "@web3modal/react";
import { useAccount, useNetwork, useEnsName } from "wagmi";

export const Login = () => {
  const { chain, chains } = useNetwork();
  const { open, close } = useWeb3Modal();

  const account = useAccount({
    onConnect({ address, connector, isReconnected }) {
      console.log("Connected", { address, connector, isReconnected });
      console.log(`Connected to ${chain?.name}`);
    },
    onDisconnect() {
      console.log("Disconnected");
    },
  });

  return (
    <div className='flex items-center justify-center h-screen'>
      <button
        onClick={() => open()}
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg'
      >
        Connect
      </button>
    </div>
  );
};
