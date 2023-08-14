import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Login } from './pages/Login';
import { ManagedAppContext } from './context/app';
import { Transactions } from './pages/Transasctions';

import { Web3Modal } from '@web3modal/react';
import { mainnet, polygon, bsc } from 'wagmi/chains';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';

import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from '@web3modal/ethereum';

import { CLOUD_WALLETCONNECT_PROJECT_ID } from './config/app';
import { PrivateRoute } from './routes/PrivateRoute';
import { TokenPortfolio } from './pages/portfolio/TokenPortfolio';
import { WalletPortfolio } from './pages/portfolio/WalletPortfolio';

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
              <Route path="/login" element={<Login />} />
              <Route element={<PrivateRoute />}>
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/portfolio/wallet" element={<WalletPortfolio />} />
                <Route path="/portfolio/token" element={<TokenPortfolio />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ManagedAppContext>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}

export default App;
