import AppLayout from '../../layouts/AppLayout';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import { Input, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Select from 'react-select';
import useTopTokens from '../../lib/hooks/useTopTokens';
import { EmptyContainer } from '../../components/EmptyContainer';

const topTokens = [] as any[];

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

export const TopTokens = () => {
  // const { data: topERC20Tokens, loading } = useTopTokens();

  // if (loading) {
  //   return (
  //     <div className="grid h-screen place-items-center">
  //       <Spin size="large" />
  //     </div>
  //   );
  // }

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
            />
            <Input
              placeholder="Search Token"
              suffix={<SearchOutlined />}
              className="w-48"
              size={'large'}
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
              {/* {topTokens.map((token, id) => (
                <TableRow
                  key={id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  <TableCell>{token.tokenName}</TableCell>
                  <TableCell>{token.price}</TableCell>
                  <TableCell>
                    ${token.change}
                    <span
                      className={id % 3 ? 'text-[#FF5D29]' : 'text-[#00D455]'}
                    >
                      {' '}
                      +2%
                    </span>
                  </TableCell>
                  <TableCell>{token.followers}</TableCell>
                </TableRow>
              ))} */}
              <TableRow style={{ columnSpan: 'all', textAlign: 'center' }}>
                <EmptyContainer />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </AppLayout>
  );
};
