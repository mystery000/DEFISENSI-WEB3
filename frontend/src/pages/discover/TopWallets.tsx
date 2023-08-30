import Select from 'react-select';
import { Input, Spin } from 'antd';
import { Box } from '@mui/material';
import Table from '@mui/material/Table';
import { convertHex } from '../../lib/utils';
import TableRow from '@mui/material/TableRow';
import AppLayout from '../../layouts/AppLayout';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import { SearchOutlined } from '@ant-design/icons';
import TableContainer from '@mui/material/TableContainer';
import useTopWallets from '../../lib/hooks/useTopWallets';
import { EmptyContainer } from '../../components/EmptyContainer';

const options = [
  {
    value: 'ethereum',
    name: 'ethereum',
    label: 'ETH',
    logo: '../images/tokens/eth.png',
  },
  {
    value: 'polygon',
    name: 'polygon',
    label: 'POLYGON',
    logo: '../images/tokens/eth.png',
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
    <img src={logo} width={24} height={24} alt="noLogo" />
    <div>{label}</div>
  </div>
);

export const TopWallets = () => {
  const { data: topWallets, loading } = useTopWallets();

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
            Discover Top Wallets
          </div>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="font-sora text-base font-semibold">Chain</span>
            <Select
              defaultValue={options[0]}
              formatOptionLabel={formatOptionLabel}
              options={options}
            />
            <Input
              placeholder="Search Wallet"
              suffix={<SearchOutlined />}
              className="w-48"
              size={'large'}
            />
          </div>
        </div>
        <TableContainer className="mt-4 bg-white px-3">
          <Table sx={{ minWidth: 400, height: 600 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>
                  Wallet
                </TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>
                  AUM
                </TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>
                  1D
                </TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>
                  Followers
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topWallets.length > 0 ? (
                topWallets.map((wallet, id) => (
                  <TableRow
                    key={wallet.address + id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell>
                      {convertHex(wallet.address).slice(0, 6)}
                    </TableCell>
                    <TableCell>
                      {Number(wallet.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      ${wallet.price_usd}
                      {Number(wallet.price_24h_percent_change) < 0 ? (
                        <span className="text-orange-400">
                          -
                          {Number(
                            wallet.price_24h_percent_change,
                          ).toLocaleString()}
                          %
                        </span>
                      ) : (
                        <span className="text-malachite-500">
                          +{Number(wallet.price_24h_percent_change)}%
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{wallet.followers}</TableCell>
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
