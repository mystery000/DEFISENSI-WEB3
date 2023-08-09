import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Login } from "./pages/Login";
import { Portfolio } from "./pages/Portfolio";
import { ManagedAppContext } from "./context/app";
import { Transactions } from "./pages/Transasctions";

import { Web3Modal } from "@web3modal/react";
import { mainnet, polygon, bsc } from "wagmi/chains";
import { configureChains, createConfig, WagmiConfig } from "wagmi";

import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { CLOUD_WALLETCONNECT_PROJECT_ID } from "./config/app";

const chains = [mainnet, polygon, bsc];

const projectId = CLOUD_WALLETCONNECT_PROJECT_ID;

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

function App() {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <ManagedAppContext>
          <BrowserRouter>
            <Routes>
              <Route path='/login' element={<Login />} />
              <Route path='/portfolio' element={<Portfolio />} />
              <Route path='/transactions' element={<Transactions />} />
            </Routes>
          </BrowserRouter>
        </ManagedAppContext>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}

export default App;
