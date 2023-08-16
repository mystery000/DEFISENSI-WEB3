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

const topNFTs = [
  {
    collection: 'CrytoPunks',
    floor: 1636077,
    _24hVol: 3122,
    holders: 77522,
  },
  {
    collection: 'CrytoPunks',
    floor: 1636077,
    _24hVol: 3122,
    holders: 77522,
  },
  {
    collection: 'CrytoPunks',
    floor: 1636077,
    _24hVol: 3122,
    holders: 77522,
  },
  {
    collection: 'CrytoPunks',
    floor: 1636077,
    _24hVol: 3122,
    holders: 77522,
  },
  {
    collection: 'CrytoPunks',
    floor: 1636077,
    _24hVol: 3122,
    holders: 77522,
  },
  {
    collection: 'CrytoPunks',
    floor: 1636077,
    _24hVol: 3122,
    holders: 77522,
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

export const NFTDiscover = () => {
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
          <div className="font-sora text-[36px]">Discover Top NFTs</div>
          <div className="align-center mt-8 flex items-center justify-center gap-4">
            <span>Chain</span>
            <Select
              defaultValue={options[0]}
              formatOptionLabel={formatOptionLabel}
              options={options}
            />
            <Input
              placeholder="Search wallet"
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
                <TableCell style={{ fontWeight: 600 }}>Collection</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Floor</TableCell>
                <TableCell style={{ fontWeight: 600 }}>24h Vol</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Holders</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topNFTs.map((nft, id) => (
                <TableRow
                  key={id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  <TableCell>{nft.collection}</TableCell>
                  <TableCell>
                    {nft.floor}
                    <span className="text-[#00D455]"> ETH</span>
                  </TableCell>
                  <TableCell>
                    ${nft._24hVol}
                    <span className="text-[#00D455]"> ETH</span>
                  </TableCell>
                  <TableCell>{nft.holders}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </AppLayout>
  );
};
