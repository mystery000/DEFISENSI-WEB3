import { ChangeEvent, useState } from 'react';
import Select from 'react-select';
import { Input, Spin } from 'antd';
import { Box } from '@mui/material';
import Table from '@mui/material/Table';
import { NetworkType } from '../../types';
import TableRow from '@mui/material/TableRow';
import AppLayout from '../../layouts/AppLayout';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import { SearchOutlined } from '@ant-design/icons';
import useTopTokens from '../../lib/hooks/useTopTokens';
import TableContainer from '@mui/material/TableContainer';
import { EmptyContainer } from '../../components/EmptyContainer';

const options = [
  {
    value: NetworkType.Ethereum,
    name: 'ethereum',
    label: 'ETH',
    logo: '../images/network/ethereum.png',
  },
  {
    value: NetworkType.Polygon,
    name: 'polygon',
    label: 'POLYGON',
    logo: '../images/network/polygon.png',
  },
  {
    value: NetworkType.BSC,
    name: 'bsc',
    label: 'BSC',
    logo: '../images/network/binance.png',
  },
];

const formatOptionLabel = ({
  label,
  logo,
}: {
  label: string;
  logo: string;
}) => (
  <div className="flex items-center gap-2">
    <img
      src={logo}
      width={24}
      height={24}
      alt="noLogo"
      className="rounded-full"
      loading="lazy"
    />
    <div>{label}</div>
  </div>
);

export const TopTokens = () => {
  const { data: topERC20Tokens, loading } = useTopTokens();
  const [query, setQuery] = useState('');
  const [chain, setChain] = useState<NetworkType>(NetworkType.Ethereum);

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
            Discover Top Tokens
          </div>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="font-sora text-base font-semibold">Chain</span>
            <Select
              defaultValue={options[0]}
              formatOptionLabel={formatOptionLabel}
              options={options}
              onChange={(chain) => {
                if (chain) setChain(chain.value);
              }}
            />
            <Input
              placeholder="Search Token"
              suffix={<SearchOutlined />}
              className="w-48"
              size={'large'}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setQuery(e.target.value)
              }
            />
          </div>
        </div>
        <TableContainer className="mt-4 bg-white px-3 ">
          <Table sx={{ minWidth: 400, height: 600 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>
                  Token
                </TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>
                  Price
                </TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>
                  Change
                </TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>
                  Followers
                </TableCell>
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
                  >
                    <TableCell>{token.token_name}</TableCell>
                    <TableCell>${token.price_usd}</TableCell>
                    <TableCell>
                      {Math.abs(Number(token.price_24h_percent_change))}%
                      {Number(token.price_24h_percent_change) > 0 ? (
                        <span className="text-malachite-500">+</span>
                      ) : (
                        <span className="text-orange-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{token.followers}</TableCell>
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
