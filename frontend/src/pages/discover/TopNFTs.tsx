import { useState } from 'react';

import { Spin } from 'antd';
import { Box } from '@mui/material';
import Table from '@mui/material/Table';
import { NetworkType } from '../../types';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import AppLayout from '../../layouts/AppLayout';
import { API_BASE_URL } from '../../config/app';
import useTopNFTs from '../../lib/hooks/useTopNFTs';
import TableContainer from '@mui/material/TableContainer';
import DebounceSelect from '../../components/DebounceSelect';
import { EmptyContainer } from '../../components/EmptyContainer';
import { ChainSelection } from '../../components/ChainSelection';

interface TokenValue {
  label: string | React.ReactNode;
  value: string;
}

export const TopNFTs = () => {
  const [chain, setChain] = useState<NetworkType>(NetworkType.ETHEREUM);
  const { data: topNFTs, loading } = useTopNFTs(chain);

  const fetchTokenList = async (keyword: string): Promise<TokenValue[]> => {
    if (!keyword) return [];
    return fetch(`${API_BASE_URL}/nft/search-handler?network=${chain}&term=${keyword}`)
      .then((response) => response.json())
      .then((tokens) => {
        return tokens.map((token: any) => ({
          label: (
            <a href={`/portfolio/nft/${chain}/${token.address}`} className="flex items-center gap-3">
              <img
                src={token.img || `/images/tokens/empty-${chain}.png`}
                className="rounded-full"
                width={24}
                height={24}
                loading="lazy"
              />
              <div className="flex flex-col">
                <div className="truncate">{token.title}</div>
                <div className="truncate">{token.address}</div>
              </div>
            </a>
          ),
          value: token.address,
        }));
      });
  };

  if (loading) {
    return (
      <div className="grid h-screen place-items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="w-full font-inter md:mx-auto md:w-2/3">
        <div
          className="p-6 text-center"
          style={{
            background: 'radial-gradient(100% 100% at 50% 100%, #FFECE6 0%, #FFFFFF 100%)',
          }}
        >
          <div className="font-sora text-[32px] font-semibold">Discover Top NFTs</div>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="font-sora text-base font-semibold">Chain</span>
            <ChainSelection
              value={chain}
              onChange={(chain) => {
                if (chain) setChain(chain.value);
              }}
            />
            <DebounceSelect
              placeholder="Search for NFT Name or Address"
              fetchOptions={fetchTokenList}
              className="w-56"
              size="large"
            />
          </div>
        </div>
        <TableContainer className="mt-4 bg-white px-3">
          <Table sx={{ minWidth: 400, height: 600 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>Collection</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>Floor</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>24h Vol</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>Holders</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topNFTs.length > 0 ? (
                topNFTs.map((nft, id) => (
                  <TableRow
                    key={id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                    hover
                  >
                    <TableCell>
                      <a href={`/portfolio/nft/${chain}/${nft.address}`}>{nft.name}</a>
                    </TableCell>
                    <TableCell>{nft.floor}</TableCell>
                    <TableCell>{nft.volume}</TableCell>
                    <TableCell>{nft.holders}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <EmptyContainer />
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </AppLayout>
  );
};
