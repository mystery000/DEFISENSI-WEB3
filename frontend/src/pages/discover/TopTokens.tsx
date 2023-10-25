import { useState } from 'react';

import { Image, Spin } from 'antd';
import { Box } from '@mui/material';
import Table from '@mui/material/Table';
import { NetworkType } from '../../types';
import TableRow from '@mui/material/TableRow';
import AppLayout from '../../layouts/AppLayout';
import { API_BASE_URL } from '../../config/app';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import useTopTokens from '../../lib/hooks/useTopTokens';
import TableContainer from '@mui/material/TableContainer';
import DebounceSelect from '../../components/DebounceSelect';
import { EmptyContainer } from '../../components/EmptyContainer';
import { ChainSelection } from '../../components/ChainSelection';

interface TokenValue {
  label: string | React.ReactNode;
  value: string;
}

export const TopTokens = () => {
  const [chain, setChain] = useState<NetworkType>(NetworkType.ETHEREUM);
  const { data: topERC20Tokens, loading } = useTopTokens(chain);

  const fetchTokenList = async (keyword: string): Promise<TokenValue[]> => {
    if (!keyword) return [];
    return fetch(`${API_BASE_URL}/token/search-handler?network=${chain}&term=${keyword}`)
      .then((response) => response.json())
      .then((tokens) => {
        return tokens.map((token: any) => ({
          label: (
            <a href={`/portfolio/token/${chain}/${token.address}`} className="flex items-center gap-3">
              <Image
                src={token.img}
                fallback={`/images/tokens/default/empty-${chain}.png`}
                alt="#"
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
          <div className="font-sora text-[32px] font-semibold">Discover Top Tokens</div>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="font-sora text-base font-semibold">Chain</span>
            <ChainSelection
              value={chain}
              onChange={(chain) => {
                if (chain) setChain(chain.value);
              }}
            />
            <DebounceSelect
              placeholder="Search for Token Name or Address"
              fetchOptions={fetchTokenList}
              className="w-56"
              size="large"
            />
          </div>
        </div>
        <TableContainer className="mt-4 bg-white px-3 ">
          <Table sx={{ minWidth: 400, height: 600 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>Token</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>Price</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>Change</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>Followers</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topERC20Tokens.length ? (
                topERC20Tokens.map((token, id) => (
                  <TableRow
                    key={id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                    hover
                  >
                    <TableCell>
                      <a href={`/portfolio/token/${chain}/${token.address}`}>{token.name}</a>
                    </TableCell>
                    <TableCell>{token.price}</TableCell>
                    <TableCell>{token.change}</TableCell>
                    <TableCell>{token.followers || 0}</TableCell>
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
