import { ChangeEvent, useState } from 'react';

import { Input, Spin } from 'antd';
import { Box } from '@mui/material';
import Table from '@mui/material/Table';
import { NetworkType } from '../../types';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import AppLayout from '../../layouts/AppLayout';
import { SearchOutlined } from '@ant-design/icons';
import useTopNFTs from '../../lib/hooks/useTopNFTs';
import TableContainer from '@mui/material/TableContainer';
import { EmptyContainer } from '../../components/EmptyContainer';
import { ChainSelection } from '../../components/ChainSelection';

export const TopNFTs = () => {
  const [query, setQuery] = useState('');
  const [chain, setChain] = useState<NetworkType>(NetworkType.Ethereum);
  const { data: topNFTs, loading } = useTopNFTs(chain);

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
            background:
              'radial-gradient(100% 100% at 50% 100%, #FFECE6 0%, #FFFFFF 100%)',
          }}
        >
          <div className="font-sora text-[32px] font-semibold">
            Discover Top NFTs
          </div>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="font-sora text-base font-semibold">Chain</span>
            <ChainSelection
              value={chain}
              onChange={(chain) => {
                if (chain) setChain(chain.value);
              }}
            />
            <Input
              placeholder="Search wallet"
              suffix={<SearchOutlined />}
              className="w-48"
              size={'large'}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setQuery(e.target.value)
              }
            />
          </div>
        </div>
        <TableContainer className="mt-4 bg-white px-3">
          <Table sx={{ minWidth: 400, height: 600 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>
                  Collection
                </TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>
                  Floor
                </TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>
                  24h Vol
                </TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>
                  Holders
                </TableCell>
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
                  >
                    <TableCell>
                      <a
                        href={`/portfolio/nft/${chain}/${nft.address}`}
                        target="_blank"
                      >
                        {nft.name}
                      </a>
                    </TableCell>
                    <TableCell>{nft.floor}</TableCell>
                    <TableCell>{nft.change}</TableCell>
                    <TableCell>{nft.holders}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    style={{ textAlign: 'center', verticalAlign: 'middle' }}
                  >
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      height="100%"
                    >
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
