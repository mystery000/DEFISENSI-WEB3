import AppLayout from '../../layouts/AppLayout';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Select from 'react-select';

const topWallets = [
  {
    address: '0xBde3b2d22EA68Fa98e55b7E179BA448E9eC45dA3',
    amount: 1636077,
    ID: 3122,
    followers: 77522,
  },
  {
    address: '0xBde3b2d22EA68Fa98e55b7E179BA448E9eC45dA3',
    amount: 1636077,
    ID: 3122,
    followers: 77522,
  },
  {
    address: '0xBde3b2d22EA68Fa98e55b7E179BA448E9eC45dA3',
    amount: 1636077,
    ID: 3122,
    followers: 77522,
  },
  {
    address: '0xBde3b2d22EA68Fa98e55b7E179BA448E9eC45dA3',
    amount: 1636077,
    ID: 3122,
    followers: 77522,
  },
  {
    address: '0xBde3b2d22EA68Fa98e55b7E179BA448E9eC45dA3',
    amount: 1636077,
    ID: 3122,
    followers: 77522,
  },
  {
    address: '0xBde3b2d22EA68Fa98e55b7E179BA448E9eC45dA3',
    amount: 1636077,
    ID: 3122,
    followers: 77522,
  },
  {
    address: '0xBde3b2d22EA68Fa98e55b7E179BA448E9eC45dA3',
    amount: 1636077,
    ID: 3122,
    followers: 77522,
  },
];

const options = [
  { name: 'ethereum', label: 'ETH', logo: '../images/tokens/eth.png' },
  { name: 'polygon', label: 'POLYGON', logo: '../images/tokens/eth.png' },
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

export const WalletDiscover = () => {
  return (
    <AppLayout>
      <div className="mx-auto h-screen w-full min-w-[480px] font-inter font-semibold lg:w-2/3">
        <div
          className="w-full min-w-[480px] p-4 text-center"
          style={{
            background:
              'radial-gradient(100% 100% at 50% 100%, #FFECE6 0%, #FFFFFF 100%)',
          }}
        >
          <div className="font-sora text-[36px]">Discover Top Wallets</div>
          <div className="align-center mt-8 flex items-center justify-center gap-4">
            <span>Chain</span>
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
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 600 }}>Wallet</TableCell>
                <TableCell style={{ fontWeight: 600 }}>AUM</TableCell>
                <TableCell style={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Followers</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topWallets.map((wallet, id) => (
                <TableRow
                  key={wallet.address + id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  <TableCell>{wallet.address}</TableCell>
                  <TableCell>{wallet.amount}</TableCell>
                  <TableCell>
                    ${wallet.ID}
                    <span
                      className={id % 3 ? 'text-[#FF5D29]' : 'text-[#00D455]'}
                    >
                      {' '}
                      +2%
                    </span>
                  </TableCell>
                  <TableCell>{wallet.followers}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </AppLayout>
  );
};
