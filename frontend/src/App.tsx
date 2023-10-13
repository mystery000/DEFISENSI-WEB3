import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Login } from './pages/Login';
import { Web3Modal } from '@web3modal/react';
import { ToastContainer } from 'react-toastify';
import { ManagedAppContext } from './context/app';
import { TopNFTs } from './pages/discover/TopNFTs';
import { PageNotFound } from './pages/PageNotFound';
import { mainnet, polygon, bsc } from 'wagmi/chains';
import { Transactions } from './pages/Transasctions';
import { PrivateRoute } from './routes/PrivateRoute';
import { Notifications } from './pages/Notifications';
import { TopTokens } from './pages/discover/TopTokens';
import { TopWallets } from './pages/discover/TopWallets';
import { CLOUD_WALLETCONNECT_PROJECT_ID } from './config/app';
import { NFTPortfolio } from './pages/portfolio/NFTPortfolio';
import { TokenPortfolio } from './pages/portfolio/TokenPortfolio';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { WalletPortfolio } from './pages/portfolio/WalletPortfolio';

import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';

import 'react-toastify/dist/ReactToastify.css';
import { EntryRoute } from './routes/EntryRoute';
import { NFTNotificationPage } from './pages/notification/NFTNotificationPage';
import { TokenNotificationPage } from './pages/notification/TokenNotificationPage';
import { WalletNotificationPage } from './pages/notification/WalletNotificationPage';

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
    <div>
      <WagmiConfig config={wagmiConfig}>
        <ManagedAppContext>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<EntryRoute />} />
              <Route path="/login" element={<Login />} />
              <Route element={<PrivateRoute />}>
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/portfolio/wallet/:address" element={<WalletPortfolio />} />
                <Route path="/portfolio/token/:network/:address" element={<TokenPortfolio />} />
                <Route path="/portfolio/nft/:network/:address" element={<NFTPortfolio />} />
                <Route path="/discover/nfts" element={<TopNFTs />} />
                <Route path="/discover/tokens" element={<TopTokens />} />
                <Route path="/discover/wallets" element={<TopWallets />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/notification/nft/create" element={<NFTNotificationPage />} />
                <Route path="/notification/token/create" element={<TokenNotificationPage />} />
                <Route path="/notification/wallet/create" element={<WalletNotificationPage />} />
              </Route>
              <Route path="/404" element={<PageNotFound />} />
              <Route path="*" element={<Navigate to="/404" />} />
            </Routes>
          </BrowserRouter>
        </ManagedAppContext>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
