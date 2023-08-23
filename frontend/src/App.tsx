import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

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
import { TopWallets } from './pages/discover/TopWallets';
import { TopTokens } from './pages/discover/TopTokens';
import { TopNFTs } from './pages/discover/TopNFTs';
import { PageNotFound } from './pages/PageNotFound';
import { NFTPortfolio } from './pages/portfolio/NFTPortfolio';
import { WalletAlert } from './pages/alert/WalletAlert';
import { TokenAlert } from './pages/alert/TokenAlert';
import { NFTAlert } from './pages/alert/NFTAlert';
import { Notifications } from './pages/Notifications';

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
              <Route path="/" element={<Transactions />} />
              <Route path="/login" element={<Login />} />
              <Route element={<PrivateRoute />}>
                <Route path="/transactions" element={<Transactions />} />
                <Route
                  path="/portfolio/wallet/:address"
                  element={<WalletPortfolio />}
                />
                <Route
                  path="/portfolio/token/:network/:address"
                  element={<TokenPortfolio />}
                />
                <Route
                  path="/portfolio/nft/:network/:address"
                  element={<NFTPortfolio />}
                />
                <Route path="/discover/wallet" element={<TopWallets />} />
                <Route path="/discover/token" element={<TopTokens />} />
                <Route path="/discover/nft" element={<TopNFTs />} />
                <Route path="/alert/wallet/create" element={<WalletAlert />} />
                <Route path="/alert/token/create" element={<TokenAlert />} />
                <Route path="/alert/nft/create" element={<NFTAlert />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
              <Route path="/404" element={<PageNotFound />} />
              <Route path="*" element={<Navigate to="/404" />} />
            </Routes>
          </BrowserRouter>
        </ManagedAppContext>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}

export default App;
