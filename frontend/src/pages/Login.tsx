import { useWeb3Modal } from "@web3modal/react";
import { useAccount, useNetwork } from "wagmi";
import { useAppContext } from "../context/app";

export const Login = () => {
  // const { chain, chains } = useNetwork();
  const { open } = useWeb3Modal();

  const { user, setUser } = useAppContext();

  const account = useAccount({
    onConnect({ address, connector, isReconnected }) {
      // console.log("Connected", { address, connector, isReconnected });
      // console.log(`Connected to ${chain?.name}`);
      if (address) setUser({ address });
    },
    onDisconnect() {
      console.log("Disconnected");
      setUser({ address: "" });
    },
  });

  return (
    <div className='flex flex-col items-center justify-center h-screen '>
      <div className='text-center font-bold'>{user.address}</div>
      <button
        onClick={() => open()}
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg'
      >
        Connect
      </button>
    </div>
  );
};
