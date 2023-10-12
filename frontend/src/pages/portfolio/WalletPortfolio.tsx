import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';

import AppLayout from '../../layouts/AppLayout';
import NotificationsIcon from '@mui/icons-material/Notifications';

import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import InfiniteScroll from 'react-infinite-scroll-component';

import { followWallet, findWalletTransactions } from '../../lib/api';

import cn from 'classnames';
import moment from 'moment';
import * as Antd from 'antd';
import { Box } from '@mui/material';
import { toast } from 'react-toastify';
import { NetworkType } from '../../types';
import { keyFormatter } from '../../lib/utils';
import { useAppContext } from '../../context/app';
import { ChainSelection } from '../../components/ChainSelection';
import { EmptyContainer } from '../../components/EmptyContainer';
import useWalletPortfolio from '../../lib/hooks/useWalletPortfolio';
import { TransactionCard } from '../../components/transactions/TransactionCard';
import { Area, AreaChart, CartesianGrid, Cross, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FollowerIcon, FollowingIcon, NotificationOnIcon } from '../../components/icons/defisensi-icons';

enum ContentType {
  PORTFOLIO = 'portfolio',
  TRANSACTIONS = 'transactions',
  ALL = 'all',
}

export const WalletPortfolio = () => {
  const { address } = useParams();
  const { user } = useAppContext();
  const [fetchMore, setFetchMore] = useState(false);
  const [following, setFollowing] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const [notificationOn, setNotificationOn] = useState(false);
  const [chain, setChain] = useState<NetworkType>(NetworkType.ETHEREUM);
  const [selected, setSelected] = useState<ContentType>(ContentType.PORTFOLIO);

  const { data: portfolio, loading, mutate: mutatePortfolio } = useWalletPortfolio(chain);

  // Responsive Design
  useEffect(() => {
    const breakpoint = 1536;
    window.innerWidth >= breakpoint ? setSelected(ContentType.ALL) : setSelected(ContentType.PORTFOLIO);
    const handleWindowResize = () => {
      if (width < breakpoint && window.innerWidth >= breakpoint) {
        setSelected(ContentType.ALL);
      } else if (width >= breakpoint && window.innerWidth < breakpoint) {
        setSelected(ContentType.PORTFOLIO);
      }
      setWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [width]);

  const fetchMoreTransactions = useCallback(async () => {}, []);

  const handleFollow = useCallback(async () => {
    if (!address || !user) return;
    try {
      setFollowing(true);
      await followWallet(user.address, address);
      mutatePortfolio({
        ...portfolio,
        followers: [...portfolio.followers, user.id],
      });
      setFollowing(false);
      toast.success(`You've followed this wallet ${address}`);
    } catch (error) {
      setFollowing(false);
      toast.error((error as any).message);
    }
  }, [address, user, portfolio, mutatePortfolio]);

  if (loading) {
    return (
      <div className="grid h-screen place-items-center">
        <Antd.Spin size="large" />
      </div>
    );
  }
  const rawdata = [
    {
      timestamp: '2023-10-12T15:35:37.625Z',
      total_quote: '1905000158.223907',
      pretty_total_quote: '$1,905,000,158.224',
    },
    {
      timestamp: '2023-10-11T15:35:37.625Z',
      total_quote: '1932327659.3761263',
      pretty_total_quote: '$1,932,327,659.376',
    },
    {
      timestamp: '2023-10-10T15:35:37.625Z',
      total_quote: '1935341759.5357087',
      pretty_total_quote: '$1,935,341,759.536',
    },
    {
      timestamp: '2023-10-09T15:35:37.625Z',
      total_quote: '1951562660.0068476',
      pretty_total_quote: '$1,951,562,660.007',
    },
    {
      timestamp: '2023-10-08T15:35:37.625Z',
      total_quote: '2017031662.036005',
      pretty_total_quote: '$2,017,031,662.036',
    },
    {
      timestamp: '2023-10-07T15:35:37.625Z',
      total_quote: '2017947962.0741923',
      pretty_total_quote: '$2,017,947,962.074',
    },
    {
      timestamp: '2023-10-06T15:35:37.625Z',
      total_quote: '2032446162.5375488',
      pretty_total_quote: '$2,032,446,162.538',
    },
    {
      timestamp: '2023-10-05T15:35:37.625Z',
      total_quote: '1989699361.1955483',
      pretty_total_quote: '$1,989,699,361.196',
    },
    {
      timestamp: '2023-10-04T15:35:37.625Z',
      total_quote: '2033657262.2537172',
      pretty_total_quote: '$2,033,657,262.254',
    },
    {
      timestamp: '2023-10-03T15:35:37.625Z',
      total_quote: '2044405262.435698',
      pretty_total_quote: '$2,044,405,262.436',
    },
    {
      timestamp: '2023-10-02T15:35:37.625Z',
      total_quote: '2053447862.8121595',
      pretty_total_quote: '$2,053,447,862.812',
    },
    {
      timestamp: '2023-10-01T15:35:37.625Z',
      total_quote: '2139836765.5880322',
      pretty_total_quote: '$2,139,836,765.588',
    },
    {
      timestamp: '2023-09-30T15:35:37.625Z',
      total_quote: '2063732463.1435633',
      pretty_total_quote: '$2,063,732,463.144',
    },
    {
      timestamp: '2023-09-29T15:35:37.625Z',
      total_quote: '2058942562.9943979',
      pretty_total_quote: '$2,058,942,562.994',
    },
    {
      timestamp: '2023-09-28T15:35:37.625Z',
      total_quote: '2039813462.3873796',
      pretty_total_quote: '$2,039,813,462.387',
    },
    {
      timestamp: '2023-09-27T15:35:37.625Z',
      total_quote: '1972166860.3557265',
      pretty_total_quote: '$1,972,166,860.356',
    },
    {
      timestamp: '2023-09-26T15:35:37.625Z',
      total_quote: '1966893660.1702428',
      pretty_total_quote: '$1,966,893,660.17',
    },
    {
      timestamp: '2023-09-25T15:35:37.625Z',
      total_quote: '1961412259.9554179',
      pretty_total_quote: '$1,961,412,259.955',
    },
    {
      timestamp: '2023-09-24T15:35:37.625Z',
      total_quote: '1951763159.648598',
      pretty_total_quote: '$1,951,763,159.649',
    },
    {
      timestamp: '2023-09-23T15:35:37.625Z',
      total_quote: '1967929960.1671548',
      pretty_total_quote: '$1,967,929,960.167',
    },
    {
      timestamp: '2023-09-22T15:35:37.625Z',
      total_quote: '1966559460.18227',
      pretty_total_quote: '$1,966,559,460.182',
    },
    {
      timestamp: '2023-09-21T15:35:37.625Z',
      total_quote: '1955049559.8640716',
      pretty_total_quote: '$1,955,049,559.864',
    },
    {
      timestamp: '2023-09-20T15:35:37.625Z',
      total_quote: '2003170661.267626',
      pretty_total_quote: '$2,003,170,661.268',
    },
    {
      timestamp: '2023-09-19T15:35:37.625Z',
      total_quote: '2029811562.127856',
      pretty_total_quote: '$2,029,811,562.128',
    },
    {
      timestamp: '2023-09-18T15:35:37.625Z',
      total_quote: '2021465761.8600657',
      pretty_total_quote: '$2,021,465,761.86',
    },
    {
      timestamp: '2023-09-17T15:35:37.625Z',
      total_quote: '2004931061.286198',
      pretty_total_quote: '$2,004,931,061.286',
    },
    {
      timestamp: '2023-09-16T15:35:37.625Z',
      total_quote: '2018014161.7809548',
      pretty_total_quote: '$2,018,014,161.781',
    },
    {
      timestamp: '2023-09-15T15:35:37.625Z',
      total_quote: '2027843562.0339835',
      pretty_total_quote: '$2,027,843,562.034',
    },
    {
      timestamp: '2023-09-14T15:35:37.625Z',
      total_quote: '2008557261.4940853',
      pretty_total_quote: '$2,008,557,261.494',
    },
    {
      timestamp: '2023-09-13T15:35:37.625Z',
      total_quote: '1985115460.7410083',
      pretty_total_quote: '$1,985,115,460.741',
    },
    {
      timestamp: '2023-09-12T15:35:37.625Z',
      total_quote: '1968760060.226939',
      pretty_total_quote: '$1,968,760,060.227',
    },
    {
      timestamp: '2023-09-11T15:35:37.625Z',
      total_quote: '1915573258.5363',
      pretty_total_quote: '$1,915,573,258.536',
    },
    {
      timestamp: '2023-09-10T15:35:37.625Z',
      total_quote: '1997109861.1324508',
      pretty_total_quote: '$1,997,109,861.132',
    },
    {
      timestamp: '2023-09-09T15:35:37.625Z',
      total_quote: '2018109461.7556326',
      pretty_total_quote: '$2,018,109,461.756',
    },
    {
      timestamp: '2023-09-08T15:35:37.625Z',
      total_quote: '2020413361.7879755',
      pretty_total_quote: '$2,020,413,361.788',
    },
    {
      timestamp: '2023-09-07T15:35:37.625Z',
      total_quote: '2031669262.1626582',
      pretty_total_quote: '$2,031,669,262.163',
    },
    {
      timestamp: '2023-09-06T15:35:37.625Z',
      total_quote: '2014998761.60603',
      pretty_total_quote: '$2,014,998,761.606',
    },
    {
      timestamp: '2023-09-05T15:35:37.625Z',
      total_quote: '2016079961.6662257',
      pretty_total_quote: '$2,016,079,961.666',
    },
    {
      timestamp: '2023-09-04T15:35:37.625Z',
      total_quote: '2011552461.4959478',
      pretty_total_quote: '$2,011,552,461.496',
    },
    {
      timestamp: '2023-09-03T15:35:37.625Z',
      total_quote: '2019626661.7836518',
      pretty_total_quote: '$2,019,626,661.784',
    },
    {
      timestamp: '2023-09-02T15:35:37.625Z',
      total_quote: '2020250861.786624',
      pretty_total_quote: '$2,020,250,861.787',
    },
    {
      timestamp: '2023-09-01T15:35:37.625Z',
      total_quote: '2011724561.5204847',
      pretty_total_quote: '$2,011,724,561.52',
    },
    {
      timestamp: '2023-08-31T15:35:37.625Z',
      total_quote: '2031442362.114057',
      pretty_total_quote: '$2,031,442,362.114',
    },
    {
      timestamp: '2023-08-30T15:35:37.625Z',
      total_quote: '2105356264.375265',
      pretty_total_quote: '$2,105,356,264.375',
    },
    {
      timestamp: '2023-08-29T15:35:37.625Z',
      total_quote: '2134917965.2618155',
      pretty_total_quote: '$2,134,917,965.262',
    },
    {
      timestamp: '2023-08-28T15:35:37.625Z',
      total_quote: '2041204162.3647118',
      pretty_total_quote: '$2,041,204,162.365',
    },
    {
      timestamp: '2023-08-27T15:35:37.625Z',
      total_quote: '2045787662.5494626',
      pretty_total_quote: '$2,045,787,662.549',
    },
    {
      timestamp: '2023-08-26T15:35:37.625Z',
      total_quote: '2032534462.1381552',
      pretty_total_quote: '$2,032,534,462.138',
    },
    {
      timestamp: '2023-08-25T15:35:37.625Z',
      total_quote: '2041434162.4451416',
      pretty_total_quote: '$2,041,434,162.445',
    },
    {
      timestamp: '2023-08-24T15:35:37.625Z',
      total_quote: '2048323762.6933181',
      pretty_total_quote: '$2,048,323,762.693',
    },
    {
      timestamp: '2023-08-23T15:35:37.625Z',
      total_quote: '2073054363.44787',
      pretty_total_quote: '$2,073,054,363.448',
    },
    {
      timestamp: '2023-08-22T15:35:37.625Z',
      total_quote: '2016893261.6440213',
      pretty_total_quote: '$2,016,893,261.644',
    },
    {
      timestamp: '2023-08-21T15:35:37.625Z',
      total_quote: '2058396862.9908836',
      pretty_total_quote: '$2,058,396,862.991',
    },
    {
      timestamp: '2023-08-20T15:35:37.625Z',
      total_quote: '2080080563.6410108',
      pretty_total_quote: '$2,080,080,563.641',
    },
    {
      timestamp: '2023-08-19T15:35:37.625Z',
      total_quote: '2059792863.011599',
      pretty_total_quote: '$2,059,792,863.012',
    },
    {
      timestamp: '2023-08-18T15:35:37.625Z',
      total_quote: '2051238162.742518',
      pretty_total_quote: '$2,051,238,162.743',
    },
    {
      timestamp: '2023-08-17T15:35:37.625Z',
      total_quote: '2079401363.7108564',
      pretty_total_quote: '$2,079,401,363.711',
    },
    {
      timestamp: '2023-08-16T15:35:37.625Z',
      total_quote: '2230271568.211087',
      pretty_total_quote: '$2,230,271,568.211',
    },
    {
      timestamp: '2023-08-15T15:35:37.625Z',
      total_quote: '2255182669.000961',
      pretty_total_quote: '$2,255,182,669.001',
    },
    {
      timestamp: '2023-08-14T15:35:37.625Z',
      total_quote: '2277533069.6458325',
      pretty_total_quote: '$2,277,533,069.646',
    },
    {
      timestamp: '2023-08-13T15:35:37.625Z',
      total_quote: '2271006569.46172',
      pretty_total_quote: '$2,271,006,569.462',
    },
    {
      timestamp: '2023-08-12T15:35:37.625Z',
      total_quote: '2282564069.7808757',
      pretty_total_quote: '$2,282,564,069.781',
    },
    {
      timestamp: '2023-08-11T15:35:37.625Z',
      total_quote: '2282086069.7754793',
      pretty_total_quote: '$2,282,086,069.775',
    },
    {
      timestamp: '2023-08-10T15:35:37.625Z',
      total_quote: '2285324069.894235',
      pretty_total_quote: '$2,285,324,069.894',
    },
    {
      timestamp: '2023-08-09T15:35:37.625Z',
      total_quote: '2291053670.1010394',
      pretty_total_quote: '$2,291,053,670.101',
    },
    {
      timestamp: '2023-08-08T15:35:37.625Z',
      total_quote: '2291318070.1107726',
      pretty_total_quote: '$2,291,318,070.111',
    },
    {
      timestamp: '2023-08-07T15:35:37.625Z',
      total_quote: '2256278368.8425913',
      pretty_total_quote: '$2,256,278,368.843',
    },
    {
      timestamp: '2023-08-06T15:35:37.625Z',
      total_quote: '2255958869.001837',
      pretty_total_quote: '$2,255,958,869.002',
    },
    {
      timestamp: '2023-08-05T15:35:37.625Z',
      total_quote: '2266104669.3488364',
      pretty_total_quote: '$2,266,104,669.349',
    },
    {
      timestamp: '2023-08-04T15:35:37.625Z',
      total_quote: '2257817969.0592737',
      pretty_total_quote: '$2,257,817,969.059',
    },
    {
      timestamp: '2023-08-03T15:35:37.625Z',
      total_quote: '2265437769.311739',
      pretty_total_quote: '$2,265,437,769.312',
    },
    {
      timestamp: '2023-08-02T15:35:37.625Z',
      total_quote: '2269998869.383319',
      pretty_total_quote: '$2,269,998,869.383',
    },
    {
      timestamp: '2023-08-01T15:35:37.625Z',
      total_quote: '2309899870.741135',
      pretty_total_quote: '$2,309,899,870.741',
    },
    {
      timestamp: '2023-07-31T15:35:37.625Z',
      total_quote: '2291126370.082812',
      pretty_total_quote: '$2,291,126,370.083',
    },
    {
      timestamp: '2023-07-30T15:35:37.625Z',
      total_quote: '2299005470.2748175',
      pretty_total_quote: '$2,299,005,470.275',
    },
    {
      timestamp: '2023-07-29T15:35:37.625Z',
      total_quote: '2322521671.012911',
      pretty_total_quote: '$2,322,521,671.013',
    },
    {
      timestamp: '2023-07-28T15:35:37.625Z',
      total_quote: '2314456870.840076',
      pretty_total_quote: '$2,314,456,870.84',
    },
    {
      timestamp: '2023-07-27T15:35:37.625Z',
      total_quote: '2295231770.203726',
      pretty_total_quote: '$2,295,231,770.204',
    },
    {
      timestamp: '2023-07-26T15:35:37.625Z',
      total_quote: '2311079270.7252026',
      pretty_total_quote: '$2,311,079,270.725',
    },
    {
      timestamp: '2023-07-25T15:35:37.625Z',
      total_quote: '2294239270.195683',
      pretty_total_quote: '$2,294,239,270.196',
    },
    {
      timestamp: '2023-07-24T15:35:37.625Z',
      total_quote: '2284449869.927315',
      pretty_total_quote: '$2,284,449,869.927',
    },
    {
      timestamp: '2023-07-23T15:35:37.625Z',
      total_quote: '2331422771.3185368',
      pretty_total_quote: '$2,331,422,771.319',
    },
    {
      timestamp: '2023-07-22T15:35:37.625Z',
      total_quote: '2298333770.304892',
      pretty_total_quote: '$2,298,333,770.305',
    },
    {
      timestamp: '2023-07-21T15:35:37.625Z',
      total_quote: '2335359271.480292',
      pretty_total_quote: '$2,335,359,271.48',
    },
    {
      timestamp: '2023-07-20T15:35:37.625Z',
      total_quote: '2334945871.4569755',
      pretty_total_quote: '$2,334,945,871.457',
    },
    {
      timestamp: '2023-07-19T15:35:37.625Z',
      total_quote: '2335307871.4684334',
      pretty_total_quote: '$2,335,307,871.468',
    },
    {
      timestamp: '2023-07-18T15:35:37.625Z',
      total_quote: '2343017071.6703854',
      pretty_total_quote: '$2,343,017,071.67',
    },
    {
      timestamp: '2023-07-17T15:35:37.625Z',
      total_quote: '2361178072.191098',
      pretty_total_quote: '$2,361,178,072.191',
    },
    {
      timestamp: '2023-07-16T15:35:37.625Z',
      total_quote: '2374508372.6634197',
      pretty_total_quote: '$2,374,508,372.663',
    },
    {
      timestamp: '2023-07-15T15:35:37.625Z',
      total_quote: '2384961372.944407',
      pretty_total_quote: '$2,384,961,372.944',
    },
    {
      timestamp: '2023-07-14T15:35:37.625Z',
      total_quote: '2391736073.1658',
      pretty_total_quote: '$2,391,736,073.166',
    },
    {
      timestamp: '2023-07-13T15:35:37.625Z',
      total_quote: '2473974375.6880856',
      pretty_total_quote: '$2,473,974,375.688',
    },
    {
      timestamp: '2023-07-12T15:35:37.625Z',
      total_quote: '2312511070.7802734',
      pretty_total_quote: '$2,312,511,070.78',
    },
    {
      timestamp: '2023-07-11T15:35:37.625Z',
      total_quote: '2318860070.934333',
      pretty_total_quote: '$2,318,860,070.934',
    },
    {
      timestamp: '2023-07-10T15:35:37.625Z',
      total_quote: '2321419071.0165915',
      pretty_total_quote: '$2,321,419,071.017',
    },
    {
      timestamp: '2023-07-09T15:35:37.625Z',
      total_quote: '2298584070.349797',
      pretty_total_quote: '$2,298,584,070.35',
    },
    {
      timestamp: '2023-07-08T15:35:37.625Z',
      total_quote: '2301588570.4093213',
      pretty_total_quote: '$2,301,588,570.409',
    },
    {
      timestamp: '2023-07-07T15:35:37.625Z',
      total_quote: '2309264070.653991',
      pretty_total_quote: '$2,309,264,070.654',
    },
    {
      timestamp: '2023-07-06T15:35:37.625Z',
      total_quote: '2288497470.0862336',
      pretty_total_quote: '$2,288,497,470.086',
    },
    {
      timestamp: '2023-07-05T15:35:37.625Z',
      total_quote: '2359971872.2309923',
      pretty_total_quote: '$2,359,971,872.231',
    },
    {
      timestamp: '2023-07-04T15:35:37.625Z',
      total_quote: '2390340473.171278',
      pretty_total_quote: '$2,390,340,473.171',
    },
    {
      timestamp: '2023-07-03T15:35:37.625Z',
      total_quote: '2412226373.7814455',
      pretty_total_quote: '$2,412,226,373.781',
    },
    {
      timestamp: '2023-07-02T15:35:37.625Z',
      total_quote: '2390400073.0995164',
      pretty_total_quote: '$2,390,400,073.1',
    },
    {
      timestamp: '2023-07-01T15:35:37.625Z',
      total_quote: '2376266872.657794',
      pretty_total_quote: '$2,376,266,872.658',
    },
    {
      timestamp: '2023-06-30T15:35:37.625Z',
      total_quote: '2386078573.066892',
      pretty_total_quote: '$2,386,078,573.067',
    },
    {
      timestamp: '2023-06-29T15:35:37.625Z',
      total_quote: '2288178070.010059',
      pretty_total_quote: '$2,288,178,070.01',
    },
    {
      timestamp: '2023-06-28T15:35:37.625Z',
      total_quote: '2257564469.1011577',
      pretty_total_quote: '$2,257,564,469.101',
    },
    {
      timestamp: '2023-06-27T15:35:37.625Z',
      total_quote: '2332481071.382995',
      pretty_total_quote: '$2,332,481,071.383',
    },
    {
      timestamp: '2023-06-26T15:35:37.625Z',
      total_quote: '2296120070.2278347',
      pretty_total_quote: '$2,296,120,070.228',
    },
    {
      timestamp: '2023-06-25T15:35:37.625Z',
      total_quote: '2345931071.7503705',
      pretty_total_quote: '$2,345,931,071.75',
    },
    {
      timestamp: '2023-06-24T15:35:37.625Z',
      total_quote: '2316817770.835465',
      pretty_total_quote: '$2,316,817,770.835',
    },
    {
      timestamp: '2023-06-23T15:35:37.625Z',
      total_quote: '2335853071.46099',
      pretty_total_quote: '$2,335,853,071.461',
    },
    {
      timestamp: '2023-06-22T15:35:37.625Z',
      total_quote: '2313673570.792282',
      pretty_total_quote: '$2,313,673,570.792',
    },
    {
      timestamp: '2023-06-21T15:35:37.625Z',
      total_quote: '2336690271.504318',
      pretty_total_quote: '$2,336,690,271.504',
    },
    {
      timestamp: '2023-06-20T15:35:37.625Z',
      total_quote: '2213833767.7336993',
      pretty_total_quote: '$2,213,833,767.734',
    },
    {
      timestamp: '2023-06-19T15:35:37.625Z',
      total_quote: '2142019065.462819',
      pretty_total_quote: '$2,142,019,065.463',
    },
    {
      timestamp: '2023-06-18T15:35:37.625Z',
      total_quote: '2124098764.9904892',
      pretty_total_quote: '$2,124,098,764.99',
    },
    {
      timestamp: '2023-06-17T15:35:37.625Z',
      total_quote: '2131668765.2056754',
      pretty_total_quote: '$2,131,668,765.206',
    },
    {
      timestamp: '2023-06-16T15:35:37.625Z',
      total_quote: '2119506464.8482795',
      pretty_total_quote: '$2,119,506,464.848',
    },
    {
      timestamp: '2023-06-15T15:35:37.625Z',
      total_quote: '2056479262.9242463',
      pretty_total_quote: '$2,056,479,262.924',
    },
    {
      timestamp: '2023-06-14T15:35:37.625Z',
      total_quote: '2036758162.337837',
      pretty_total_quote: '$2,036,758,162.338',
    },
    {
      timestamp: '2023-06-13T15:35:37.625Z',
      total_quote: '2145000665.5538929',
      pretty_total_quote: '$2,145,000,665.554',
    },
    {
      timestamp: '2023-06-12T15:35:37.625Z',
      total_quote: '2151820565.8630915',
      pretty_total_quote: '$2,151,820,565.863',
    },
    {
      timestamp: '2023-06-11T15:35:37.625Z',
      total_quote: '2163950866.146334',
      pretty_total_quote: '$2,163,950,866.146',
    },
    {
      timestamp: '2023-06-10T15:35:37.625Z',
      total_quote: '2165725066.2365484',
      pretty_total_quote: '$2,165,725,066.237',
    },
    {
      timestamp: '2023-06-09T15:35:37.625Z',
      total_quote: '2270913569.4311166',
      pretty_total_quote: '$2,270,913,569.431',
    },
    {
      timestamp: '2023-06-08T15:35:37.625Z',
      total_quote: '2278915869.7076716',
      pretty_total_quote: '$2,278,915,869.708',
    },
    {
      timestamp: '2023-06-07T15:35:37.625Z',
      total_quote: '2262008369.1765127',
      pretty_total_quote: '$2,262,008,369.177',
    },
    {
      timestamp: '2023-06-06T15:35:37.625Z',
      total_quote: '2326192671.1131816',
      pretty_total_quote: '$2,326,192,671.113',
    },
    {
      timestamp: '2023-06-05T15:35:37.625Z',
      total_quote: '2235663668.4282336',
      pretty_total_quote: '$2,235,663,668.428',
    },
    {
      timestamp: '2023-06-04T15:35:37.625Z',
      total_quote: '2338195571.5621567',
      pretty_total_quote: '$2,338,195,571.562',
    },
    {
      timestamp: '2023-06-03T15:35:37.625Z',
      total_quote: '2336447271.5228033',
      pretty_total_quote: '$2,336,447,271.523',
    },
    {
      timestamp: '2023-06-02T15:35:37.625Z',
      total_quote: '2354801072.0319424',
      pretty_total_quote: '$2,354,801,072.032',
    },
    {
      timestamp: '2023-06-01T15:35:37.625Z',
      total_quote: '2297819070.293987',
      pretty_total_quote: '$2,297,819,070.294',
    },
    {
      timestamp: '2023-05-31T15:35:37.625Z',
      total_quote: '2315104570.8181725',
      pretty_total_quote: '$2,315,104,570.818',
    },
    {
      timestamp: '2023-05-30T15:35:37.625Z',
      total_quote: '2347613271.813513',
      pretty_total_quote: '$2,347,613,271.814',
    },
    {
      timestamp: '2023-05-29T15:35:37.625Z',
      total_quote: '2337046071.466418',
      pretty_total_quote: '$2,337,046,071.466',
    },
    {
      timestamp: '2023-05-28T15:35:37.625Z',
      total_quote: '2361968072.2712765',
      pretty_total_quote: '$2,361,968,072.271',
    },
    {
      timestamp: '2023-05-27T15:35:37.625Z',
      total_quote: '2260188069.090078',
      pretty_total_quote: '$2,260,188,069.09',
    },
    {
      timestamp: '2023-05-26T15:35:37.625Z',
      total_quote: '2258156369.0420446',
      pretty_total_quote: '$2,258,156,369.042',
    },
    {
      timestamp: '2023-05-25T15:35:37.625Z',
      total_quote: '2229783868.1650524',
      pretty_total_quote: '$2,229,783,868.165',
    },
    {
      timestamp: '2023-05-24T15:35:37.625Z',
      total_quote: '2222246467.992097',
      pretty_total_quote: '$2,222,246,467.992',
    },
    {
      timestamp: '2023-05-23T15:35:37.625Z',
      total_quote: '2289274469.919233',
      pretty_total_quote: '$2,289,274,469.919',
    },
    {
      timestamp: '2023-05-22T15:35:37.625Z',
      total_quote: '2245032268.638655',
      pretty_total_quote: '$2,245,032,268.639',
    },
    {
      timestamp: '2023-05-21T15:35:37.625Z',
      total_quote: '2227940068.130051',
      pretty_total_quote: '$2,227,940,068.13',
    },
    {
      timestamp: '2023-05-20T15:35:37.625Z',
      total_quote: '2245578568.6729',
      pretty_total_quote: '$2,245,578,568.673',
    },
    {
      timestamp: '2023-05-19T15:35:37.625Z',
      total_quote: '2237001568.3780885',
      pretty_total_quote: '$2,237,001,568.378',
    },
    {
      timestamp: '2023-05-18T15:35:37.625Z',
      total_quote: '2224846368.04247',
      pretty_total_quote: '$2,224,846,368.042',
    },
    {
      timestamp: '2023-05-17T15:35:37.625Z',
      total_quote: '2247521868.7039957',
      pretty_total_quote: '$2,247,521,868.704',
    },
    {
      timestamp: '2023-05-16T15:35:37.625Z',
      total_quote: '2251486068.8708725',
      pretty_total_quote: '$2,251,486,068.871',
    },
    {
      timestamp: '2023-05-15T15:35:37.625Z',
      total_quote: '2247174768.7156024',
      pretty_total_quote: '$2,247,174,768.716',
    },
    {
      timestamp: '2023-05-14T15:35:37.625Z',
      total_quote: '2222464867.923388',
      pretty_total_quote: '$2,222,464,867.923',
    },
    {
      timestamp: '2023-05-13T15:35:37.625Z',
      total_quote: '2219392867.7787924',
      pretty_total_quote: '$2,219,392,867.779',
    },
    {
      timestamp: '2023-05-12T15:35:37.625Z',
      total_quote: '2233193068.30053',
      pretty_total_quote: '$2,233,193,068.301',
    },
    {
      timestamp: '2023-05-11T15:35:37.625Z',
      total_quote: '2218273567.770418',
      pretty_total_quote: '$2,218,273,567.77',
    },
    {
      timestamp: '2023-05-10T15:35:37.625Z',
      total_quote: '2273463869.575718',
      pretty_total_quote: '$2,273,463,869.576',
    },
    {
      timestamp: '2023-05-09T15:35:37.625Z',
      total_quote: '2280277269.5086784',
      pretty_total_quote: '$2,280,277,269.509',
    },
    {
      timestamp: '2023-05-08T15:35:37.625Z',
      total_quote: '2283335769.8014035',
      pretty_total_quote: '$2,283,335,769.801',
    },
    {
      timestamp: '2023-05-07T15:35:37.625Z',
      total_quote: '2334166571.336471',
      pretty_total_quote: '$2,334,166,571.336',
    },
    {
      timestamp: '2023-05-06T15:35:37.625Z',
      total_quote: '2364314671.602818',
      pretty_total_quote: '$2,364,314,671.603',
    },
    {
      timestamp: '2023-05-05T15:35:37.625Z',
      total_quote: '2462395075.263887',
      pretty_total_quote: '$2,462,395,075.264',
    },
    {
      timestamp: '2023-05-04T15:35:37.625Z',
      total_quote: '2318320470.8689585',
      pretty_total_quote: '$2,318,320,470.869',
    },
    {
      timestamp: '2023-05-03T15:35:37.625Z',
      total_quote: '2351275071.817743',
      pretty_total_quote: '$2,351,275,071.818',
    },
    {
      timestamp: '2023-05-02T15:35:37.625Z',
      total_quote: '2311125070.6644845',
      pretty_total_quote: '$2,311,125,070.664',
    },
    {
      timestamp: '2023-05-01T15:35:37.625Z',
      total_quote: '2262051369.0766582',
      pretty_total_quote: '$2,262,051,369.077',
    },
    {
      timestamp: '2023-04-30T15:35:37.625Z',
      total_quote: '2327000671.11297',
      pretty_total_quote: '$2,327,000,671.113',
    },
    {
      timestamp: '2023-04-29T15:35:37.625Z',
      total_quote: '2355032671.8234034',
      pretty_total_quote: '$2,355,032,671.823',
    },
    {
      timestamp: '2023-04-28T15:35:37.625Z',
      total_quote: '2338095471.5066566',
      pretty_total_quote: '$2,338,095,471.507',
    },
    {
      timestamp: '2023-04-27T15:35:37.625Z',
      total_quote: '2358983772.016686',
      pretty_total_quote: '$2,358,983,772.017',
    },
    {
      timestamp: '2023-04-26T15:35:37.625Z',
      total_quote: '2310455670.618843',
      pretty_total_quote: '$2,310,455,670.619',
    },
    {
      timestamp: '2023-04-25T15:35:37.625Z',
      total_quote: '2306612070.4126096',
      pretty_total_quote: '$2,306,612,070.413',
    },
    {
      timestamp: '2023-04-24T15:35:37.625Z',
      total_quote: '2274622269.491711',
      pretty_total_quote: '$2,274,622,269.492',
    },
    {
      timestamp: '2023-04-23T15:35:37.625Z',
      total_quote: '2300478070.1443186',
      pretty_total_quote: '$2,300,478,070.144',
    },
    {
      timestamp: '2023-04-22T15:35:37.625Z',
      total_quote: '2316969770.892863',
      pretty_total_quote: '$2,316,969,770.893',
    },
    {
      timestamp: '2023-04-21T15:35:37.625Z',
      total_quote: '2282974569.7855396',
      pretty_total_quote: '$2,282,974,569.786',
    },
    {
      timestamp: '2023-04-20T15:35:37.625Z',
      total_quote: '2398106673.2523518',
      pretty_total_quote: '$2,398,106,673.252',
    },
    {
      timestamp: '2023-04-19T15:35:37.625Z',
      total_quote: '2392455273.1143203',
      pretty_total_quote: '$2,392,455,273.114',
    },
    {
      timestamp: '2023-04-18T15:35:37.625Z',
      total_quote: '2599499879.450177',
      pretty_total_quote: '$2,599,499,879.45',
    },
    {
      timestamp: '2023-04-17T15:35:37.625Z',
      total_quote: '2564729678.238481',
      pretty_total_quote: '$2,564,729,678.238',
    },
    {
      timestamp: '2023-04-16T15:35:37.625Z',
      total_quote: '2616144180.644848',
      pretty_total_quote: '$2,616,144,180.645',
    },
    {
      timestamp: '2023-04-15T15:35:37.625Z',
      total_quote: '2585268578.891041',
      pretty_total_quote: '$2,585,268,578.891',
    },
    {
      timestamp: '2023-04-14T15:35:37.625Z',
      total_quote: '2562207278.214822',
      pretty_total_quote: '$2,562,207,278.215',
    },
    {
      timestamp: '2023-04-13T15:35:37.625Z',
      total_quote: '2484615475.9598885',
      pretty_total_quote: '$2,484,615,475.96',
    },
    {
      timestamp: '2023-04-12T15:35:37.625Z',
      total_quote: '2370167672.2299385',
      pretty_total_quote: '$2,370,167,672.23',
    },
    {
      timestamp: '2023-04-11T15:35:37.625Z',
      total_quote: '2336793671.206343',
      pretty_total_quote: '$2,336,793,671.206',
    },
    {
      timestamp: '2023-04-10T15:35:37.625Z',
      total_quote: '2360423471.691458',
      pretty_total_quote: '$2,360,423,471.691',
    },
    {
      timestamp: '2023-04-09T15:35:37.625Z',
      total_quote: '2296963369.979386',
      pretty_total_quote: '$2,296,963,369.979',
    },
    {
      timestamp: '2023-04-08T15:35:37.625Z',
      total_quote: '2285218869.6456685',
      pretty_total_quote: '$2,285,218,869.646',
    },
    {
      timestamp: '2023-04-07T15:35:37.625Z',
      total_quote: '2304802870.1118',
      pretty_total_quote: '$2,304,802,870.112',
    },
    {
      timestamp: '2023-04-06T15:35:37.625Z',
      total_quote: '2311681370.4849434',
      pretty_total_quote: '$2,311,681,370.485',
    },
    {
      timestamp: '2023-04-05T15:35:37.625Z',
      total_quote: '2358669071.9355927',
      pretty_total_quote: '$2,358,669,071.936',
    },
    {
      timestamp: '2023-04-04T15:35:37.625Z',
      total_quote: '2314112570.5485587',
      pretty_total_quote: '$2,314,112,570.549',
    },
    {
      timestamp: '2023-04-03T15:35:37.625Z',
      total_quote: '2235538268.2478547',
      pretty_total_quote: '$2,235,538,268.248',
    },
    {
      timestamp: '2023-04-02T15:35:37.625Z',
      total_quote: '2219383067.6679835',
      pretty_total_quote: '$2,219,383,067.668',
    },
    {
      timestamp: '2023-04-01T15:35:37.625Z',
      total_quote: '2252219668.680455',
      pretty_total_quote: '$2,252,219,668.68',
    },
    {
      timestamp: '2023-03-31T15:35:37.625Z',
      total_quote: '2251955568.7859397',
      pretty_total_quote: '$2,251,955,568.786',
    },
    {
      timestamp: '2023-03-30T15:35:37.625Z',
      total_quote: '2216586267.5730534',
      pretty_total_quote: '$2,216,586,267.573',
    },
    {
      timestamp: '2023-03-29T15:35:37.625Z',
      total_quote: '2214047067.602284',
      pretty_total_quote: '$2,214,047,067.602',
    },
    {
      timestamp: '2023-03-28T15:35:37.625Z',
      total_quote: '2192943066.9869204',
      pretty_total_quote: '$2,192,943,066.987',
    },
    {
      timestamp: '2023-03-27T15:35:37.625Z',
      total_quote: '2121179064.7398639',
      pretty_total_quote: '$2,121,179,064.74',
    },
    {
      timestamp: '2023-03-26T15:35:37.625Z',
      total_quote: '2192577866.9134336',
      pretty_total_quote: '$2,192,577,866.913',
    },
    {
      timestamp: '2023-03-25T15:35:37.625Z',
      total_quote: '2166471466.253221',
      pretty_total_quote: '$2,166,471,466.253',
    },
    {
      timestamp: '2023-03-24T15:35:37.625Z',
      total_quote: '2174903366.3532896',
      pretty_total_quote: '$2,174,903,366.353',
    },
    {
      timestamp: '2023-03-23T15:35:37.625Z',
      total_quote: '2252989468.5134554',
      pretty_total_quote: '$2,252,989,468.513',
    },
    {
      timestamp: '2023-03-22T15:35:37.625Z',
      total_quote: '2157398065.873658',
      pretty_total_quote: '$2,157,398,065.874',
    },
    {
      timestamp: '2023-03-21T15:35:37.625Z',
      total_quote: '2239109668.4243083',
      pretty_total_quote: '$2,239,109,668.424',
    },
    {
      timestamp: '2023-03-20T15:35:37.625Z',
      total_quote: '2155571765.863969',
      pretty_total_quote: '$2,155,571,765.864',
    },
    {
      timestamp: '2023-03-19T15:35:37.625Z',
      total_quote: '2220489068.0539894',
      pretty_total_quote: '$2,220,489,068.054',
    },
    {
      timestamp: '2023-03-18T15:35:37.625Z',
      total_quote: '2184246566.6616244',
      pretty_total_quote: '$2,184,246,566.662',
    },
    {
      timestamp: '2023-03-17T15:35:37.625Z',
      total_quote: '2213544767.5294175',
      pretty_total_quote: '$2,213,544,767.529',
    },
    {
      timestamp: '2023-03-16T15:35:37.625Z',
      total_quote: '2074550563.3656783',
      pretty_total_quote: '$2,074,550,563.366',
    },
    {
      timestamp: '2023-03-15T15:35:37.625Z',
      total_quote: '2047273162.5761585',
      pretty_total_quote: '$2,047,273,162.576',
    },
    {
      timestamp: '2023-03-14T15:35:37.625Z',
      total_quote: '2105272064.1938193',
      pretty_total_quote: '$2,105,272,064.194',
    },
    {
      timestamp: '2023-03-13T15:35:37.625Z',
      total_quote: '2074422463.2681615',
      pretty_total_quote: '$2,074,422,463.268',
    },
    {
      timestamp: '2023-03-12T15:35:37.625Z',
      total_quote: '1961506259.7356176',
      pretty_total_quote: '$1,961,506,259.736',
    },
    {
      timestamp: '2023-03-11T15:35:37.625Z',
      total_quote: '1825769355.3486528',
      pretty_total_quote: '$1,825,769,355.349',
    },
    {
      timestamp: '2023-03-10T15:35:37.625Z',
      total_quote: '1775450554.3100982',
      pretty_total_quote: '$1,775,450,554.31',
    },
    {
      timestamp: '2023-03-09T15:35:37.625Z',
      total_quote: '1765661654.0071042',
      pretty_total_quote: '$1,765,661,654.007',
    },
    {
      timestamp: '2023-03-08T15:35:37.625Z',
      total_quote: '1895888557.9964046',
      pretty_total_quote: '$1,895,888,557.996',
    },
    {
      timestamp: '2023-03-07T15:35:37.625Z',
      total_quote: '1934782859.1992164',
      pretty_total_quote: '$1,934,782,859.199',
    },
    {
      timestamp: '2023-03-06T15:35:37.625Z',
      total_quote: '1935392359.2087336',
      pretty_total_quote: '$1,935,392,359.209',
    },
    {
      timestamp: '2023-03-05T15:35:37.625Z',
      total_quote: '1931361359.0885892',
      pretty_total_quote: '$1,931,361,359.089',
    },
    {
      timestamp: '2023-03-04T15:35:37.625Z',
      total_quote: '1937942059.2599697',
      pretty_total_quote: '$1,937,942,059.26',
    },
    {
      timestamp: '2023-03-03T15:35:37.625Z',
      total_quote: '1937904659.2565544',
      pretty_total_quote: '$1,937,904,659.257',
    },
    {
      timestamp: '2023-03-02T15:35:37.625Z',
      total_quote: '2033699262.2304678',
      pretty_total_quote: '$2,033,699,262.23',
    },
    {
      timestamp: '2023-03-01T15:35:37.625Z',
      total_quote: '2054517162.8360007',
      pretty_total_quote: '$2,054,517,162.836',
    },
    {
      timestamp: '2023-02-28T15:35:37.625Z',
      total_quote: '1983834560.6284955',
      pretty_total_quote: '$1,983,834,560.628',
    },
    {
      timestamp: '2023-02-27T15:35:37.625Z',
      total_quote: '2015008861.6541994',
      pretty_total_quote: '$2,015,008,861.654',
    },
    {
      timestamp: '2023-02-26T15:35:37.625Z',
      total_quote: '2025590961.9655364',
      pretty_total_quote: '$2,025,590,961.966',
    },
    {
      timestamp: '2023-02-25T15:35:37.625Z',
      total_quote: '1967901460.1782565',
      pretty_total_quote: '$1,967,901,460.178',
    },
    {
      timestamp: '2023-02-24T15:35:37.625Z',
      total_quote: '1985369660.6989036',
      pretty_total_quote: '$1,985,369,660.699',
    },
    {
      timestamp: '2023-02-23T15:35:37.625Z',
      total_quote: '2039545962.301283',
      pretty_total_quote: '$2,039,545,962.301',
    },
    {
      timestamp: '2023-02-22T15:35:37.625Z',
      total_quote: '2028558161.970125',
      pretty_total_quote: '$2,028,558,161.97',
    },
    {
      timestamp: '2023-02-21T15:35:37.625Z',
      total_quote: '2046613062.5458615',
      pretty_total_quote: '$2,046,613,062.546',
    },
    {
      timestamp: '2023-02-20T15:35:37.625Z',
      total_quote: '2099422864.1891398',
      pretty_total_quote: '$2,099,422,864.189',
    },
    {
      timestamp: '2023-02-19T15:35:37.625Z',
      total_quote: '2069651363.3300893',
      pretty_total_quote: '$2,069,651,363.33',
    },
    {
      timestamp: '2023-02-18T15:35:37.625Z',
      total_quote: '2090286763.9045317',
      pretty_total_quote: '$2,090,286,763.905',
    },
    {
      timestamp: '2023-02-17T15:35:37.625Z',
      total_quote: '2095253064.2235727',
      pretty_total_quote: '$2,095,253,064.224',
    },
    {
      timestamp: '2023-02-16T15:35:37.625Z',
      total_quote: '2028793562.2131097',
      pretty_total_quote: '$2,028,793,562.213',
    },
    {
      timestamp: '2023-02-15T15:35:37.625Z',
      total_quote: '2067408063.3022397',
      pretty_total_quote: '$2,067,408,063.302',
    },
    {
      timestamp: '2023-02-14T15:35:37.625Z',
      total_quote: '1922522558.8058352',
      pretty_total_quote: '$1,922,522,558.806',
    },
    {
      timestamp: '2023-02-13T15:35:37.625Z',
      total_quote: '1861296556.933761',
      pretty_total_quote: '$1,861,296,556.934',
    },
    {
      timestamp: '2023-02-12T15:35:37.625Z',
      total_quote: '1871158558.1714463',
      pretty_total_quote: '$1,871,158,558.171',
    },
    {
      timestamp: '2023-02-11T15:35:37.625Z',
      total_quote: '1903714458.4662702',
      pretty_total_quote: '$1,903,714,458.466',
    },
    {
      timestamp: '2023-02-10T15:35:37.625Z',
      total_quote: '1870186657.176495',
      pretty_total_quote: '$1,870,186,657.176',
    },
    {
      timestamp: '2023-02-09T15:35:37.625Z',
      total_quote: '1909211458.2999125',
      pretty_total_quote: '$1,909,211,458.3',
    },
    {
      timestamp: '2023-02-08T15:35:37.625Z',
      total_quote: '2039042462.2949326',
      pretty_total_quote: '$2,039,042,462.295',
    },
    {
      timestamp: '2023-02-07T15:35:37.625Z',
      total_quote: '2067075863.1611152',
      pretty_total_quote: '$2,067,075,863.161',
    },
    {
      timestamp: '2023-02-06T15:35:37.625Z',
      total_quote: '1998258761.029961',
      pretty_total_quote: '$1,998,258,761.03',
    },
    {
      timestamp: '2023-02-05T15:35:37.625Z',
      total_quote: '2014853561.502733',
      pretty_total_quote: '$2,014,853,561.503',
    },
    {
      timestamp: '2023-02-04T15:35:37.625Z',
      total_quote: '2058782062.8286927',
      pretty_total_quote: '$2,058,782,062.829',
    },
    {
      timestamp: '2023-02-03T15:35:37.625Z',
      total_quote: '2047091062.5079808',
      pretty_total_quote: '$2,047,091,062.508',
    },
    {
      timestamp: '2023-02-02T15:35:37.625Z',
      total_quote: '2035799662.1132677',
      pretty_total_quote: '$2,035,799,662.113',
    },
    {
      timestamp: '2023-02-01T15:35:37.625Z',
      total_quote: '2028130861.8767204',
      pretty_total_quote: '$2,028,130,861.877',
    },
    {
      timestamp: '2023-01-31T15:35:37.625Z',
      total_quote: '1958742159.7160718',
      pretty_total_quote: '$1,958,742,159.716',
    },
    {
      timestamp: '2023-01-30T15:35:37.625Z',
      total_quote: '1936871259.1465096',
      pretty_total_quote: '$1,936,871,259.147',
    },
    {
      timestamp: '2023-01-29T15:35:37.625Z',
      total_quote: '2035163362.2278957',
      pretty_total_quote: '$2,035,163,362.228',
    },
    {
      timestamp: '2023-01-28T15:35:37.625Z',
      total_quote: '1941960259.3136306',
      pretty_total_quote: '$1,941,960,259.314',
    },
    {
      timestamp: '2023-01-27T15:35:37.625Z',
      total_quote: '1974126660.3236022',
      pretty_total_quote: '$1,974,126,660.324',
    },
    {
      timestamp: '2023-01-26T15:35:37.625Z',
      total_quote: '1979306260.4589267',
      pretty_total_quote: '$1,979,306,260.459',
    },
    {
      timestamp: '2023-01-25T15:35:37.625Z',
      total_quote: '1995303861.038238',
      pretty_total_quote: '$1,995,303,861.038',
    },
    {
      timestamp: '2023-01-24T15:35:37.625Z',
      total_quote: '1920887259.5010595',
      pretty_total_quote: '$1,920,887,259.501',
    },
    {
      timestamp: '2023-01-23T15:35:37.625Z',
      total_quote: '2015927662.1366446',
      pretty_total_quote: '$2,015,927,662.137',
    },
    {
      timestamp: '2023-01-22T15:35:37.625Z',
      total_quote: '2012846861.4002197',
      pretty_total_quote: '$2,012,846,861.4',
    },
    {
      timestamp: '2023-01-21T15:35:37.625Z',
      total_quote: '2008548161.241552',
      pretty_total_quote: '$2,008,548,161.242',
    },
    {
      timestamp: '2023-01-20T15:35:37.625Z',
      total_quote: '2053969262.57849',
      pretty_total_quote: '$2,053,969,262.578',
    },
    {
      timestamp: '2023-01-19T15:35:37.625Z',
      total_quote: '1914854558.337692',
      pretty_total_quote: '$1,914,854,558.338',
    },
    {
      timestamp: '2023-01-18T15:35:37.625Z',
      total_quote: '1873815656.84891',
      pretty_total_quote: '$1,873,815,656.849',
    },
    {
      timestamp: '2023-01-17T15:35:37.625Z',
      total_quote: '1937098658.83623',
      pretty_total_quote: '$1,937,098,658.836',
    },
    {
      timestamp: '2023-01-16T15:35:37.625Z',
      total_quote: '1947543459.180607',
      pretty_total_quote: '$1,947,543,459.181',
    },
    {
      timestamp: '2023-01-15T15:35:37.625Z',
      total_quote: '1915571558.060986',
      pretty_total_quote: '$1,915,571,558.061',
    },
    {
      timestamp: '2023-01-14T15:35:37.625Z',
      total_quote: '1918831558.178875',
      pretty_total_quote: '$1,918,831,558.179',
    },
    {
      timestamp: '2023-01-13T15:35:37.625Z',
      total_quote: '1795917654.48538',
      pretty_total_quote: '$1,795,917,654.485',
    },
    {
      timestamp: '2023-01-12T15:35:37.625Z',
      total_quote: '1749428453.058754',
      pretty_total_quote: '$1,749,428,453.059',
    },
    {
      timestamp: '2023-01-11T15:35:37.625Z',
      total_quote: '1721505252.17224',
      pretty_total_quote: '$1,721,505,252.172',
    },
    {
      timestamp: '2023-01-10T15:35:37.625Z',
      total_quote: '1649631650.012947',
      pretty_total_quote: '$1,649,631,650.013',
    },
    {
      timestamp: '2023-01-09T15:35:37.625Z',
      total_quote: '1631754649.455738',
      pretty_total_quote: '$1,631,754,649.456',
    },
    {
      timestamp: '2023-01-08T15:35:37.625Z',
      total_quote: '1588342548.031933',
      pretty_total_quote: '$1,588,342,548.032',
    },
    {
      timestamp: '2023-01-07T15:35:37.625Z',
      total_quote: '1561577547.3149',
      pretty_total_quote: '$1,561,577,547.315',
    },
    {
      timestamp: '2023-01-06T15:35:37.625Z',
      total_quote: '1568159447.358963',
      pretty_total_quote: '$1,568,159,447.359',
    },
    {
      timestamp: '2023-01-05T15:35:37.625Z',
      total_quote: '1544230946.64609',
      pretty_total_quote: '$1,544,230,946.646',
    },
    {
      timestamp: '2023-01-04T15:35:37.625Z',
      total_quote: '1550899646.83728',
      pretty_total_quote: '$1,550,899,646.837',
    },
    {
      timestamp: '2023-01-03T15:35:37.625Z',
      total_quote: '1499792145.2698',
      pretty_total_quote: '$1,499,792,145.27',
    },
    {
      timestamp: '2023-01-02T15:35:37.625Z',
      total_quote: '1498445345.241367',
      pretty_total_quote: '$1,498,445,345.241',
    },
    {
      timestamp: '2023-01-01T15:35:37.625Z',
      total_quote: '1482435744.71134',
      pretty_total_quote: '$1,482,435,744.711',
    },
    {
      timestamp: '2022-12-31T15:35:37.625Z',
      total_quote: '1477311144.53987',
      pretty_total_quote: '$1,477,311,144.54',
    },
    {
      timestamp: '2022-12-30T15:35:37.625Z',
      total_quote: '1480347644.707294',
      pretty_total_quote: '$1,480,347,644.707',
    },
    {
      timestamp: '2022-12-29T15:35:37.625Z',
      total_quote: '1483598544.8425',
      pretty_total_quote: '$1,483,598,544.843',
    },
    {
      timestamp: '2022-12-28T15:35:37.625Z',
      total_quote: '1467574444.41792',
      pretty_total_quote: '$1,467,574,444.418',
    },
    {
      timestamp: '2022-12-27T15:35:37.625Z',
      total_quote: '1496479945.25391',
      pretty_total_quote: '$1,496,479,945.254',
    },
    {
      timestamp: '2022-12-26T15:35:37.625Z',
      total_quote: '1515167045.86771',
      pretty_total_quote: '$1,515,167,045.868',
    },
    {
      timestamp: '2022-12-25T15:35:37.625Z',
      total_quote: '1505892445.55822',
      pretty_total_quote: '$1,505,892,445.558',
    },
    {
      timestamp: '2022-12-24T15:35:37.625Z',
      total_quote: '1507856545.61111',
      pretty_total_quote: '$1,507,856,545.611',
    },
    {
      timestamp: '2022-12-23T15:35:37.625Z',
      total_quote: '1507363045.635494',
      pretty_total_quote: '$1,507,363,045.635',
    },
    {
      timestamp: '2022-12-22T15:35:37.625Z',
      total_quote: '1503763545.46899',
      pretty_total_quote: '$1,503,763,545.469',
    },
    {
      timestamp: '2022-12-21T15:35:37.625Z',
      total_quote: '1498561745.280415',
      pretty_total_quote: '$1,498,561,745.28',
    },
    {
      timestamp: '2022-12-20T15:35:37.625Z',
      total_quote: '1503594645.467163',
      pretty_total_quote: '$1,503,594,645.467',
    },
    {
      timestamp: '2022-12-19T15:35:37.625Z',
      total_quote: '1440379043.531353',
      pretty_total_quote: '$1,440,379,043.531',
    },
    {
      timestamp: '2022-12-18T15:35:37.625Z',
      total_quote: '1462038744.18957',
      pretty_total_quote: '$1,462,038,744.19',
    },
    {
      timestamp: '2022-12-17T15:35:37.625Z',
      total_quote: '1470484644.374687',
      pretty_total_quote: '$1,470,484,644.375',
    },
    {
      timestamp: '2022-12-16T15:35:37.625Z',
      total_quote: '1440565043.481594',
      pretty_total_quote: '$1,440,565,043.482',
    },
    {
      timestamp: '2022-12-15T15:35:37.625Z',
      total_quote: '1560584022.855377',
      pretty_total_quote: '$1,560,584,022.855',
    },
    {
      timestamp: '2022-12-14T15:35:37.625Z',
      total_quote: '1614549649.24353',
      pretty_total_quote: '$1,614,549,649.244',
    },
    {
      timestamp: '2022-12-13T15:35:37.625Z',
      total_quote: '1629926549.144672',
      pretty_total_quote: '$1,629,926,549.145',
    },
    {
      timestamp: '2022-12-12T15:35:37.625Z',
      total_quote: '1573882947.509968',
      pretty_total_quote: '$1,573,882,947.51',
    },
    {
      timestamp: '2022-12-11T15:35:37.625Z',
      total_quote: '1561081547.272655',
      pretty_total_quote: '$1,561,081,547.273',
    },
    {
      timestamp: '2022-12-10T15:35:37.625Z',
      total_quote: '1562502546.91828',
      pretty_total_quote: '$1,562,502,546.918',
    },
    {
      timestamp: '2022-12-09T15:35:37.625Z',
      total_quote: '1560998947.74783',
      pretty_total_quote: '$1,560,998,947.748',
    },
    {
      timestamp: '2022-12-08T15:35:37.625Z',
      total_quote: '1582216146.99635',
      pretty_total_quote: '$1,582,216,146.996',
    },
    {
      timestamp: '2022-12-07T15:35:37.625Z',
      total_quote: '1522415446.985474',
      pretty_total_quote: '$1,522,415,446.985',
    },
    {
      timestamp: '2022-12-06T15:35:37.625Z',
      total_quote: '1571070347.248577',
      pretty_total_quote: '$1,571,070,347.249',
    },
    {
      timestamp: '2022-12-05T15:35:37.625Z',
      total_quote: '1555530546.9827',
      pretty_total_quote: '$1,555,530,546.983',
    },
    {
      timestamp: '2022-12-04T15:35:37.625Z',
      total_quote: '1584030748.423042',
      pretty_total_quote: '$1,584,030,748.423',
    },
    {
      timestamp: '2022-12-03T15:35:37.625Z',
      total_quote: '1534902847.93511',
      pretty_total_quote: '$1,534,902,847.935',
    },
    {
      timestamp: '2022-12-02T15:35:37.625Z',
      total_quote: '1598713247.903717',
      pretty_total_quote: '$1,598,713,247.904',
    },
    {
      timestamp: '2022-12-01T15:35:37.625Z',
      total_quote: '1576575247.66803',
      pretty_total_quote: '$1,576,575,247.668',
    },
    {
      timestamp: '2022-11-30T15:35:37.625Z',
      total_quote: '1602833948.335716',
      pretty_total_quote: '$1,602,833,948.336',
    },
    {
      timestamp: '2022-11-29T15:35:37.625Z',
      total_quote: '1502251845.402714',
      pretty_total_quote: '$1,502,251,845.403',
    },
    {
      timestamp: '2022-11-28T15:35:37.625Z',
      total_quote: '1444860343.503796',
      pretty_total_quote: '$1,444,860,343.504',
    },
    {
      timestamp: '2022-11-27T15:35:37.625Z',
      total_quote: '1477153744.524326',
      pretty_total_quote: '$1,477,153,744.524',
    },
    {
      timestamp: '2022-11-26T15:35:37.625Z',
      total_quote: '1488769944.64521',
      pretty_total_quote: '$1,488,769,944.645',
    },
    {
      timestamp: '2022-11-25T15:35:37.625Z',
      total_quote: '1480432644.445915',
      pretty_total_quote: '$1,480,432,644.446',
    },
    {
      timestamp: '2022-11-24T15:35:37.625Z',
      total_quote: '1486793144.47712',
      pretty_total_quote: '$1,486,793,144.477',
    },
    {
      timestamp: '2022-11-23T15:35:37.625Z',
      total_quote: '1465098543.95784',
      pretty_total_quote: '$1,465,098,543.958',
    },
    {
      timestamp: '2022-11-22T15:35:37.625Z',
      total_quote: '1400977742.1267',
      pretty_total_quote: '$1,400,977,742.127',
    },
    {
      timestamp: '2022-11-21T15:35:37.625Z',
      total_quote: '1370982541.251816',
      pretty_total_quote: '$1,370,982,541.252',
    },
    {
      timestamp: '2022-11-20T15:35:37.625Z',
      total_quote: '1413668242.609425',
      pretty_total_quote: '$1,413,668,242.609',
    },
    {
      timestamp: '2022-11-19T15:35:37.625Z',
      total_quote: '1504862645.480614',
      pretty_total_quote: '$1,504,862,645.481',
    },
    {
      timestamp: '2022-11-18T15:35:37.625Z',
      total_quote: '1498766045.241932',
      pretty_total_quote: '$1,498,766,045.242',
    },
    {
      timestamp: '2022-11-17T15:35:37.625Z',
      total_quote: '1484601344.901886',
      pretty_total_quote: '$1,484,601,344.902',
    },
    {
      timestamp: '2022-11-16T15:35:37.625Z',
      total_quote: '1503992045.517273',
      pretty_total_quote: '$1,503,992,045.517',
    },
    {
      timestamp: '2022-11-15T15:35:37.625Z',
      total_quote: '1547495746.83738',
      pretty_total_quote: '$1,547,495,746.837',
    },
    {
      timestamp: '2022-11-14T15:35:37.625Z',
      total_quote: '1533628946.420654',
      pretty_total_quote: '$1,533,628,946.421',
    },
    {
      timestamp: '2022-11-13T15:35:37.625Z',
      total_quote: '1510999445.60621',
      pretty_total_quote: '$1,510,999,445.606',
    },
    {
      timestamp: '2022-11-12T15:35:37.625Z',
      total_quote: '1550463146.588894',
      pretty_total_quote: '$1,550,463,146.589',
    },
    {
      timestamp: '2022-11-11T15:35:37.625Z',
      total_quote: '1601052348.181023',
      pretty_total_quote: '$1,601,052,348.181',
    },
    {
      timestamp: '2022-11-10T15:35:37.625Z',
      total_quote: '1608490148.79381',
      pretty_total_quote: '$1,608,490,148.794',
    },
    {
      timestamp: '2022-11-09T15:35:37.625Z',
      total_quote: '1353119240.983498',
      pretty_total_quote: '$1,353,119,240.983',
    },
    {
      timestamp: '2022-11-08T15:35:37.625Z',
      total_quote: '1649183449.971535',
      pretty_total_quote: '$1,649,183,449.972',
    },
    {
      timestamp: '2022-11-07T15:35:37.625Z',
      total_quote: '1939201459.044598',
      pretty_total_quote: '$1,939,201,459.045',
    },
    {
      timestamp: '2022-11-06T15:35:37.625Z',
      total_quote: '1940805859.17827',
      pretty_total_quote: '$1,940,805,859.178',
    },
    {
      timestamp: '2022-11-05T15:35:37.625Z',
      total_quote: '2009576461.40421',
      pretty_total_quote: '$2,009,576,461.404',
    },
    {
      timestamp: '2022-11-04T15:35:37.625Z',
      total_quote: '2030208562.006485',
      pretty_total_quote: '$2,030,208,562.006',
    },
    {
      timestamp: '2022-11-03T15:35:37.625Z',
      total_quote: '1890694957.729748',
      pretty_total_quote: '$1,890,694,957.73',
    },
    {
      timestamp: '2022-11-02T15:35:37.625Z',
      total_quote: '1877523057.380463',
      pretty_total_quote: '$1,877,523,057.38',
    },
    {
      timestamp: '2022-11-01T15:35:37.625Z',
      total_quote: '1951397159.61515',
      pretty_total_quote: '$1,951,397,159.615',
    },
    {
      timestamp: '2022-10-31T15:35:37.625Z',
      total_quote: '1941847959.37226',
      pretty_total_quote: '$1,941,847,959.372',
    },
    {
      timestamp: '2022-10-30T15:35:37.625Z',
      total_quote: '1964721359.965176',
      pretty_total_quote: '$1,964,721,359.965',
    },
    {
      timestamp: '2022-10-29T15:35:37.625Z',
      total_quote: '2000304561.09164',
      pretty_total_quote: '$2,000,304,561.092',
    },
    {
      timestamp: '2022-10-28T15:35:37.625Z',
      total_quote: '1919738258.616913',
      pretty_total_quote: '$1,919,738,258.617',
    },
    {
      timestamp: '2022-10-27T15:35:37.625Z',
      total_quote: '1870466457.12492',
      pretty_total_quote: '$1,870,466,457.125',
    },
    {
      timestamp: '2022-10-26T15:35:37.625Z',
      total_quote: '1935742159.04111',
      pretty_total_quote: '$1,935,742,159.041',
    },
    {
      timestamp: '2022-10-25T15:35:37.625Z',
      total_quote: '1805846555.04123',
      pretty_total_quote: '$1,805,846,555.041',
    },
    {
      timestamp: '2022-10-24T15:35:37.625Z',
      total_quote: '1657604550.578037',
      pretty_total_quote: '$1,657,604,550.578',
    },
    {
      timestamp: '2022-10-23T15:35:37.625Z',
      total_quote: '1684500051.390465',
      pretty_total_quote: '$1,684,500,051.39',
    },
    {
      timestamp: '2022-10-22T15:35:37.625Z',
      total_quote: '1622052749.432106',
      pretty_total_quote: '$1,622,052,749.432',
    },
    {
      timestamp: '2022-10-21T15:35:37.625Z',
      total_quote: '1604918348.93873',
      pretty_total_quote: '$1,604,918,348.939',
    },
    {
      timestamp: '2022-10-20T15:35:37.625Z',
      total_quote: '1583044148.265446',
      pretty_total_quote: '$1,583,044,148.265',
    },
    {
      timestamp: '2022-10-19T15:35:37.625Z',
      total_quote: '1585956948.375465',
      pretty_total_quote: '$1,585,956,948.375',
    },
    {
      timestamp: '2022-10-18T15:35:37.625Z',
      total_quote: '1619599249.27808',
      pretty_total_quote: '$1,619,599,249.278',
    },
    {
      timestamp: '2022-10-17T15:35:37.625Z',
      total_quote: '1648644750.18012',
      pretty_total_quote: '$1,648,644,750.18',
    },
    {
      timestamp: '2022-10-16T15:35:37.625Z',
      total_quote: '1613629749.111824',
      pretty_total_quote: '$1,613,629,749.112',
    },
    {
      timestamp: '2022-10-15T15:35:37.625Z',
      total_quote: '1576206547.90748',
      pretty_total_quote: '$1,576,206,547.907',
    },
    {
      timestamp: '2022-10-14T15:35:37.625Z',
      total_quote: '1604020948.71976',
      pretty_total_quote: '$1,604,020,948.72',
    },
    {
      timestamp: '2022-10-13T15:35:37.625Z',
      total_quote: '1590223100',
      pretty_total_quote: '$1,590,223,100',
    },
    {
      timestamp: '2022-10-12T15:35:37.625Z',
      total_quote: '1598180900',
      pretty_total_quote: '$1,598,180,900',
    },
    {
      timestamp: '2022-10-11T15:35:37.625Z',
      total_quote: '1580668500',
      pretty_total_quote: '$1,580,668,500',
    },
    {
      timestamp: '2022-10-10T15:35:37.625Z',
      total_quote: '1593962500',
      pretty_total_quote: '$1,593,962,500',
    },
    {
      timestamp: '2022-10-09T15:35:37.625Z',
      total_quote: '1633469000',
      pretty_total_quote: '$1,633,469,000',
    },
    {
      timestamp: '2022-10-08T15:35:37.625Z',
      total_quote: '1624729000',
      pretty_total_quote: '$1,624,729,000',
    },
    {
      timestamp: '2022-10-07T15:35:37.625Z',
      total_quote: '1635175000',
      pretty_total_quote: '$1,635,175,000',
    },
    {
      timestamp: '2022-10-06T15:35:37.625Z',
      total_quote: '1668360300',
      pretty_total_quote: '$1,668,360,300',
    },
    {
      timestamp: '2022-10-05T15:35:37.625Z',
      total_quote: '1670938000',
      pretty_total_quote: '$1,670,938,000',
    },
    {
      timestamp: '2022-10-04T15:35:37.625Z',
      total_quote: '1683522600',
      pretty_total_quote: '$1,683,522,600',
    },
    {
      timestamp: '2022-10-03T15:35:37.625Z',
      total_quote: '1634952200',
      pretty_total_quote: '$1,634,952,200',
    },
    {
      timestamp: '2022-10-02T15:35:37.625Z',
      total_quote: '1577353300',
      pretty_total_quote: '$1,577,353,300',
    },
    {
      timestamp: '2022-10-01T15:35:37.625Z',
      total_quote: '1619122600',
      pretty_total_quote: '$1,619,122,600',
    },
    {
      timestamp: '2022-09-30T15:35:37.625Z',
      total_quote: '1641715000',
      pretty_total_quote: '$1,641,715,000',
    },
    {
      timestamp: '2022-09-29T15:35:37.625Z',
      total_quote: '1649726700',
      pretty_total_quote: '$1,649,726,700',
    },
    {
      timestamp: '2022-09-28T15:35:37.625Z',
      total_quote: '1653173500',
      pretty_total_quote: '$1,653,173,500',
    },
    {
      timestamp: '2022-09-27T15:35:37.625Z',
      total_quote: '1643624400',
      pretty_total_quote: '$1,643,624,400',
    },
    {
      timestamp: '2022-09-26T15:35:37.625Z',
      total_quote: '1649440400',
      pretty_total_quote: '$1,649,440,400',
    },
    {
      timestamp: '2022-09-25T15:35:37.625Z',
      total_quote: '1599641200',
      pretty_total_quote: '$1,599,641,200',
    },
    {
      timestamp: '2022-09-24T15:35:37.625Z',
      total_quote: '1627106800',
      pretty_total_quote: '$1,627,106,800',
    },
    {
      timestamp: '2022-09-23T15:35:37.625Z',
      total_quote: '1639615900',
      pretty_total_quote: '$1,639,615,900',
    },
    {
      timestamp: '2022-09-22T15:35:37.625Z',
      total_quote: '1644892000',
      pretty_total_quote: '$1,644,892,000',
    },
    {
      timestamp: '2022-09-21T15:35:37.625Z',
      total_quote: '1547158400',
      pretty_total_quote: '$1,547,158,400',
    },
    {
      timestamp: '2022-09-20T15:35:37.625Z',
      total_quote: '1634834300',
      pretty_total_quote: '$1,634,834,300',
    },
    {
      timestamp: '2022-09-19T15:35:37.625Z',
      total_quote: '1704792800',
      pretty_total_quote: '$1,704,792,800',
    },
    {
      timestamp: '2022-09-18T15:35:37.625Z',
      total_quote: '1649095300',
      pretty_total_quote: '$1,649,095,300',
    },
    {
      timestamp: '2022-09-17T15:35:37.625Z',
      total_quote: '1816358400',
      pretty_total_quote: '$1,816,358,400',
    },
    {
      timestamp: '2022-09-16T15:35:37.625Z',
      total_quote: '1770152000',
      pretty_total_quote: '$1,770,152,000',
    },
    {
      timestamp: '2022-09-15T15:35:37.625Z',
      total_quote: '1817082200',
      pretty_total_quote: '$1,817,082,200',
    },
    {
      timestamp: '2022-09-14T15:35:37.625Z',
      total_quote: '2019576700',
      pretty_total_quote: '$2,019,576,700',
    },
    {
      timestamp: '2022-09-13T15:35:37.625Z',
      total_quote: '1942975700',
      pretty_total_quote: '$1,942,975,700',
    },
    {
      timestamp: '2022-09-12T15:35:37.625Z',
      total_quote: '2112002200',
      pretty_total_quote: '$2,112,002,200',
    },
    {
      timestamp: '2022-09-11T15:35:37.625Z',
      total_quote: '2176219000',
      pretty_total_quote: '$2,176,219,000',
    },
    {
      timestamp: '2022-09-10T15:35:37.625Z',
      total_quote: '2196280800',
      pretty_total_quote: '$2,196,280,800',
    },
    {
      timestamp: '2022-09-09T15:35:37.625Z',
      total_quote: '2119944400',
      pretty_total_quote: '$2,119,944,400',
    },
    {
      timestamp: '2022-09-08T15:35:37.625Z',
      total_quote: '2020812200',
      pretty_total_quote: '$2,020,812,200',
    },
    {
      timestamp: '2022-09-07T15:35:37.625Z',
      total_quote: '2011694700',
      pretty_total_quote: '$2,011,694,700',
    },
    {
      timestamp: '2022-09-06T15:35:37.625Z',
      total_quote: '1931924200',
      pretty_total_quote: '$1,931,924,200',
    },
    {
      timestamp: '2022-09-05T15:35:37.625Z',
      total_quote: '1998021100',
      pretty_total_quote: '$1,998,021,100',
    },
    {
      timestamp: '2022-09-04T15:35:37.625Z',
      total_quote: '1948869400',
      pretty_total_quote: '$1,948,869,400',
    },
    {
      timestamp: '2022-09-03T15:35:37.625Z',
      total_quote: '1921736200',
      pretty_total_quote: '$1,921,736,200',
    },
    {
      timestamp: '2022-09-02T15:35:37.625Z',
      total_quote: '1944712800',
      pretty_total_quote: '$1,944,712,800',
    },
    {
      timestamp: '2022-09-01T15:35:37.625Z',
      total_quote: '1962891600',
      pretty_total_quote: '$1,962,891,600',
    },
    {
      timestamp: '2022-08-31T15:35:37.625Z',
      total_quote: '1917686700',
      pretty_total_quote: '$1,917,686,700',
    },
    {
      timestamp: '2022-08-30T15:35:37.625Z',
      total_quote: '1882011900',
      pretty_total_quote: '$1,882,011,900',
    },
    {
      timestamp: '2022-08-29T15:35:37.625Z',
      total_quote: '1919579900',
      pretty_total_quote: '$1,919,579,900',
    },
    {
      timestamp: '2022-08-28T15:35:37.625Z',
      total_quote: '1773798700',
      pretty_total_quote: '$1,773,798,700',
    },
    {
      timestamp: '2022-08-27T15:35:37.625Z',
      total_quote: '1848046100',
      pretty_total_quote: '$1,848,046,100',
    },
    {
      timestamp: '2022-08-26T15:35:37.625Z',
      total_quote: '1865778600',
      pretty_total_quote: '$1,865,778,600',
    },
    {
      timestamp: '2022-08-25T15:35:37.625Z',
      total_quote: '2095528100',
      pretty_total_quote: '$2,095,528,100',
    },
    {
      timestamp: '2022-08-24T15:35:37.625Z',
      total_quote: '2046568000',
      pretty_total_quote: '$2,046,568,000',
    },
    {
      timestamp: '2022-08-23T15:35:37.625Z',
      total_quote: '2057511300',
      pretty_total_quote: '$2,057,511,300',
    },
    {
      timestamp: '2022-08-22T15:35:37.625Z',
      total_quote: '2003864300',
      pretty_total_quote: '$2,003,864,300',
    },
    {
      timestamp: '2022-08-21T15:35:37.625Z',
      total_quote: '2005685500',
      pretty_total_quote: '$2,005,685,500',
    },
    {
      timestamp: '2022-08-20T15:35:37.625Z',
      total_quote: '1950664700',
      pretty_total_quote: '$1,950,664,700',
    },
    {
      timestamp: '2022-08-19T15:35:37.625Z',
      total_quote: '1998005600',
      pretty_total_quote: '$1,998,005,600',
    },
    {
      timestamp: '2022-08-18T15:35:37.625Z',
      total_quote: '2284921000',
      pretty_total_quote: '$2,284,921,000',
    },
    {
      timestamp: '2022-08-17T15:35:37.625Z',
      total_quote: '2264865800',
      pretty_total_quote: '$2,264,865,800',
    },
    {
      timestamp: '2022-08-16T15:35:37.625Z',
      total_quote: '2323552300',
      pretty_total_quote: '$2,323,552,300',
    },
    {
      timestamp: '2022-08-15T15:35:37.625Z',
      total_quote: '2358173400',
      pretty_total_quote: '$2,358,173,400',
    },
    {
      timestamp: '2022-08-14T15:35:37.625Z',
      total_quote: '2391489500',
      pretty_total_quote: '$2,391,489,500',
    },
    {
      timestamp: '2022-08-13T15:35:37.625Z',
      total_quote: '2448436700',
      pretty_total_quote: '$2,448,436,700',
    },
    {
      timestamp: '2022-08-12T15:35:37.625Z',
      total_quote: '2419146800',
      pretty_total_quote: '$2,419,146,800',
    },
    {
      timestamp: '2022-08-11T15:35:37.625Z',
      total_quote: '2323291000',
      pretty_total_quote: '$2,323,291,000',
    },
    {
      timestamp: '2022-08-10T15:35:37.625Z',
      total_quote: '2288951800',
      pretty_total_quote: '$2,288,951,800',
    },
    {
      timestamp: '2022-08-09T15:35:37.625Z',
      total_quote: '2095564300',
      pretty_total_quote: '$2,095,564,300',
    },
    {
      timestamp: '2022-08-08T15:35:37.625Z',
      total_quote: '2192726500',
      pretty_total_quote: '$2,192,726,500',
    },
    {
      timestamp: '2022-08-07T15:35:37.625Z',
      total_quote: '2100835600',
      pretty_total_quote: '$2,100,835,600',
    },
    {
      timestamp: '2022-08-06T15:35:37.625Z',
      total_quote: '2090612500',
      pretty_total_quote: '$2,090,612,500',
    },
    {
      timestamp: '2022-08-05T15:35:37.625Z',
      total_quote: '2130234100',
      pretty_total_quote: '$2,130,234,100',
    },
    {
      timestamp: '2022-08-04T15:35:37.625Z',
      total_quote: '1991307900',
      pretty_total_quote: '$1,991,307,900',
    },
    {
      timestamp: '2022-08-03T15:35:37.625Z',
      total_quote: '2001475300',
      pretty_total_quote: '$2,001,475,300',
    },
    {
      timestamp: '2022-08-02T15:35:37.625Z',
      total_quote: '2023802600',
      pretty_total_quote: '$2,023,802,600',
    },
    {
      timestamp: '2022-08-01T15:35:37.625Z',
      total_quote: '2018808700',
      pretty_total_quote: '$2,018,808,700',
    },
    {
      timestamp: '2022-07-31T15:35:37.625Z',
      total_quote: '2080259700',
      pretty_total_quote: '$2,080,259,700',
    },
    {
      timestamp: '2022-07-30T15:35:37.625Z',
      total_quote: '2095811700',
      pretty_total_quote: '$2,095,811,700',
    },
    {
      timestamp: '2022-07-29T15:35:37.625Z',
      total_quote: '2144604700',
      pretty_total_quote: '$2,144,604,700',
    },
    {
      timestamp: '2022-07-28T15:35:37.625Z',
      total_quote: '2128363600',
      pretty_total_quote: '$2,128,363,600',
    },
    {
      timestamp: '2022-07-27T15:35:37.625Z',
      total_quote: '2022231700',
      pretty_total_quote: '$2,022,231,700',
    },
    {
      timestamp: '2022-07-26T15:35:37.625Z',
      total_quote: '1777349100',
      pretty_total_quote: '$1,777,349,100',
    },
    {
      timestamp: '2022-07-25T15:35:37.625Z',
      total_quote: '1785479400',
      pretty_total_quote: '$1,785,479,400',
    },
    {
      timestamp: '2022-07-24T15:35:37.625Z',
      total_quote: '1976650100',
      pretty_total_quote: '$1,976,650,100',
    },
    {
      timestamp: '2022-07-23T15:35:37.625Z',
      total_quote: '1917128600',
      pretty_total_quote: '$1,917,128,600',
    },
    {
      timestamp: '2022-07-22T15:35:37.625Z',
      total_quote: '1896719000',
      pretty_total_quote: '$1,896,719,000',
    },
    {
      timestamp: '2022-07-21T15:35:37.625Z',
      total_quote: '1946477200',
      pretty_total_quote: '$1,946,477,200',
    },
    {
      timestamp: '2022-07-20T15:35:37.625Z',
      total_quote: '1884575200',
      pretty_total_quote: '$1,884,575,200',
    },
    {
      timestamp: '2022-07-19T15:35:37.625Z',
      total_quote: '1905136400',
      pretty_total_quote: '$1,905,136,400',
    },
    {
      timestamp: '2022-07-18T15:35:37.625Z',
      total_quote: '1940296600',
      pretty_total_quote: '$1,940,296,600',
    },
    {
      timestamp: '2022-07-17T15:35:37.625Z',
      total_quote: '1660489300',
      pretty_total_quote: '$1,660,489,300',
    },
    {
      timestamp: '2022-07-16T15:35:37.625Z',
      total_quote: '1672989700',
      pretty_total_quote: '$1,672,989,700',
    },
    {
      timestamp: '2022-07-15T15:35:37.625Z',
      total_quote: '1520165000',
      pretty_total_quote: '$1,520,165,000',
    },
    {
      timestamp: '2022-07-14T15:35:37.625Z',
      total_quote: '1470849300',
      pretty_total_quote: '$1,470,849,300',
    },
    {
      timestamp: '2022-07-13T15:35:37.625Z',
      total_quote: '1375810300',
      pretty_total_quote: '$1,375,810,300',
    },
    {
      timestamp: '2022-07-12T15:35:37.625Z',
      total_quote: '1284350200',
      pretty_total_quote: '$1,284,350,200',
    },
    {
      timestamp: '2022-07-11T15:35:37.625Z',
      total_quote: '1354853500',
      pretty_total_quote: '$1,354,853,500',
    },
    {
      timestamp: '2022-07-10T15:35:37.625Z',
      total_quote: '1443060100',
      pretty_total_quote: '$1,443,060,100',
    },
    {
      timestamp: '2022-07-09T15:35:37.625Z',
      total_quote: '1502678300',
      pretty_total_quote: '$1,502,678,300',
    },
    {
      timestamp: '2022-07-08T15:35:37.625Z',
      total_quote: '1522073600',
      pretty_total_quote: '$1,522,073,600',
    },
    {
      timestamp: '2022-07-07T15:35:37.625Z',
      total_quote: '1530970200',
      pretty_total_quote: '$1,530,970,200',
    },
    {
      timestamp: '2022-07-06T15:35:37.625Z',
      total_quote: '1466581800',
      pretty_total_quote: '$1,466,581,800',
    },
    {
      timestamp: '2022-07-05T15:35:37.625Z',
      total_quote: '1399700000',
      pretty_total_quote: '$1,399,700,000',
    },
    {
      timestamp: '2022-07-04T15:35:37.625Z',
      total_quote: '1424112400',
      pretty_total_quote: '$1,424,112,400',
    },
    {
      timestamp: '2022-07-03T15:35:37.625Z',
      total_quote: '1326401200',
      pretty_total_quote: '$1,326,401,200',
    },
    {
      timestamp: '2022-07-02T15:35:37.625Z',
      total_quote: '1319574300',
      pretty_total_quote: '$1,319,574,300',
    },
    {
      timestamp: '2022-07-01T15:35:37.625Z',
      total_quote: '1320287500',
      pretty_total_quote: '$1,320,287,500',
    },
    {
      timestamp: '2022-06-30T15:35:37.625Z',
      total_quote: '1313337600',
      pretty_total_quote: '$1,313,337,600',
    },
    {
      timestamp: '2022-06-29T15:35:37.625Z',
      total_quote: '1355953900',
      pretty_total_quote: '$1,355,953,900',
    },
    {
      timestamp: '2022-06-28T15:35:37.625Z',
      total_quote: '1412651900',
      pretty_total_quote: '$1,412,651,900',
    },
    {
      timestamp: '2022-06-27T15:35:37.625Z',
      total_quote: '1474105300',
      pretty_total_quote: '$1,474,105,300',
    },
    {
      timestamp: '2022-06-26T15:35:37.625Z',
      total_quote: '1481906600',
      pretty_total_quote: '$1,481,906,600',
    },
    {
      timestamp: '2022-06-25T15:35:37.625Z',
      total_quote: '1537642900',
      pretty_total_quote: '$1,537,642,900',
    },
    {
      timestamp: '2022-06-24T15:35:37.625Z',
      total_quote: '1515911700',
      pretty_total_quote: '$1,515,911,700',
    },
    {
      timestamp: '2022-06-23T15:35:37.625Z',
      total_quote: '1413354600',
      pretty_total_quote: '$1,413,354,600',
    },
    {
      timestamp: '2022-06-22T15:35:37.625Z',
      total_quote: '1297671200',
      pretty_total_quote: '$1,297,671,200',
    },
    {
      timestamp: '2022-06-21T15:35:37.625Z',
      total_quote: '1388948900',
      pretty_total_quote: '$1,388,948,900',
    },
    {
      timestamp: '2022-06-20T15:35:37.625Z',
      total_quote: '1397506700',
      pretty_total_quote: '$1,397,506,700',
    },
    {
      timestamp: '2022-06-19T15:35:37.625Z',
      total_quote: '1390377300',
      pretty_total_quote: '$1,390,377,300',
    },
    {
      timestamp: '2022-06-18T15:35:37.625Z',
      total_quote: '1229168400',
      pretty_total_quote: '$1,229,168,400',
    },
    {
      timestamp: '2022-06-17T15:35:37.625Z',
      total_quote: '1343023500',
      pretty_total_quote: '$1,343,023,500',
    },
    {
      timestamp: '2022-06-16T15:35:37.625Z',
      total_quote: '1319406300',
      pretty_total_quote: '$1,319,406,300',
    },
    {
      timestamp: '2022-06-15T15:35:37.625Z',
      total_quote: '1518873500',
      pretty_total_quote: '$1,518,873,500',
    },
    {
      timestamp: '2022-06-14T15:35:37.625Z',
      total_quote: '1501071900',
      pretty_total_quote: '$1,501,071,900',
    },
    {
      timestamp: '2022-06-13T15:35:37.625Z',
      total_quote: '1490312000',
      pretty_total_quote: '$1,490,312,000',
    },
    {
      timestamp: '2022-06-12T15:35:37.625Z',
      total_quote: '1785151200',
      pretty_total_quote: '$1,785,151,200',
    },
    {
      timestamp: '2022-06-11T15:35:37.625Z',
      total_quote: '1889384100',
      pretty_total_quote: '$1,889,384,100',
    },
    {
      timestamp: '2022-06-10T15:35:37.625Z',
      total_quote: '2054864600',
      pretty_total_quote: '$2,054,864,600',
    },
    {
      timestamp: '2022-06-09T15:35:37.625Z',
      total_quote: '2207935500',
      pretty_total_quote: '$2,207,935,500',
    },
    {
      timestamp: '2022-06-08T15:35:37.625Z',
      total_quote: '2215384600',
      pretty_total_quote: '$2,215,384,600',
    },
    {
      timestamp: '2022-06-07T15:35:37.625Z',
      total_quote: '2243939300',
      pretty_total_quote: '$2,243,939,300',
    },
    {
      timestamp: '2022-06-06T15:35:37.625Z',
      total_quote: '2296551200',
      pretty_total_quote: '$2,296,551,200',
    },
    {
      timestamp: '2022-06-05T15:35:37.625Z',
      total_quote: '2228344600',
      pretty_total_quote: '$2,228,344,600',
    },
    {
      timestamp: '2022-06-04T15:35:37.625Z',
      total_quote: '2228140500',
      pretty_total_quote: '$2,228,140,500',
    },
    {
      timestamp: '2022-06-03T15:35:37.625Z',
      total_quote: '2193710800',
      pretty_total_quote: '$2,193,710,800',
    },
    {
      timestamp: '2022-06-02T15:35:37.625Z',
      total_quote: '2263163600',
      pretty_total_quote: '$2,263,163,600',
    },
    {
      timestamp: '2022-06-01T15:35:37.625Z',
      total_quote: '2257188600',
      pretty_total_quote: '$2,257,188,600',
    },
    {
      timestamp: '2022-05-31T15:35:37.625Z',
      total_quote: '2402375400',
      pretty_total_quote: '$2,402,375,400',
    },
    {
      timestamp: '2022-05-30T15:35:37.625Z',
      total_quote: '2464130300',
      pretty_total_quote: '$2,464,130,300',
    },
    {
      timestamp: '2022-05-29T15:35:37.625Z',
      total_quote: '2241285000',
      pretty_total_quote: '$2,241,285,000',
    },
    {
      timestamp: '2022-05-28T15:35:37.625Z',
      total_quote: '2219594500',
      pretty_total_quote: '$2,219,594,500',
    },
    {
      timestamp: '2022-05-27T15:35:37.625Z',
      total_quote: '2129801900',
      pretty_total_quote: '$2,129,801,900',
    },
    {
      timestamp: '2022-05-26T15:35:37.625Z',
      total_quote: '2232798700',
      pretty_total_quote: '$2,232,798,700',
    },
    {
      timestamp: '2022-05-25T15:35:37.625Z',
      total_quote: '2399934000',
      pretty_total_quote: '$2,399,934,000',
    },
    {
      timestamp: '2022-05-24T15:35:37.625Z',
      total_quote: '2443900400',
      pretty_total_quote: '$2,443,900,400',
    },
    {
      timestamp: '2022-05-23T15:35:37.625Z',
      total_quote: '2439562800',
      pretty_total_quote: '$2,439,562,800',
    },
    {
      timestamp: '2022-05-22T15:35:37.625Z',
      total_quote: '2525801700',
      pretty_total_quote: '$2,525,801,700',
    },
    {
      timestamp: '2022-05-21T15:35:37.625Z',
      total_quote: '2442703400',
      pretty_total_quote: '$2,442,703,400',
    },
    {
      timestamp: '2022-05-20T15:35:37.625Z',
      total_quote: '2424438800',
      pretty_total_quote: '$2,424,438,800',
    },
    {
      timestamp: '2022-05-19T15:35:37.625Z',
      total_quote: '2500976400',
      pretty_total_quote: '$2,500,976,400',
    },
    {
      timestamp: '2022-05-18T15:35:37.625Z',
      total_quote: '2366164200',
      pretty_total_quote: '$2,366,164,200',
    },
    {
      timestamp: '2022-05-17T15:35:37.625Z',
      total_quote: '2587576600',
      pretty_total_quote: '$2,587,576,600',
    },
    {
      timestamp: '2022-05-16T15:35:37.625Z',
      total_quote: '2500982500',
      pretty_total_quote: '$2,500,982,500',
    },
    {
      timestamp: '2022-05-15T15:35:37.625Z',
      total_quote: '2653170400',
      pretty_total_quote: '$2,653,170,400',
    },
    {
      timestamp: '2022-05-14T15:35:37.625Z',
      total_quote: '2548812000',
      pretty_total_quote: '$2,548,812,000',
    },
    {
      timestamp: '2022-05-13T15:35:37.625Z',
      total_quote: '2486307000',
      pretty_total_quote: '$2,486,307,000',
    },
    {
      timestamp: '2022-05-12T15:35:37.625Z',
      total_quote: '2428847600',
      pretty_total_quote: '$2,428,847,600',
    },
    {
      timestamp: '2022-05-11T15:35:37.625Z',
      total_quote: '2571718700',
      pretty_total_quote: '$2,571,718,700',
    },
    {
      timestamp: '2022-05-10T15:35:37.625Z',
      total_quote: '2895944200',
      pretty_total_quote: '$2,895,944,200',
    },
    {
      timestamp: '2022-05-09T15:35:37.625Z',
      total_quote: '2775217000',
      pretty_total_quote: '$2,775,217,000',
    },
    {
      timestamp: '2022-05-08T15:35:37.625Z',
      total_quote: '3110962400',
      pretty_total_quote: '$3,110,962,400',
    },
    {
      timestamp: '2022-05-07T15:35:37.625Z',
      total_quote: '3262751200',
      pretty_total_quote: '$3,262,751,200',
    },
    {
      timestamp: '2022-05-06T15:35:37.625Z',
      total_quote: '3337077500',
      pretty_total_quote: '$3,337,077,500',
    },
    {
      timestamp: '2022-05-05T15:35:37.625Z',
      total_quote: '3399790600',
      pretty_total_quote: '$3,399,790,600',
    },
    {
      timestamp: '2022-05-04T15:35:37.625Z',
      total_quote: '3632620300',
      pretty_total_quote: '$3,632,620,300',
    },
    {
      timestamp: '2022-05-03T15:35:37.625Z',
      total_quote: '3437297400',
      pretty_total_quote: '$3,437,297,400',
    },
    {
      timestamp: '2022-05-02T15:35:37.625Z',
      total_quote: '3532425200',
      pretty_total_quote: '$3,532,425,200',
    },
    {
      timestamp: '2022-05-01T15:35:37.625Z',
      total_quote: '3499582200',
      pretty_total_quote: '$3,499,582,200',
    },
    {
      timestamp: '2022-04-30T15:35:37.625Z',
      total_quote: '3385856500',
      pretty_total_quote: '$3,385,856,500',
    },
    {
      timestamp: '2022-04-29T15:35:37.625Z',
      total_quote: '3479379500',
      pretty_total_quote: '$3,479,379,500',
    },
    {
      timestamp: '2022-04-28T15:35:37.625Z',
      total_quote: '3622147800',
      pretty_total_quote: '$3,622,147,800',
    },
    {
      timestamp: '2022-04-27T15:35:37.625Z',
      total_quote: '3568008700',
      pretty_total_quote: '$3,568,008,700',
    },
    {
      timestamp: '2022-04-26T15:35:37.625Z',
      total_quote: '3464672000',
      pretty_total_quote: '$3,464,672,000',
    },
    {
      timestamp: '2022-04-25T15:35:37.625Z',
      total_quote: '3716138800',
      pretty_total_quote: '$3,716,138,800',
    },
    {
      timestamp: '2022-04-24T15:35:37.625Z',
      total_quote: '3607859700',
      pretty_total_quote: '$3,607,859,700',
    },
    {
      timestamp: '2022-04-23T15:35:37.625Z',
      total_quote: '3634860300',
      pretty_total_quote: '$3,634,860,300',
    },
    {
      timestamp: '2022-04-22T15:35:37.625Z',
      total_quote: '3661785000',
      pretty_total_quote: '$3,661,785,000',
    },
    {
      timestamp: '2022-04-21T15:35:37.625Z',
      total_quote: '3690564600',
      pretty_total_quote: '$3,690,564,600',
    },
    {
      timestamp: '2022-04-20T15:35:37.625Z',
      total_quote: '3802626300',
      pretty_total_quote: '$3,802,626,300',
    },
    {
      timestamp: '2022-04-19T15:35:37.625Z',
      total_quote: '3833401600',
      pretty_total_quote: '$3,833,401,600',
    },
    {
      timestamp: '2022-04-18T15:35:37.625Z',
      total_quote: '3780875800',
      pretty_total_quote: '$3,780,875,800',
    },
    {
      timestamp: '2022-04-17T15:35:37.625Z',
      total_quote: '3700658400',
      pretty_total_quote: '$3,700,658,400',
    },
    {
      timestamp: '2022-04-16T15:35:37.625Z',
      total_quote: '3785271000',
      pretty_total_quote: '$3,785,271,000',
    },
    {
      timestamp: '2022-04-15T15:35:37.625Z',
      total_quote: '3759288300',
      pretty_total_quote: '$3,759,288,300',
    },
    {
      timestamp: '2022-04-14T15:35:37.625Z',
      total_quote: '3733039900',
      pretty_total_quote: '$3,733,039,900',
    },
    {
      timestamp: '2022-04-13T15:35:37.625Z',
      total_quote: '3855793400',
      pretty_total_quote: '$3,855,793,400',
    },
    {
      timestamp: '2022-04-12T15:35:37.625Z',
      total_quote: '3753332700',
      pretty_total_quote: '$3,753,332,700',
    },
    {
      timestamp: '2022-04-11T15:35:37.625Z',
      total_quote: '3697262600',
      pretty_total_quote: '$3,697,262,600',
    },
    {
      timestamp: '2022-04-10T15:35:37.625Z',
      total_quote: '3971753500',
      pretty_total_quote: '$3,971,753,500',
    },
    {
      timestamp: '2022-04-09T15:35:37.625Z',
      total_quote: '4032863700',
      pretty_total_quote: '$4,032,863,700',
    },
    {
      timestamp: '2022-04-08T15:35:37.625Z',
      total_quote: '3945673500',
      pretty_total_quote: '$3,945,673,500',
    },
    {
      timestamp: '2022-04-07T15:35:37.625Z',
      total_quote: '3992193300',
      pretty_total_quote: '$3,992,193,300',
    },
    {
      timestamp: '2022-04-06T15:35:37.625Z',
      total_quote: '3913964500',
      pretty_total_quote: '$3,913,964,500',
    },
    {
      timestamp: '2022-04-05T15:35:37.625Z',
      total_quote: '4219992600',
      pretty_total_quote: '$4,219,992,600',
    },
    {
      timestamp: '2022-04-04T15:35:37.625Z',
      total_quote: '4347457000',
      pretty_total_quote: '$4,347,457,000',
    },
    {
      timestamp: '2022-04-03T15:35:37.625Z',
      total_quote: '4349257000',
      pretty_total_quote: '$4,349,257,000',
    },
    {
      timestamp: '2022-04-02T15:35:37.625Z',
      total_quote: '4247340300',
      pretty_total_quote: '$4,247,340,300',
    },
    {
      timestamp: '2022-04-01T15:35:37.625Z',
      total_quote: '4261624000',
      pretty_total_quote: '$4,261,624,000',
    },
    {
      timestamp: '2022-03-31T15:35:37.625Z',
      total_quote: '4053653800',
      pretty_total_quote: '$4,053,653,800',
    },
    {
      timestamp: '2022-03-30T15:35:37.625Z',
      total_quote: '4177094700',
      pretty_total_quote: '$4,177,094,700',
    },
    {
      timestamp: '2022-03-29T15:35:37.625Z',
      total_quote: '4199413800',
      pretty_total_quote: '$4,199,413,800',
    },
    {
      timestamp: '2022-03-28T15:35:37.625Z',
      total_quote: '4105257500',
      pretty_total_quote: '$4,105,257,500',
    },
    {
      timestamp: '2022-03-27T15:35:37.625Z',
      total_quote: '4053174300',
      pretty_total_quote: '$4,053,174,300',
    },
    {
      timestamp: '2022-03-26T15:35:37.625Z',
      total_quote: '3880491000',
      pretty_total_quote: '$3,880,491,000',
    },
    {
      timestamp: '2022-03-25T15:35:37.625Z',
      total_quote: '3834020000',
      pretty_total_quote: '$3,834,020,000',
    },
    {
      timestamp: '2022-03-24T15:35:37.625Z',
      total_quote: '3835925000',
      pretty_total_quote: '$3,835,925,000',
    },
    {
      timestamp: '2022-03-23T15:35:37.625Z',
      total_quote: '3737929000',
      pretty_total_quote: '$3,737,929,000',
    },
    {
      timestamp: '2022-03-22T15:35:37.625Z',
      total_quote: '3670274000',
      pretty_total_quote: '$3,670,274,000',
    },
    {
      timestamp: '2022-03-21T15:35:37.625Z',
      total_quote: '3576422700',
      pretty_total_quote: '$3,576,422,700',
    },
    {
      timestamp: '2022-03-20T15:35:37.625Z',
      total_quote: '3534508800',
      pretty_total_quote: '$3,534,508,800',
    },
    {
      timestamp: '2022-03-19T15:35:37.625Z',
      total_quote: '3640096800',
      pretty_total_quote: '$3,640,096,800',
    },
    {
      timestamp: '2022-03-18T15:35:37.625Z',
      total_quote: '3638901000',
      pretty_total_quote: '$3,638,901,000',
    },
    {
      timestamp: '2022-03-17T15:35:37.625Z',
      total_quote: '3479604700',
      pretty_total_quote: '$3,479,604,700',
    },
    {
      timestamp: '2022-03-16T15:35:37.625Z',
      total_quote: '3424062500',
      pretty_total_quote: '$3,424,062,500',
    },
    {
      timestamp: '2022-03-15T15:35:37.625Z',
      total_quote: '3234493200',
      pretty_total_quote: '$3,234,493,200',
    },
    {
      timestamp: '2022-03-14T15:35:37.625Z',
      total_quote: '3201405000',
      pretty_total_quote: '$3,201,405,000',
    },
    {
      timestamp: '2022-03-13T15:35:37.625Z',
      total_quote: '3110779600',
      pretty_total_quote: '$3,110,779,600',
    },
    {
      timestamp: '2022-03-12T15:35:37.625Z',
      total_quote: '3180042200',
      pretty_total_quote: '$3,180,042,200',
    },
    {
      timestamp: '2022-03-11T15:35:37.625Z',
      total_quote: '3160076000',
      pretty_total_quote: '$3,160,076,000',
    },
    {
      timestamp: '2022-03-10T15:35:37.625Z',
      total_quote: '3222955000',
      pretty_total_quote: '$3,222,955,000',
    },
    {
      timestamp: '2022-03-09T15:35:37.625Z',
      total_quote: '3371846700',
      pretty_total_quote: '$3,371,846,700',
    },
    {
      timestamp: '2022-03-08T15:35:37.625Z',
      total_quote: '3181103900',
      pretty_total_quote: '$3,181,103,900',
    },
    {
      timestamp: '2022-03-07T15:35:37.625Z',
      total_quote: '3087431200',
      pretty_total_quote: '$3,087,431,200',
    },
    {
      timestamp: '2022-03-06T15:35:37.625Z',
      total_quote: '3159185700',
      pretty_total_quote: '$3,159,185,700',
    },
    {
      timestamp: '2022-03-05T15:35:37.625Z',
      total_quote: '3296536000',
      pretty_total_quote: '$3,296,536,000',
    },
    {
      timestamp: '2022-03-04T15:35:37.625Z',
      total_quote: '3236063000',
      pretty_total_quote: '$3,236,063,000',
    },
    {
      timestamp: '2022-03-03T15:35:37.625Z',
      total_quote: '3503813000',
      pretty_total_quote: '$3,503,813,000',
    },
    {
      timestamp: '2022-03-02T15:35:37.625Z',
      total_quote: '3647847000',
      pretty_total_quote: '$3,647,847,000',
    },
    {
      timestamp: '2022-03-01T15:35:37.625Z',
      total_quote: '3678630700',
      pretty_total_quote: '$3,678,630,700',
    },
    {
      timestamp: '2022-02-28T15:35:37.625Z',
      total_quote: '3604371200',
      pretty_total_quote: '$3,604,371,200',
    },
    {
      timestamp: '2022-02-27T15:35:37.625Z',
      total_quote: '3248297200',
      pretty_total_quote: '$3,248,297,200',
    },
    {
      timestamp: '2022-02-26T15:35:37.625Z',
      total_quote: '3434116400',
      pretty_total_quote: '$3,434,116,400',
    },
    {
      timestamp: '2022-02-25T15:35:37.625Z',
      total_quote: '3422916900',
      pretty_total_quote: '$3,422,916,900',
    },
    {
      timestamp: '2022-02-24T15:35:37.625Z',
      total_quote: '3211095800',
      pretty_total_quote: '$3,211,095,800',
    },
    {
      timestamp: '2022-02-23T15:35:37.625Z',
      total_quote: '3204701400',
      pretty_total_quote: '$3,204,701,400',
    },
    {
      timestamp: '2022-02-22T15:35:37.625Z',
      total_quote: '3267158300',
      pretty_total_quote: '$3,267,158,300',
    },
    {
      timestamp: '2022-02-21T15:35:37.625Z',
      total_quote: '3180227300',
      pretty_total_quote: '$3,180,227,300',
    },
    {
      timestamp: '2022-02-20T15:35:37.625Z',
      total_quote: '3251487700',
      pretty_total_quote: '$3,251,487,700',
    },
    {
      timestamp: '2022-02-19T15:35:37.625Z',
      total_quote: '3420213000',
      pretty_total_quote: '$3,420,213,000',
    },
    {
      timestamp: '2022-02-18T15:35:37.625Z',
      total_quote: '3444293600',
      pretty_total_quote: '$3,444,293,600',
    },
    {
      timestamp: '2022-02-17T15:35:37.625Z',
      total_quote: '3558334000',
      pretty_total_quote: '$3,558,334,000',
    },
    {
      timestamp: '2022-02-16T15:35:37.625Z',
      total_quote: '3870015000',
      pretty_total_quote: '$3,870,015,000',
    },
    {
      timestamp: '2022-02-15T15:35:37.625Z',
      total_quote: '3925522400',
      pretty_total_quote: '$3,925,522,400',
    },
    {
      timestamp: '2022-02-14T15:35:37.625Z',
      total_quote: '3627036400',
      pretty_total_quote: '$3,627,036,400',
    },
    {
      timestamp: '2022-02-13T15:35:37.625Z',
      total_quote: '3567121200',
      pretty_total_quote: '$3,567,121,200',
    },
    {
      timestamp: '2022-02-12T15:35:37.625Z',
      total_quote: '3606356700',
      pretty_total_quote: '$3,606,356,700',
    },
    {
      timestamp: '2022-02-11T15:35:37.625Z',
      total_quote: '3621356300',
      pretty_total_quote: '$3,621,356,300',
    },
    {
      timestamp: '2022-02-10T15:35:37.625Z',
      total_quote: '3807746800',
      pretty_total_quote: '$3,807,746,800',
    },
    {
      timestamp: '2022-02-09T15:35:37.625Z',
      total_quote: '4003043800',
      pretty_total_quote: '$4,003,043,800',
    },
    {
      timestamp: '2022-02-08T15:35:37.625Z',
      total_quote: '3861898200',
      pretty_total_quote: '$3,861,898,200',
    },
    {
      timestamp: '2022-02-07T15:35:37.625Z',
      total_quote: '3888244500',
      pretty_total_quote: '$3,888,244,500',
    },
    {
      timestamp: '2022-02-06T15:35:37.625Z',
      total_quote: '3782436600',
      pretty_total_quote: '$3,782,436,600',
    },
    {
      timestamp: '2022-02-05T15:35:37.625Z',
      total_quote: '3728428500',
      pretty_total_quote: '$3,728,428,500',
    },
    {
      timestamp: '2022-02-04T15:35:37.625Z',
      total_quote: '3699100700',
      pretty_total_quote: '$3,699,100,700',
    },
    {
      timestamp: '2022-02-03T15:35:37.625Z',
      total_quote: '3290254000',
      pretty_total_quote: '$3,290,254,000',
    },
    {
      timestamp: '2022-02-02T15:35:37.625Z',
      total_quote: '3321636400',
      pretty_total_quote: '$3,321,636,400',
    },
    {
      timestamp: '2022-02-01T15:35:37.625Z',
      total_quote: '3457673700',
      pretty_total_quote: '$3,457,673,700',
    },
    {
      timestamp: '2022-01-31T15:35:37.625Z',
      total_quote: '3327668500',
      pretty_total_quote: '$3,327,668,500',
    },
    {
      timestamp: '2022-01-30T15:35:37.625Z',
      total_quote: '3223140600',
      pretty_total_quote: '$3,223,140,600',
    },
    {
      timestamp: '2022-01-29T15:35:37.625Z',
      total_quote: '3220182500',
      pretty_total_quote: '$3,220,182,500',
    },
    {
      timestamp: '2022-01-28T15:35:37.625Z',
      total_quote: '3152061700',
      pretty_total_quote: '$3,152,061,700',
    },
    {
      timestamp: '2022-01-27T15:35:37.625Z',
      total_quote: '2992424200',
      pretty_total_quote: '$2,992,424,200',
    },
    {
      timestamp: '2022-01-26T15:35:37.625Z',
      total_quote: '3050467300',
      pretty_total_quote: '$3,050,467,300',
    },
    {
      timestamp: '2022-01-25T15:35:37.625Z',
      total_quote: '3042691800',
      pretty_total_quote: '$3,042,691,800',
    },
    {
      timestamp: '2022-01-24T15:35:37.625Z',
      total_quote: '3026692900',
      pretty_total_quote: '$3,026,692,900',
    },
    {
      timestamp: '2022-01-23T15:35:37.625Z',
      total_quote: '3132147200',
      pretty_total_quote: '$3,132,147,200',
    },
    {
      timestamp: '2022-01-22T15:35:37.625Z',
      total_quote: '2982922200',
      pretty_total_quote: '$2,982,922,200',
    },
    {
      timestamp: '2022-01-21T15:35:37.625Z',
      total_quote: '3161212400',
      pretty_total_quote: '$3,161,212,400',
    },
    {
      timestamp: '2022-01-20T15:35:37.625Z',
      total_quote: '3713096700',
      pretty_total_quote: '$3,713,096,700',
    },
    {
      timestamp: '2022-01-19T15:35:37.625Z',
      total_quote: '3827232800',
      pretty_total_quote: '$3,827,232,800',
    },
    {
      timestamp: '2022-01-18T15:35:37.625Z',
      total_quote: '3907274800',
      pretty_total_quote: '$3,907,274,800',
    },
    {
      timestamp: '2022-01-17T15:35:37.625Z',
      total_quote: '3973627100',
      pretty_total_quote: '$3,973,627,100',
    },
    {
      timestamp: '2022-01-16T15:35:37.625Z',
      total_quote: '4140940800',
      pretty_total_quote: '$4,140,940,800',
    },
    {
      timestamp: '2022-01-15T15:35:37.625Z',
      total_quote: '4117053200',
      pretty_total_quote: '$4,117,053,200',
    },
    {
      timestamp: '2022-01-14T15:35:37.625Z',
      total_quote: '4088486700',
      pretty_total_quote: '$4,088,486,700',
    },
    {
      timestamp: '2022-01-13T15:35:37.625Z',
      total_quote: '4015329300',
      pretty_total_quote: '$4,015,329,300',
    },
    {
      timestamp: '2022-01-12T15:35:37.625Z',
      total_quote: '4169184800',
      pretty_total_quote: '$4,169,184,800',
    },
    {
      timestamp: '2022-01-11T15:35:37.625Z',
      total_quote: '4007787500',
      pretty_total_quote: '$4,007,787,500',
    },
    {
      timestamp: '2022-01-10T15:35:37.625Z',
      total_quote: '3811121200',
      pretty_total_quote: '$3,811,121,200',
    },
    {
      timestamp: '2022-01-09T15:35:37.625Z',
      total_quote: '3890902300',
      pretty_total_quote: '$3,890,902,300',
    },
    {
      timestamp: '2022-01-08T15:35:37.625Z',
      total_quote: '3822675500',
      pretty_total_quote: '$3,822,675,500',
    },
    {
      timestamp: '2022-01-07T15:35:37.625Z',
      total_quote: '3947329800',
      pretty_total_quote: '$3,947,329,800',
    },
    {
      timestamp: '2022-01-06T15:35:37.625Z',
      total_quote: '4220478000',
      pretty_total_quote: '$4,220,478,000',
    },
    {
      timestamp: '2022-01-05T15:35:37.625Z',
      total_quote: '4397945300',
      pretty_total_quote: '$4,397,945,300',
    },
    {
      timestamp: '2022-01-04T15:35:37.625Z',
      total_quote: '4686632400',
      pretty_total_quote: '$4,686,632,400',
    },
    {
      timestamp: '2022-01-03T15:35:37.625Z',
      total_quote: '4656047600',
      pretty_total_quote: '$4,656,047,600',
    },
    {
      timestamp: '2022-01-02T15:35:37.625Z',
      total_quote: '4736184000',
      pretty_total_quote: '$4,736,184,000',
    },
    {
      timestamp: '2022-01-01T15:35:37.625Z',
      total_quote: '4677001000',
      pretty_total_quote: '$4,677,001,000',
    },
    {
      timestamp: '2021-12-31T15:35:37.625Z',
      total_quote: '4544169500',
      pretty_total_quote: '$4,544,169,500',
    },
    {
      timestamp: '2021-12-30T15:35:37.625Z',
      total_quote: '4585997300',
      pretty_total_quote: '$4,585,997,300',
    },
    {
      timestamp: '2021-12-29T15:35:37.625Z',
      total_quote: '4493089300',
      pretty_total_quote: '$4,493,089,300',
    },
    {
      timestamp: '2021-12-28T15:35:37.625Z',
      total_quote: '4702814700',
      pretty_total_quote: '$4,702,814,700',
    },
    {
      timestamp: '2021-12-27T15:35:37.625Z',
      total_quote: '4994340000',
      pretty_total_quote: '$4,994,340,000',
    },
    {
      timestamp: '2021-12-26T15:35:37.625Z',
      total_quote: '5033256400',
      pretty_total_quote: '$5,033,256,400',
    },
    {
      timestamp: '2021-12-25T15:35:37.625Z',
      total_quote: '5069046000',
      pretty_total_quote: '$5,069,046,000',
    },
    {
      timestamp: '2021-12-24T15:35:37.625Z',
      total_quote: '5012693500',
      pretty_total_quote: '$5,012,693,500',
    },
    {
      timestamp: '2021-12-23T15:35:37.625Z',
      total_quote: '5082278000',
      pretty_total_quote: '$5,082,278,000',
    },
    {
      timestamp: '2021-12-22T15:35:37.625Z',
      total_quote: '4924950000',
      pretty_total_quote: '$4,924,950,000',
    },
    {
      timestamp: '2021-12-21T15:35:37.625Z',
      total_quote: '4979785700',
      pretty_total_quote: '$4,979,785,700',
    },
    {
      timestamp: '2021-12-20T15:35:37.625Z',
      total_quote: '4876333600',
      pretty_total_quote: '$4,876,333,600',
    },
    {
      timestamp: '2021-12-19T15:35:37.625Z',
      total_quote: '4846822000',
      pretty_total_quote: '$4,846,822,000',
    },
    {
      timestamp: '2021-12-18T15:35:37.625Z',
      total_quote: '4898777000',
      pretty_total_quote: '$4,898,777,000',
    },
    {
      timestamp: '2021-12-17T15:35:37.625Z',
      total_quote: '4800800000',
      pretty_total_quote: '$4,800,800,000',
    },
    {
      timestamp: '2021-12-16T15:35:37.625Z',
      total_quote: '4904226000',
      pretty_total_quote: '$4,904,226,000',
    },
    {
      timestamp: '2021-12-15T15:35:37.625Z',
      total_quote: '4972787000',
      pretty_total_quote: '$4,972,787,000',
    },
    {
      timestamp: '2021-12-14T15:35:37.625Z',
      total_quote: '4779737600',
      pretty_total_quote: '$4,779,737,600',
    },
    {
      timestamp: '2021-12-13T15:35:37.625Z',
      total_quote: '4669308000',
      pretty_total_quote: '$4,669,308,000',
    },
    {
      timestamp: '2021-12-12T15:35:37.625Z',
      total_quote: '5106817500',
      pretty_total_quote: '$5,106,817,500',
    },
    {
      timestamp: '2021-12-11T15:35:37.625Z',
      total_quote: '5039160000',
      pretty_total_quote: '$5,039,160,000',
    },
    {
      timestamp: '2021-12-10T15:35:37.625Z',
      total_quote: '4836547000',
      pretty_total_quote: '$4,836,547,000',
    },
    {
      timestamp: '2021-12-09T15:35:37.625Z',
      total_quote: '5126826500',
      pretty_total_quote: '$5,126,826,500',
    },
    {
      timestamp: '2021-12-08T15:35:37.625Z',
      total_quote: '5477593000',
      pretty_total_quote: '$5,477,593,000',
    },
    {
      timestamp: '2021-12-07T15:35:37.625Z',
      total_quote: '5329461000',
      pretty_total_quote: '$5,329,461,000',
    },
    {
      timestamp: '2021-12-06T15:35:37.625Z',
      total_quote: '5365181400',
      pretty_total_quote: '$5,365,181,400',
    },
    {
      timestamp: '2021-12-05T15:35:37.625Z',
      total_quote: '5184901600',
      pretty_total_quote: '$5,184,901,600',
    },
    {
      timestamp: '2021-12-04T15:35:37.625Z',
      total_quote: '5068953000',
      pretty_total_quote: '$5,068,953,000',
    },
    {
      timestamp: '2021-12-03T15:35:37.625Z',
      total_quote: '5251135000',
      pretty_total_quote: '$5,251,135,000',
    },
    {
      timestamp: '2021-12-02T15:35:37.625Z',
      total_quote: '5583370000',
      pretty_total_quote: '$5,583,370,000',
    },
    {
      timestamp: '2021-12-01T15:35:37.625Z',
      total_quote: '5665407000',
      pretty_total_quote: '$5,665,407,000',
    },
    {
      timestamp: '2021-11-30T15:35:37.625Z',
      total_quote: '5727135000',
      pretty_total_quote: '$5,727,135,000',
    },
    {
      timestamp: '2021-11-29T15:35:37.625Z',
      total_quote: '5490463000',
      pretty_total_quote: '$5,490,463,000',
    },
    {
      timestamp: '2021-11-28T15:35:37.625Z',
      total_quote: '5293962000',
      pretty_total_quote: '$5,293,962,000',
    },
    {
      timestamp: '2021-11-27T15:35:37.625Z',
      total_quote: '5040513000',
      pretty_total_quote: '$5,040,513,000',
    },
    {
      timestamp: '2021-11-26T15:35:37.625Z',
      total_quote: '5005070300',
      pretty_total_quote: '$5,005,070,300',
    },
    {
      timestamp: '2021-11-25T15:35:37.625Z',
      total_quote: '5573871600',
      pretty_total_quote: '$5,573,871,600',
    },
    {
      timestamp: '2021-11-24T15:35:37.625Z',
      total_quote: '5271114000',
      pretty_total_quote: '$5,271,114,000',
    },
    {
      timestamp: '2021-11-23T15:35:37.625Z',
      total_quote: '5386760000',
      pretty_total_quote: '$5,386,760,000',
    },
    {
      timestamp: '2021-11-22T15:35:37.625Z',
      total_quote: '5064036000',
      pretty_total_quote: '$5,064,036,000',
    },
    {
      timestamp: '2021-11-21T15:35:37.625Z',
      total_quote: '5324369000',
      pretty_total_quote: '$5,324,369,000',
    },
    {
      timestamp: '2021-11-20T15:35:37.625Z',
      total_quote: '5483401000',
      pretty_total_quote: '$5,483,401,000',
    },
    {
      timestamp: '2021-11-19T15:35:37.625Z',
      total_quote: '5343558000',
      pretty_total_quote: '$5,343,558,000',
    },
    {
      timestamp: '2021-11-18T15:35:37.625Z',
      total_quote: '4947866600',
      pretty_total_quote: '$4,947,866,600',
    },
    {
      timestamp: '2021-11-17T15:35:37.625Z',
      total_quote: '5321325600',
      pretty_total_quote: '$5,321,325,600',
    },
    {
      timestamp: '2021-11-16T15:35:37.625Z',
      total_quote: '5233645000',
      pretty_total_quote: '$5,233,645,000',
    },
    {
      timestamp: '2021-11-15T15:35:37.625Z',
      total_quote: '5655600000',
      pretty_total_quote: '$5,655,600,000',
    },
    {
      timestamp: '2021-11-14T15:35:37.625Z',
      total_quote: '5753667000',
      pretty_total_quote: '$5,753,667,000',
    },
    {
      timestamp: '2021-11-13T15:35:37.625Z',
      total_quote: '5765709000',
      pretty_total_quote: '$5,765,709,000',
    },
    {
      timestamp: '2021-11-12T15:35:37.625Z',
      total_quote: '5787823000',
      pretty_total_quote: '$5,787,823,000',
    },
    {
      timestamp: '2021-11-11T15:35:37.625Z',
      total_quote: '5836854000',
      pretty_total_quote: '$5,836,854,000',
    },
    {
      timestamp: '2021-11-10T15:35:37.625Z',
      total_quote: '5740295700',
      pretty_total_quote: '$5,740,295,700',
    },
    {
      timestamp: '2021-11-09T15:35:37.625Z',
      total_quote: '5848618000',
      pretty_total_quote: '$5,848,618,000',
    },
    {
      timestamp: '2021-11-08T15:35:37.625Z',
      total_quote: '5949719600',
      pretty_total_quote: '$5,949,719,600',
    },
    {
      timestamp: '2021-11-07T15:35:37.625Z',
      total_quote: '5706793500',
      pretty_total_quote: '$5,706,793,500',
    },
    {
      timestamp: '2021-11-06T15:35:37.625Z',
      total_quote: '5593425400',
      pretty_total_quote: '$5,593,425,400',
    },
    {
      timestamp: '2021-11-05T15:35:37.625Z',
      total_quote: '5556380700',
      pretty_total_quote: '$5,556,380,700',
    },
    {
      timestamp: '2021-11-04T15:35:37.625Z',
      total_quote: '5620929000',
      pretty_total_quote: '$5,620,929,000',
    },
    {
      timestamp: '2021-11-03T15:35:37.625Z',
      total_quote: '5696045600',
      pretty_total_quote: '$5,696,045,600',
    },
    {
      timestamp: '2021-11-02T15:35:37.625Z',
      total_quote: '5687093000',
      pretty_total_quote: '$5,687,093,000',
    },
    {
      timestamp: '2021-11-01T15:35:37.625Z',
      total_quote: '5348158500',
      pretty_total_quote: '$5,348,158,500',
    },
    {
      timestamp: '2021-10-31T15:35:37.625Z',
      total_quote: '5307529700',
      pretty_total_quote: '$5,307,529,700',
    },
    {
      timestamp: '2021-10-30T15:35:37.625Z',
      total_quote: '5341270000',
      pretty_total_quote: '$5,341,270,000',
    },
    {
      timestamp: '2021-10-29T15:35:37.625Z',
      total_quote: '5455763000',
      pretty_total_quote: '$5,455,763,000',
    },
    {
      timestamp: '2021-10-28T15:35:37.625Z',
      total_quote: '5303649300',
      pretty_total_quote: '$5,303,649,300',
    },
    {
      timestamp: '2021-10-27T15:35:37.625Z',
      total_quote: '4879982600',
      pretty_total_quote: '$4,879,982,600',
    },
    {
      timestamp: '2021-10-26T15:35:37.625Z',
      total_quote: '5125393000',
      pretty_total_quote: '$5,125,393,000',
    },
    {
      timestamp: '2021-10-25T15:35:37.625Z',
      total_quote: '5220406000',
      pretty_total_quote: '$5,220,406,000',
    },
    {
      timestamp: '2021-10-24T15:35:37.625Z',
      total_quote: '5058464000',
      pretty_total_quote: '$5,058,464,000',
    },
    {
      timestamp: '2021-10-23T15:35:37.625Z',
      total_quote: '5157757400',
      pretty_total_quote: '$5,157,757,400',
    },
    {
      timestamp: '2021-10-22T15:35:37.625Z',
      total_quote: '4928039400',
      pretty_total_quote: '$4,928,039,400',
    },
    {
      timestamp: '2021-10-21T15:35:37.625Z',
      total_quote: '5033681400',
      pretty_total_quote: '$5,033,681,400',
    },
    {
      timestamp: '2021-10-20T15:35:37.625Z',
      total_quote: '5147012600',
      pretty_total_quote: '$5,147,012,600',
    },
    {
      timestamp: '2021-10-19T15:35:37.625Z',
      total_quote: '4811211300',
      pretty_total_quote: '$4,811,211,300',
    },
    {
      timestamp: '2021-10-18T15:35:37.625Z',
      total_quote: '4638495000',
      pretty_total_quote: '$4,638,495,000',
    },
    {
      timestamp: '2021-10-17T15:35:37.625Z',
      total_quote: '4759156700',
      pretty_total_quote: '$4,759,156,700',
    },
    {
      timestamp: '2021-10-16T15:35:37.625Z',
      total_quote: '4755433500',
      pretty_total_quote: '$4,755,433,500',
    },
    {
      timestamp: '2021-10-15T15:35:37.625Z',
      total_quote: '4799509500',
      pretty_total_quote: '$4,799,509,500',
    },
    {
      timestamp: '2021-10-14T15:35:37.625Z',
      total_quote: '4682007000',
      pretty_total_quote: '$4,682,007,000',
    },
    {
      timestamp: '2021-10-13T15:35:37.625Z',
      total_quote: '4453338600',
      pretty_total_quote: '$4,453,338,600',
    },
    {
      timestamp: '2021-10-12T15:35:37.625Z',
      total_quote: '4316753000',
      pretty_total_quote: '$4,316,753,000',
    },
    {
      timestamp: '2021-10-11T15:35:37.625Z',
      total_quote: '4367554000',
      pretty_total_quote: '$4,367,554,000',
    },
    {
      timestamp: '2021-10-10T15:35:37.625Z',
      total_quote: '4234573800',
      pretty_total_quote: '$4,234,573,800',
    },
    {
      timestamp: '2021-10-09T15:35:37.625Z',
      total_quote: '4433177000',
      pretty_total_quote: '$4,433,177,000',
    },
    {
      timestamp: '2021-10-08T15:35:37.625Z',
      total_quote: '4403003000',
      pretty_total_quote: '$4,403,003,000',
    },
    {
      timestamp: '2021-10-07T15:35:37.625Z',
      total_quote: '4438591000',
      pretty_total_quote: '$4,438,591,000',
    },
    {
      timestamp: '2021-10-06T15:35:37.625Z',
      total_quote: '4430516700',
      pretty_total_quote: '$4,430,516,700',
    },
    {
      timestamp: '2021-10-05T15:35:37.625Z',
      total_quote: '4350333000',
      pretty_total_quote: '$4,350,333,000',
    },
    {
      timestamp: '2021-10-04T15:35:37.625Z',
      total_quote: '4180259800',
      pretty_total_quote: '$4,180,259,800',
    },
    {
      timestamp: '2021-10-03T15:35:37.625Z',
      total_quote: '4229374000',
      pretty_total_quote: '$4,229,374,000',
    },
    {
      timestamp: '2021-10-02T15:35:37.625Z',
      total_quote: '4192108500',
      pretty_total_quote: '$4,192,108,500',
    },
    {
      timestamp: '2021-10-01T15:35:37.625Z',
      total_quote: '4082465500',
      pretty_total_quote: '$4,082,465,500',
    },
    {
      timestamp: '2021-09-30T15:35:37.625Z',
      total_quote: '3713941500',
      pretty_total_quote: '$3,713,941,500',
    },
    {
      timestamp: '2021-09-29T15:35:37.625Z',
      total_quote: '3526000000',
      pretty_total_quote: '$3,526,000,000',
    },
    {
      timestamp: '2021-09-28T15:35:37.625Z',
      total_quote: '3437337000',
      pretty_total_quote: '$3,437,337,000',
    },
    {
      timestamp: '2021-09-27T15:35:37.625Z',
      total_quote: '3605983500',
      pretty_total_quote: '$3,605,983,500',
    },
    {
      timestamp: '2021-09-26T15:35:37.625Z',
      total_quote: '3783915800',
      pretty_total_quote: '$3,783,915,800',
    },
    {
      timestamp: '2021-09-25T15:35:37.625Z',
      total_quote: '3637690000',
      pretty_total_quote: '$3,637,690,000',
    },
    {
      timestamp: '2021-09-24T15:35:37.625Z',
      total_quote: '3610007800',
      pretty_total_quote: '$3,610,007,800',
    },
    {
      timestamp: '2021-09-23T15:35:37.625Z',
      total_quote: '3900478000',
      pretty_total_quote: '$3,900,478,000',
    },
    {
      timestamp: '2021-09-22T15:35:37.625Z',
      total_quote: '3797335000',
      pretty_total_quote: '$3,797,335,000',
    },
    {
      timestamp: '2021-09-21T15:35:37.625Z',
      total_quote: '3380909300',
      pretty_total_quote: '$3,380,909,300',
    },
    {
      timestamp: '2021-09-20T15:35:37.625Z',
      total_quote: '3683967700',
      pretty_total_quote: '$3,683,967,700',
    },
    {
      timestamp: '2021-09-19T15:35:37.625Z',
      total_quote: '4118231600',
      pretty_total_quote: '$4,118,231,600',
    },
    {
      timestamp: '2021-09-18T15:35:37.625Z',
      total_quote: '4234080500',
      pretty_total_quote: '$4,234,080,500',
    },
    {
      timestamp: '2021-09-17T15:35:37.625Z',
      total_quote: '4200771300',
      pretty_total_quote: '$4,200,771,300',
    },
    {
      timestamp: '2021-09-16T15:35:37.625Z',
      total_quote: '4411820000',
      pretty_total_quote: '$4,411,820,000',
    },
    {
      timestamp: '2021-09-15T15:35:37.625Z',
      total_quote: '4438087000',
      pretty_total_quote: '$4,438,087,000',
    },
    {
      timestamp: '2021-09-14T15:35:37.625Z',
      total_quote: '4230887200',
      pretty_total_quote: '$4,230,887,200',
    },
    {
      timestamp: '2021-09-13T15:35:37.625Z',
      total_quote: '4078455000',
      pretty_total_quote: '$4,078,455,000',
    },
    {
      timestamp: '2021-09-12T15:35:37.625Z',
      total_quote: '4219505700',
      pretty_total_quote: '$4,219,505,700',
    },
    {
      timestamp: '2021-09-11T15:35:37.625Z',
      total_quote: '4038155300',
      pretty_total_quote: '$4,038,155,300',
    },
    {
      timestamp: '2021-09-10T15:35:37.625Z',
      total_quote: '3965896700',
      pretty_total_quote: '$3,965,896,700',
    },
    {
      timestamp: '2021-09-09T15:35:37.625Z',
      total_quote: '4237968600',
      pretty_total_quote: '$4,237,968,600',
    },
    {
      timestamp: '2021-09-08T15:35:37.625Z',
      total_quote: '4307614000',
      pretty_total_quote: '$4,307,614,000',
    },
    {
      timestamp: '2021-09-07T15:35:37.625Z',
      total_quote: '4252263000',
      pretty_total_quote: '$4,252,263,000',
    },
    {
      timestamp: '2021-09-06T15:35:37.625Z',
      total_quote: '4876654600',
      pretty_total_quote: '$4,876,654,600',
    },
    {
      timestamp: '2021-09-05T15:35:37.625Z',
      total_quote: '4877904000',
      pretty_total_quote: '$4,877,904,000',
    },
    {
      timestamp: '2021-09-04T15:35:37.625Z',
      total_quote: '4812947000',
      pretty_total_quote: '$4,812,947,000',
    },
    {
      timestamp: '2021-09-03T15:35:37.625Z',
      total_quote: '4858571000',
      pretty_total_quote: '$4,858,571,000',
    },
    {
      timestamp: '2021-09-02T15:35:37.625Z',
      total_quote: '4684074000',
      pretty_total_quote: '$4,684,074,000',
    },
    {
      timestamp: '2021-09-01T15:35:37.625Z',
      total_quote: '4696620500',
      pretty_total_quote: '$4,696,620,500',
    },
    {
      timestamp: '2021-08-31T15:35:37.625Z',
      total_quote: '4249688300',
      pretty_total_quote: '$4,249,688,300',
    },
    {
      timestamp: '2021-08-30T15:35:37.625Z',
      total_quote: '3991092000',
      pretty_total_quote: '$3,991,092,000',
    },
    {
      timestamp: '2021-08-29T15:35:37.625Z',
      total_quote: '3987850500',
      pretty_total_quote: '$3,987,850,500',
    },
    {
      timestamp: '2021-08-28T15:35:37.625Z',
      total_quote: '4009008600',
      pretty_total_quote: '$4,009,008,600',
    },
    {
      timestamp: '2021-08-27T15:35:37.625Z',
      total_quote: '4036762000',
      pretty_total_quote: '$4,036,762,000',
    },
    {
      timestamp: '2021-08-26T15:35:37.625Z',
      total_quote: '3854478300',
      pretty_total_quote: '$3,854,478,300',
    },
    {
      timestamp: '2021-08-25T15:35:37.625Z',
      total_quote: '3989188600',
      pretty_total_quote: '$3,989,188,600',
    },
    {
      timestamp: '2021-08-24T15:35:37.625Z',
      total_quote: '3920982300',
      pretty_total_quote: '$3,920,982,300',
    },
    {
      timestamp: '2021-08-23T15:35:37.625Z',
      total_quote: '4092915500',
      pretty_total_quote: '$4,092,915,500',
    },
    {
      timestamp: '2021-08-22T15:35:37.625Z',
      total_quote: '4002827500',
      pretty_total_quote: '$4,002,827,500',
    },
    {
      timestamp: '2021-08-21T15:35:37.625Z',
      total_quote: '3972519400',
      pretty_total_quote: '$3,972,519,400',
    },
    {
      timestamp: '2021-08-20T15:35:37.625Z',
      total_quote: '4046975500',
      pretty_total_quote: '$4,046,975,500',
    },
    {
      timestamp: '2021-08-19T15:35:37.625Z',
      total_quote: '3889580300',
      pretty_total_quote: '$3,889,580,300',
    },
    {
      timestamp: '2021-08-18T15:35:37.625Z',
      total_quote: '3751992000',
      pretty_total_quote: '$3,751,992,000',
    },
    {
      timestamp: '2021-08-17T15:35:37.625Z',
      total_quote: '3703065000',
      pretty_total_quote: '$3,703,065,000',
    },
    {
      timestamp: '2021-08-16T15:35:37.625Z',
      total_quote: '3891598000',
      pretty_total_quote: '$3,891,598,000',
    },
    {
      timestamp: '2021-08-15T15:35:37.625Z',
      total_quote: '4087129000',
      pretty_total_quote: '$4,087,129,000',
    },
    {
      timestamp: '2021-08-14T15:35:37.625Z',
      total_quote: '4034134000',
      pretty_total_quote: '$4,034,134,000',
    },
    {
      timestamp: '2021-08-13T15:35:37.625Z',
      total_quote: '4101252400',
      pretty_total_quote: '$4,101,252,400',
    },
    {
      timestamp: '2021-08-12T15:35:37.625Z',
      total_quote: '3766640000',
      pretty_total_quote: '$3,766,640,000',
    },
    {
      timestamp: '2021-08-11T15:35:37.625Z',
      total_quote: '3906473700',
      pretty_total_quote: '$3,906,473,700',
    },
    {
      timestamp: '2021-08-10T15:35:37.625Z',
      total_quote: '3896933400',
      pretty_total_quote: '$3,896,933,400',
    },
    {
      timestamp: '2021-08-09T15:35:37.625Z',
      total_quote: '3906088400',
      pretty_total_quote: '$3,906,088,400',
    },
    {
      timestamp: '2021-08-08T15:35:37.625Z',
      total_quote: '3699391500',
      pretty_total_quote: '$3,699,391,500',
    },
    {
      timestamp: '2021-08-07T15:35:37.625Z',
      total_quote: '3910355200',
      pretty_total_quote: '$3,910,355,200',
    },
    {
      timestamp: '2021-08-06T15:35:37.625Z',
      total_quote: '3567929300',
      pretty_total_quote: '$3,567,929,300',
    },
    {
      timestamp: '2021-08-05T15:35:37.625Z',
      total_quote: '3476169200',
      pretty_total_quote: '$3,476,169,200',
    },
    {
      timestamp: '2021-08-04T15:35:37.625Z',
      total_quote: '3362838000',
      pretty_total_quote: '$3,362,838,000',
    },
    {
      timestamp: '2021-08-03T15:35:37.625Z',
      total_quote: '3109173500',
      pretty_total_quote: '$3,109,173,500',
    },
    {
      timestamp: '2021-08-02T15:35:37.625Z',
      total_quote: '3220378400',
      pretty_total_quote: '$3,220,378,400',
    },
    {
      timestamp: '2021-08-01T15:35:37.625Z',
      total_quote: '3154613200',
      pretty_total_quote: '$3,154,613,200',
    },
    {
      timestamp: '2021-07-31T15:35:37.625Z',
      total_quote: '3136205800',
      pretty_total_quote: '$3,136,205,800',
    },
    {
      timestamp: '2021-07-30T15:35:37.625Z',
      total_quote: '3051555600',
      pretty_total_quote: '$3,051,555,600',
    },
    {
      timestamp: '2021-07-29T15:35:37.625Z',
      total_quote: '2933499600',
      pretty_total_quote: '$2,933,499,600',
    },
    {
      timestamp: '2021-07-28T15:35:37.625Z',
      total_quote: '2839818800',
      pretty_total_quote: '$2,839,818,800',
    },
    {
      timestamp: '2021-07-27T15:35:37.625Z',
      total_quote: '2832389400',
      pretty_total_quote: '$2,832,389,400',
    },
    {
      timestamp: '2021-07-26T15:35:37.625Z',
      total_quote: '2750609400',
      pretty_total_quote: '$2,750,609,400',
    },
    {
      timestamp: '2021-07-25T15:35:37.625Z',
      total_quote: '2743487000',
      pretty_total_quote: '$2,743,487,000',
    },
    {
      timestamp: '2021-07-24T15:35:37.625Z',
      total_quote: '2699863600',
      pretty_total_quote: '$2,699,863,600',
    },
    {
      timestamp: '2021-07-23T15:35:37.625Z',
      total_quote: '2615461400',
      pretty_total_quote: '$2,615,461,400',
    },
    {
      timestamp: '2021-07-22T15:35:37.625Z',
      total_quote: '2506166500',
      pretty_total_quote: '$2,506,166,500',
    },
    {
      timestamp: '2021-07-21T15:35:37.625Z',
      total_quote: '2480683800',
      pretty_total_quote: '$2,480,683,800',
    },
    {
      timestamp: '2021-07-20T15:35:37.625Z',
      total_quote: '2223329800',
      pretty_total_quote: '$2,223,329,800',
    },
    {
      timestamp: '2021-07-19T15:35:37.625Z',
      total_quote: '2252109600',
      pretty_total_quote: '$2,252,109,600',
    },
    {
      timestamp: '2021-07-18T15:35:37.625Z',
      total_quote: '2360039200',
      pretty_total_quote: '$2,360,039,200',
    },
    {
      timestamp: '2021-07-17T15:35:37.625Z',
      total_quote: '2348932900',
      pretty_total_quote: '$2,348,932,900',
    },
    {
      timestamp: '2021-07-16T15:35:37.625Z',
      total_quote: '2313768700',
      pretty_total_quote: '$2,313,768,700',
    },
    {
      timestamp: '2021-07-15T15:35:37.625Z',
      total_quote: '2355323600',
      pretty_total_quote: '$2,355,323,600',
    },
    {
      timestamp: '2021-07-14T15:35:37.625Z',
      total_quote: '2467941000',
      pretty_total_quote: '$2,467,941,000',
    },
    {
      timestamp: '2021-07-13T15:35:37.625Z',
      total_quote: '2397100500',
      pretty_total_quote: '$2,397,100,500',
    },
    {
      timestamp: '2021-07-12T15:35:37.625Z',
      total_quote: '2523809300',
      pretty_total_quote: '$2,523,809,300',
    },
    {
      timestamp: '2021-07-11T15:35:37.625Z',
      total_quote: '2645651200',
      pretty_total_quote: '$2,645,651,200',
    },
    {
      timestamp: '2021-07-10T15:35:37.625Z',
      total_quote: '2620969000',
      pretty_total_quote: '$2,620,969,000',
    },
    {
      timestamp: '2021-07-09T15:35:37.625Z',
      total_quote: '2661831200',
      pretty_total_quote: '$2,661,831,200',
    },
    {
      timestamp: '2021-07-08T15:35:37.625Z',
      total_quote: '2629300200',
      pretty_total_quote: '$2,629,300,200',
    },
    {
      timestamp: '2021-07-07T15:35:37.625Z',
      total_quote: '2857349600',
      pretty_total_quote: '$2,857,349,600',
    },
    {
      timestamp: '2021-07-06T15:35:37.625Z',
      total_quote: '2865149400',
      pretty_total_quote: '$2,865,149,400',
    },
    {
      timestamp: '2021-07-05T15:35:37.625Z',
      total_quote: '2733195300',
      pretty_total_quote: '$2,733,195,300',
    },
    {
      timestamp: '2021-07-04T15:35:37.625Z',
      total_quote: '2871096300',
      pretty_total_quote: '$2,871,096,300',
    },
    {
      timestamp: '2021-07-03T15:35:37.625Z',
      total_quote: '2756109600',
      pretty_total_quote: '$2,756,109,600',
    },
    {
      timestamp: '2021-07-02T15:35:37.625Z',
      total_quote: '2670422500',
      pretty_total_quote: '$2,670,422,500',
    },
    {
      timestamp: '2021-07-01T15:35:37.625Z',
      total_quote: '2622704400',
      pretty_total_quote: '$2,622,704,400',
    },
    {
      timestamp: '2021-06-30T15:35:37.625Z',
      total_quote: '2817568500',
      pretty_total_quote: '$2,817,568,500',
    },
    {
      timestamp: '2021-06-29T15:35:37.625Z',
      total_quote: '2672051500',
      pretty_total_quote: '$2,672,051,500',
    },
    {
      timestamp: '2021-06-28T15:35:37.625Z',
      total_quote: '2582382300',
      pretty_total_quote: '$2,582,382,300',
    },
    {
      timestamp: '2021-06-27T15:35:37.625Z',
      total_quote: '2436766700',
      pretty_total_quote: '$2,436,766,700',
    },
    {
      timestamp: '2021-06-26T15:35:37.625Z',
      total_quote: '2246171000',
      pretty_total_quote: '$2,246,171,000',
    },
    {
      timestamp: '2021-06-25T15:35:37.625Z',
      total_quote: '2274647800',
      pretty_total_quote: '$2,274,647,800',
    },
    {
      timestamp: '2021-06-24T15:35:37.625Z',
      total_quote: '2456165600',
      pretty_total_quote: '$2,456,165,600',
    },
    {
      timestamp: '2021-06-23T15:35:37.625Z',
      total_quote: '2434710000',
      pretty_total_quote: '$2,434,710,000',
    },
    {
      timestamp: '2021-06-22T15:35:37.625Z',
      total_quote: '2318120400',
      pretty_total_quote: '$2,318,120,400',
    },
    {
      timestamp: '2021-06-21T15:35:37.625Z',
      total_quote: '2338851000',
      pretty_total_quote: '$2,338,851,000',
    },
    {
      timestamp: '2021-06-20T15:35:37.625Z',
      total_quote: '2781851400',
      pretty_total_quote: '$2,781,851,400',
    },
    {
      timestamp: '2021-06-19T15:35:37.625Z',
      total_quote: '2685418200',
      pretty_total_quote: '$2,685,418,200',
    },
    {
      timestamp: '2021-06-18T15:35:37.625Z',
      total_quote: '2759682300',
      pretty_total_quote: '$2,759,682,300',
    },
    {
      timestamp: '2021-06-17T15:35:37.625Z',
      total_quote: '2941375700',
      pretty_total_quote: '$2,941,375,700',
    },
    {
      timestamp: '2021-06-16T15:35:37.625Z',
      total_quote: '2924854500',
      pretty_total_quote: '$2,924,854,500',
    },
    {
      timestamp: '2021-06-15T15:35:37.625Z',
      total_quote: '3163643100',
      pretty_total_quote: '$3,163,643,100',
    },
    {
      timestamp: '2021-06-14T15:35:37.625Z',
      total_quote: '3198409500',
      pretty_total_quote: '$3,198,409,500',
    },
    {
      timestamp: '2021-06-13T15:35:37.625Z',
      total_quote: '3117450000',
      pretty_total_quote: '$3,117,450,000',
    },
    {
      timestamp: '2021-06-12T15:35:37.625Z',
      total_quote: '2937727500',
      pretty_total_quote: '$2,937,727,500',
    },
    {
      timestamp: '2021-06-11T15:35:37.625Z',
      total_quote: '2912361500',
      pretty_total_quote: '$2,912,361,500',
    },
    {
      timestamp: '2021-06-10T15:35:37.625Z',
      total_quote: '3074069500',
      pretty_total_quote: '$3,074,069,500',
    },
    {
      timestamp: '2021-06-09T15:35:37.625Z',
      total_quote: '3238701600',
      pretty_total_quote: '$3,238,701,600',
    },
    {
      timestamp: '2021-06-08T15:35:37.625Z',
      total_quote: '3120560000',
      pretty_total_quote: '$3,120,560,000',
    },
    {
      timestamp: '2021-06-07T15:35:37.625Z',
      total_quote: '3175780000',
      pretty_total_quote: '$3,175,780,000',
    },
    {
      timestamp: '2021-06-06T15:35:37.625Z',
      total_quote: '3353293800',
      pretty_total_quote: '$3,353,293,800',
    },
    {
      timestamp: '2021-06-05T15:35:37.625Z',
      total_quote: '3251448800',
      pretty_total_quote: '$3,251,448,800',
    },
    {
      timestamp: '2021-06-04T15:35:37.625Z',
      total_quote: '3327111400',
      pretty_total_quote: '$3,327,111,400',
    },
    {
      timestamp: '2021-06-03T15:35:37.625Z',
      total_quote: '3531251700',
      pretty_total_quote: '$3,531,251,700',
    },
    {
      timestamp: '2021-06-02T15:35:37.625Z',
      total_quote: '3357705700',
      pretty_total_quote: '$3,357,705,700',
    },
    {
      timestamp: '2021-06-01T15:35:37.625Z',
      total_quote: '3250363600',
      pretty_total_quote: '$3,250,363,600',
    },
    {
      timestamp: '2021-05-31T15:35:37.625Z',
      total_quote: '3346168300',
      pretty_total_quote: '$3,346,168,300',
    },
    {
      timestamp: '2021-05-30T15:35:37.625Z',
      total_quote: '2963432700',
      pretty_total_quote: '$2,963,432,700',
    },
    {
      timestamp: '2021-05-29T15:35:37.625Z',
      total_quote: '2848372000',
      pretty_total_quote: '$2,848,372,000',
    },
    {
      timestamp: '2021-05-28T15:35:37.625Z',
      total_quote: '3006845400',
      pretty_total_quote: '$3,006,845,400',
    },
    {
      timestamp: '2021-05-27T15:35:37.625Z',
      total_quote: '3399341300',
      pretty_total_quote: '$3,399,341,300',
    },
    {
      timestamp: '2021-05-26T15:35:37.625Z',
      total_quote: '3579971600',
      pretty_total_quote: '$3,579,971,600',
    },
    {
      timestamp: '2021-05-25T15:35:37.625Z',
      total_quote: '3325771800',
      pretty_total_quote: '$3,325,771,800',
    },
    {
      timestamp: '2021-05-24T15:35:37.625Z',
      total_quote: '3264740900',
      pretty_total_quote: '$3,264,740,900',
    },
    {
      timestamp: '2021-05-23T15:35:37.625Z',
      total_quote: '2634157000',
      pretty_total_quote: '$2,634,157,000',
    },
    {
      timestamp: '2021-05-22T15:35:37.625Z',
      total_quote: '2844953000',
      pretty_total_quote: '$2,844,953,000',
    },
    {
      timestamp: '2021-05-21T15:35:37.625Z',
      total_quote: '3002968000',
      pretty_total_quote: '$3,002,968,000',
    },
    {
      timestamp: '2021-05-20T15:35:37.625Z',
      total_quote: '3425441000',
      pretty_total_quote: '$3,425,441,000',
    },
    {
      timestamp: '2021-05-19T15:35:37.625Z',
      total_quote: '3089062400',
      pretty_total_quote: '$3,089,062,400',
    },
    {
      timestamp: '2021-05-18T15:35:37.625Z',
      total_quote: '4227017000',
      pretty_total_quote: '$4,227,017,000',
    },
    {
      timestamp: '2021-05-17T15:35:37.625Z',
      total_quote: '4092278300',
      pretty_total_quote: '$4,092,278,300',
    },
    {
      timestamp: '2021-05-16T15:35:37.625Z',
      total_quote: '4463734000',
      pretty_total_quote: '$4,463,734,000',
    },
    {
      timestamp: '2021-05-15T15:35:37.625Z',
      total_quote: '4490992000',
      pretty_total_quote: '$4,490,992,000',
    },
    {
      timestamp: '2021-05-14T15:35:37.625Z',
      total_quote: '5046304000',
      pretty_total_quote: '$5,046,304,000',
    },
    {
      timestamp: '2021-05-13T15:35:37.625Z',
      total_quote: '4665137000',
      pretty_total_quote: '$4,665,137,000',
    },
    {
      timestamp: '2021-05-12T15:35:37.625Z',
      total_quote: '4772458500',
      pretty_total_quote: '$4,772,458,500',
    },
    {
      timestamp: '2021-05-11T15:35:37.625Z',
      total_quote: '5183155000',
      pretty_total_quote: '$5,183,155,000',
    },
    {
      timestamp: '2021-05-10T15:35:37.625Z',
      total_quote: '4915911700',
      pretty_total_quote: '$4,915,911,700',
    },
    {
      timestamp: '2021-05-09T15:35:37.625Z',
      total_quote: '4856496600',
      pretty_total_quote: '$4,856,496,600',
    },
    {
      timestamp: '2021-05-08T15:35:37.625Z',
      total_quote: '4833459700',
      pretty_total_quote: '$4,833,459,700',
    },
    {
      timestamp: '2021-05-07T15:35:37.625Z',
      total_quote: '4317359600',
      pretty_total_quote: '$4,317,359,600',
    },
    {
      timestamp: '2021-05-06T15:35:37.625Z',
      total_quote: '4316513300',
      pretty_total_quote: '$4,316,513,300',
    },
    {
      timestamp: '2021-05-05T15:35:37.625Z',
      total_quote: '4364577300',
      pretty_total_quote: '$4,364,577,300',
    },
    {
      timestamp: '2021-05-04T15:35:37.625Z',
      total_quote: '3996230700',
      pretty_total_quote: '$3,996,230,700',
    },
    {
      timestamp: '2021-05-03T15:35:37.625Z',
      total_quote: '4245349400',
      pretty_total_quote: '$4,245,349,400',
    },
    {
      timestamp: '2021-05-02T15:35:37.625Z',
      total_quote: '3647891200',
      pretty_total_quote: '$3,647,891,200',
    },
    {
      timestamp: '2021-05-01T15:35:37.625Z',
      total_quote: '3636194800',
      pretty_total_quote: '$3,636,194,800',
    },
    {
      timestamp: '2021-04-30T15:35:37.625Z',
      total_quote: '3431185700',
      pretty_total_quote: '$3,431,185,700',
    },
    {
      timestamp: '2021-04-29T15:35:37.625Z',
      total_quote: '3404331800',
      pretty_total_quote: '$3,404,331,800',
    },
    {
      timestamp: '2021-04-28T15:35:37.625Z',
      total_quote: '3397318000',
      pretty_total_quote: '$3,397,318,000',
    },
    {
      timestamp: '2021-04-27T15:35:37.625Z',
      total_quote: '3261685000',
      pretty_total_quote: '$3,261,685,000',
    },
    {
      timestamp: '2021-04-26T15:35:37.625Z',
      total_quote: '3130941200',
      pretty_total_quote: '$3,130,941,200',
    },
    {
      timestamp: '2021-04-25T15:35:37.625Z',
      total_quote: '2850962700',
      pretty_total_quote: '$2,850,962,700',
    },
    {
      timestamp: '2021-04-24T15:35:37.625Z',
      total_quote: '2728324900',
      pretty_total_quote: '$2,728,324,900',
    },
    {
      timestamp: '2021-04-23T15:35:37.625Z',
      total_quote: '2932982800',
      pretty_total_quote: '$2,932,982,800',
    },
    {
      timestamp: '2021-04-22T15:35:37.625Z',
      total_quote: '2987553000',
      pretty_total_quote: '$2,987,553,000',
    },
    {
      timestamp: '2021-04-21T15:35:37.625Z',
      total_quote: '2936077800',
      pretty_total_quote: '$2,936,077,800',
    },
    {
      timestamp: '2021-04-20T15:35:37.625Z',
      total_quote: '2865242000',
      pretty_total_quote: '$2,865,242,000',
    },
    {
      timestamp: '2021-04-19T15:35:37.625Z',
      total_quote: '2667148500',
      pretty_total_quote: '$2,667,148,500',
    },
    {
      timestamp: '2021-04-18T15:35:37.625Z',
      total_quote: '2770456300',
      pretty_total_quote: '$2,770,456,300',
    },
    {
      timestamp: '2021-04-17T15:35:37.625Z',
      total_quote: '2895853000',
      pretty_total_quote: '$2,895,853,000',
    },
    {
      timestamp: '2021-04-16T15:35:37.625Z',
      total_quote: '2987542000',
      pretty_total_quote: '$2,987,542,000',
    },
    {
      timestamp: '2021-04-15T15:35:37.625Z',
      total_quote: '3104660700',
      pretty_total_quote: '$3,104,660,700',
    },
    {
      timestamp: '2021-04-14T15:35:37.625Z',
      total_quote: '2998365700',
      pretty_total_quote: '$2,998,365,700',
    },
    {
      timestamp: '2021-04-13T15:35:37.625Z',
      total_quote: '2850178300',
      pretty_total_quote: '$2,850,178,300',
    },
    {
      timestamp: '2021-04-12T15:35:37.625Z',
      total_quote: '2644871000',
      pretty_total_quote: '$2,644,871,000',
    },
    {
      timestamp: '2021-04-11T15:35:37.625Z',
      total_quote: '2654307000',
      pretty_total_quote: '$2,654,307,000',
    },
    {
      timestamp: '2021-04-10T15:35:37.625Z',
      total_quote: '2657056500',
      pretty_total_quote: '$2,657,056,500',
    },
    {
      timestamp: '2021-04-09T15:35:37.625Z',
      total_quote: '2555595300',
      pretty_total_quote: '$2,555,595,300',
    },
    {
      timestamp: '2021-04-08T15:35:37.625Z',
      total_quote: '2570656800',
      pretty_total_quote: '$2,570,656,800',
    },
    {
      timestamp: '2021-04-07T15:35:37.625Z',
      total_quote: '2449748200',
      pretty_total_quote: '$2,449,748,200',
    },
    {
      timestamp: '2021-04-06T15:35:37.625Z',
      total_quote: '2611553300',
      pretty_total_quote: '$2,611,553,300',
    },
    {
      timestamp: '2021-04-05T15:35:37.625Z',
      total_quote: '2591876600',
      pretty_total_quote: '$2,591,876,600',
    },
    {
      timestamp: '2021-04-04T15:35:37.625Z',
      total_quote: '2566978800',
      pretty_total_quote: '$2,566,978,800',
    },
    {
      timestamp: '2021-04-03T15:35:37.625Z',
      total_quote: '2482275600',
      pretty_total_quote: '$2,482,275,600',
    },
    {
      timestamp: '2021-04-02T15:35:37.625Z',
      total_quote: '2633682200',
      pretty_total_quote: '$2,633,682,200',
    },
    {
      timestamp: '2021-04-01T15:35:37.625Z',
      total_quote: '2432750800',
      pretty_total_quote: '$2,432,750,800',
    },
    {
      timestamp: '2021-03-31T15:35:37.625Z',
      total_quote: '2366992400',
      pretty_total_quote: '$2,366,992,400',
    },
    {
      timestamp: '2021-03-30T15:35:37.625Z',
      total_quote: '2271839000',
      pretty_total_quote: '$2,271,839,000',
    },
    {
      timestamp: '2021-03-29T15:35:37.625Z',
      total_quote: '2242519000',
      pretty_total_quote: '$2,242,519,000',
    },
    {
      timestamp: '2021-03-28T15:35:37.625Z',
      total_quote: '2082011600',
      pretty_total_quote: '$2,082,011,600',
    },
    {
      timestamp: '2021-03-27T15:35:37.625Z',
      total_quote: '2111141200',
      pretty_total_quote: '$2,111,141,200',
    },
    {
      timestamp: '2021-03-26T15:35:37.625Z',
      total_quote: '2104454900',
      pretty_total_quote: '$2,104,454,900',
    },
    {
      timestamp: '2021-03-25T15:35:37.625Z',
      total_quote: '1955537900',
      pretty_total_quote: '$1,955,537,900',
    },
    {
      timestamp: '2021-03-24T15:35:37.625Z',
      total_quote: '1949856900',
      pretty_total_quote: '$1,949,856,900',
    },
    {
      timestamp: '2021-03-23T15:35:37.625Z',
      total_quote: '2069469700',
      pretty_total_quote: '$2,069,469,700',
    },
    {
      timestamp: '2021-03-22T15:35:37.625Z',
      total_quote: '2079682400',
      pretty_total_quote: '$2,079,682,400',
    },
    {
      timestamp: '2021-03-21T15:35:37.625Z',
      total_quote: '2205479200',
      pretty_total_quote: '$2,205,479,200',
    },
    {
      timestamp: '2021-03-20T15:35:37.625Z',
      total_quote: '2241840400',
      pretty_total_quote: '$2,241,840,400',
    },
    {
      timestamp: '2021-03-19T15:35:37.625Z',
      total_quote: '2241766700',
      pretty_total_quote: '$2,241,766,700',
    },
    {
      timestamp: '2021-03-18T15:35:37.625Z',
      total_quote: '2204374000',
      pretty_total_quote: '$2,204,374,000',
    },
    {
      timestamp: '2021-03-17T15:35:37.625Z',
      total_quote: '2260737000',
      pretty_total_quote: '$2,260,737,000',
    },
    {
      timestamp: '2021-03-16T15:35:37.625Z',
      total_quote: '2237737500',
      pretty_total_quote: '$2,237,737,500',
    },
    {
      timestamp: '2021-03-15T15:35:37.625Z',
      total_quote: '2196199400',
      pretty_total_quote: '$2,196,199,400',
    },
    {
      timestamp: '2021-03-14T15:35:37.625Z',
      total_quote: '2296799000',
      pretty_total_quote: '$2,296,799,000',
    },
    {
      timestamp: '2021-03-13T15:35:37.625Z',
      total_quote: '2378963700',
      pretty_total_quote: '$2,378,963,700',
    },
    {
      timestamp: '2021-03-12T15:35:37.625Z',
      total_quote: '2184212000',
      pretty_total_quote: '$2,184,212,000',
    },
    {
      timestamp: '2021-03-11T15:35:37.625Z',
      total_quote: '2254142000',
      pretty_total_quote: '$2,254,142,000',
    },
    {
      timestamp: '2021-03-10T15:35:37.625Z',
      total_quote: '2220524000',
      pretty_total_quote: '$2,220,524,000',
    },
    {
      timestamp: '2021-03-09T15:35:37.625Z',
      total_quote: '2306060800',
      pretty_total_quote: '$2,306,060,800',
    },
    {
      timestamp: '2021-03-08T15:35:37.625Z',
      total_quote: '2274487300',
      pretty_total_quote: '$2,274,487,300',
    },
    {
      timestamp: '2021-03-07T15:35:37.625Z',
      total_quote: '2136834700',
      pretty_total_quote: '$2,136,834,700',
    },
    {
      timestamp: '2021-03-06T15:35:37.625Z',
      total_quote: '2050479200',
      pretty_total_quote: '$2,050,479,200',
    },
    {
      timestamp: '2021-03-05T15:35:37.625Z',
      total_quote: '1901206300',
      pretty_total_quote: '$1,901,206,300',
    },
    {
      timestamp: '2021-03-04T15:35:37.625Z',
      total_quote: '1917103500',
      pretty_total_quote: '$1,917,103,500',
    },
    {
      timestamp: '2021-03-03T15:35:37.625Z',
      total_quote: '1946613100',
      pretty_total_quote: '$1,946,613,100',
    },
    {
      timestamp: '2021-03-02T15:35:37.625Z',
      total_quote: '1847240000',
      pretty_total_quote: '$1,847,240,000',
    },
    {
      timestamp: '2021-03-01T15:35:37.625Z',
      total_quote: '1934694900',
      pretty_total_quote: '$1,934,694,900',
    },
    {
      timestamp: '2021-02-28T15:35:37.625Z',
      total_quote: '1735737700',
      pretty_total_quote: '$1,735,737,700',
    },
    {
      timestamp: '2021-02-27T15:35:37.625Z',
      total_quote: '1838770700',
      pretty_total_quote: '$1,838,770,700',
    },
    {
      timestamp: '2021-02-26T15:35:37.625Z',
      total_quote: '1794736900',
      pretty_total_quote: '$1,794,736,900',
    },
    {
      timestamp: '2021-02-25T15:35:37.625Z',
      total_quote: '1795539200',
      pretty_total_quote: '$1,795,539,200',
    },
    {
      timestamp: '2021-02-24T15:35:37.625Z',
      total_quote: '2011456400',
      pretty_total_quote: '$2,011,456,400',
    },
    {
      timestamp: '2021-02-23T15:35:37.625Z',
      total_quote: '1936596200',
      pretty_total_quote: '$1,936,596,200',
    },
    {
      timestamp: '2021-02-22T15:35:37.625Z',
      total_quote: '2215853800',
      pretty_total_quote: '$2,215,853,800',
    },
    {
      timestamp: '2021-02-21T15:35:37.625Z',
      total_quote: '2397157000',
      pretty_total_quote: '$2,397,157,000',
    },
    {
      timestamp: '2021-02-20T15:35:37.625Z',
      total_quote: '2388721200',
      pretty_total_quote: '$2,388,721,200',
    },
    {
      timestamp: '2021-02-19T15:35:37.625Z',
      total_quote: '2438093800',
      pretty_total_quote: '$2,438,093,800',
    },
    {
      timestamp: '2021-02-18T15:35:37.625Z',
      total_quote: '2395052000',
      pretty_total_quote: '$2,395,052,000',
    },
    {
      timestamp: '2021-02-17T15:35:37.625Z',
      total_quote: '2278859000',
      pretty_total_quote: '$2,278,859,000',
    },
    {
      timestamp: '2021-02-16T15:35:37.625Z',
      total_quote: '2203840300',
      pretty_total_quote: '$2,203,840,300',
    },
    {
      timestamp: '2021-02-15T15:35:37.625Z',
      total_quote: '2190206500',
      pretty_total_quote: '$2,190,206,500',
    },
    {
      timestamp: '2021-02-14T15:35:37.625Z',
      total_quote: '2225458400',
      pretty_total_quote: '$2,225,458,400',
    },
    {
      timestamp: '2021-02-13T15:35:37.625Z',
      total_quote: '2232871400',
      pretty_total_quote: '$2,232,871,400',
    },
    {
      timestamp: '2021-02-12T15:35:37.625Z',
      total_quote: '2273460500',
      pretty_total_quote: '$2,273,460,500',
    },
    {
      timestamp: '2021-02-11T15:35:37.625Z',
      total_quote: '2200596500',
      pretty_total_quote: '$2,200,596,500',
    },
    {
      timestamp: '2021-02-10T15:35:37.625Z',
      total_quote: '2148234800',
      pretty_total_quote: '$2,148,234,800',
    },
    {
      timestamp: '2021-02-09T15:35:37.625Z',
      total_quote: '2184008200',
      pretty_total_quote: '$2,184,008,200',
    },
    {
      timestamp: '2021-02-08T15:35:37.625Z',
      total_quote: '2163510500',
      pretty_total_quote: '$2,163,510,500',
    },
    {
      timestamp: '2021-02-07T15:35:37.625Z',
      total_quote: '1986982000',
      pretty_total_quote: '$1,986,982,000',
    },
    {
      timestamp: '2021-02-06T15:35:37.625Z',
      total_quote: '2079253600',
      pretty_total_quote: '$2,079,253,600',
    },
    {
      timestamp: '2021-02-05T15:35:37.625Z',
      total_quote: '2120570100',
      pretty_total_quote: '$2,120,570,100',
    },
    {
      timestamp: '2021-02-04T15:35:37.625Z',
      total_quote: '1959966800',
      pretty_total_quote: '$1,959,966,800',
    },
    {
      timestamp: '2021-02-03T15:35:37.625Z',
      total_quote: '2049995300',
      pretty_total_quote: '$2,049,995,300',
    },
    {
      timestamp: '2021-02-02T15:35:37.625Z',
      total_quote: '1867514900',
      pretty_total_quote: '$1,867,514,900',
    },
    {
      timestamp: '2021-02-01T15:35:37.625Z',
      total_quote: '1690275800',
      pretty_total_quote: '$1,690,275,800',
    },
    {
      timestamp: '2021-01-31T15:35:37.625Z',
      total_quote: '1621875000',
      pretty_total_quote: '$1,621,875,000',
    },
    {
      timestamp: '2021-01-30T15:35:37.625Z',
      total_quote: '1696267300',
      pretty_total_quote: '$1,696,267,300',
    },
    {
      timestamp: '2021-01-29T15:35:37.625Z',
      total_quote: '1704125300',
      pretty_total_quote: '$1,704,125,300',
    },
    {
      timestamp: '2021-01-28T15:35:37.625Z',
      total_quote: '1637651100',
      pretty_total_quote: '$1,637,651,100',
    },
    {
      timestamp: '2021-01-27T15:35:37.625Z',
      total_quote: '1549517400',
      pretty_total_quote: '$1,549,517,400',
    },
    {
      timestamp: '2021-01-26T15:35:37.625Z',
      total_quote: '1673295400',
      pretty_total_quote: '$1,673,295,400',
    },
    {
      timestamp: '2021-01-25T15:35:37.625Z',
      total_quote: '1634263700',
      pretty_total_quote: '$1,634,263,700',
    },
    {
      timestamp: '2021-01-24T15:35:37.625Z',
      total_quote: '1719980700',
      pretty_total_quote: '$1,719,980,700',
    },
    {
      timestamp: '2021-01-23T15:35:37.625Z',
      total_quote: '1521112600',
      pretty_total_quote: '$1,521,112,600',
    },
    {
      timestamp: '2021-01-22T15:35:37.625Z',
      total_quote: '1529066200',
      pretty_total_quote: '$1,529,066,200',
    },
    {
      timestamp: '2021-01-21T15:35:37.625Z',
      total_quote: '1390674600',
      pretty_total_quote: '$1,390,674,600',
    },
    {
      timestamp: '2021-01-20T15:35:37.625Z',
      total_quote: '1710412900',
      pretty_total_quote: '$1,710,412,900',
    },
    {
      timestamp: '2021-01-19T15:35:37.625Z',
      total_quote: '1704595800',
      pretty_total_quote: '$1,704,595,800',
    },
    {
      timestamp: '2021-01-18T15:35:37.625Z',
      total_quote: '1548079900',
      pretty_total_quote: '$1,548,079,900',
    },
    {
      timestamp: '2021-01-17T15:35:37.625Z',
      total_quote: '1520422800',
      pretty_total_quote: '$1,520,422,800',
    },
    {
      timestamp: '2021-01-16T15:35:37.625Z',
      total_quote: '1527141500',
      pretty_total_quote: '$1,527,141,500',
    },
    {
      timestamp: '2021-01-15T15:35:37.625Z',
      total_quote: '1446135900',
      pretty_total_quote: '$1,446,135,900',
    },
    {
      timestamp: '2021-01-14T15:35:37.625Z',
      total_quote: '1505480000',
      pretty_total_quote: '$1,505,480,000',
    },
    {
      timestamp: '2021-01-13T15:35:37.625Z',
      total_quote: '1400823400',
      pretty_total_quote: '$1,400,823,400',
    },
    {
      timestamp: '2021-01-12T15:35:37.625Z',
      total_quote: '1289691900',
      pretty_total_quote: '$1,289,691,900',
    },
    {
      timestamp: '2021-01-11T15:35:37.625Z',
      total_quote: '1352187800',
      pretty_total_quote: '$1,352,187,800',
    },
    {
      timestamp: '2021-01-10T15:35:37.625Z',
      total_quote: '1562658300',
      pretty_total_quote: '$1,562,658,300',
    },
    {
      timestamp: '2021-01-09T15:35:37.625Z',
      total_quote: '1584058500',
      pretty_total_quote: '$1,584,058,500',
    },
    {
      timestamp: '2021-01-08T15:35:37.625Z',
      total_quote: '1513780500',
      pretty_total_quote: '$1,513,780,500',
    },
    {
      timestamp: '2021-01-07T15:35:37.625Z',
      total_quote: '1520853900',
      pretty_total_quote: '$1,520,853,900',
    },
    {
      timestamp: '2021-01-06T15:35:37.625Z',
      total_quote: '1493197600',
      pretty_total_quote: '$1,493,197,600',
    },
    {
      timestamp: '2021-01-05T15:35:37.625Z',
      total_quote: '1362126600',
      pretty_total_quote: '$1,362,126,600',
    },
    {
      timestamp: '2021-01-04T15:35:37.625Z',
      total_quote: '1275651300',
      pretty_total_quote: '$1,275,651,300',
    },
    {
      timestamp: '2021-01-03T15:35:37.625Z',
      total_quote: '1197220000',
      pretty_total_quote: '$1,197,220,000',
    },
    {
      timestamp: '2021-01-02T15:35:37.625Z',
      total_quote: '961181060',
      pretty_total_quote: '$961,181,060',
    },
    {
      timestamp: '2021-01-01T15:35:37.625Z',
      total_quote: '901654140',
      pretty_total_quote: '$901,654,140',
    },
    {
      timestamp: '2020-12-31T15:35:37.625Z',
      total_quote: '912268200',
      pretty_total_quote: '$912,268,200',
    },
    {
      timestamp: '2020-12-30T15:35:37.625Z',
      total_quote: '929658050',
      pretty_total_quote: '$929,658,050',
    },
    {
      timestamp: '2020-12-29T15:35:37.625Z',
      total_quote: '908587650',
      pretty_total_quote: '$908,587,650',
    },
    {
      timestamp: '2020-12-28T15:35:37.625Z',
      total_quote: '904162000',
      pretty_total_quote: '$904,162,000',
    },
    {
      timestamp: '2020-12-27T15:35:37.625Z',
      total_quote: '850221700',
      pretty_total_quote: '$850,221,700',
    },
    {
      timestamp: '2020-12-26T15:35:37.625Z',
      total_quote: '786337340',
      pretty_total_quote: '$786,337,340',
    },
    {
      timestamp: '2020-12-25T15:35:37.625Z',
      total_quote: '773563100',
      pretty_total_quote: '$773,563,100',
    },
    {
      timestamp: '2020-12-24T15:35:37.625Z',
      total_quote: '756710800',
      pretty_total_quote: '$756,710,800',
    },
    {
      timestamp: '2020-12-23T15:35:37.625Z',
      total_quote: '725600900',
      pretty_total_quote: '$725,600,900',
    },
    {
      timestamp: '2020-12-22T15:35:37.625Z',
      total_quote: '784379200',
      pretty_total_quote: '$784,379,200',
    },
    {
      timestamp: '2020-12-21T15:35:37.625Z',
      total_quote: '752752960',
      pretty_total_quote: '$752,752,960',
    },
    {
      timestamp: '2020-12-20T15:35:37.625Z',
      total_quote: '789546750',
      pretty_total_quote: '$789,546,750',
    },
    {
      timestamp: '2020-12-19T15:35:37.625Z',
      total_quote: '814177400',
      pretty_total_quote: '$814,177,400',
    },
    {
      timestamp: '2020-12-18T15:35:37.625Z',
      total_quote: '808708600',
      pretty_total_quote: '$808,708,600',
    },
    {
      timestamp: '2020-12-17T15:35:37.625Z',
      total_quote: '795138500',
      pretty_total_quote: '$795,138,500',
    },
    {
      timestamp: '2020-12-16T15:35:37.625Z',
      total_quote: '785432400',
      pretty_total_quote: '$785,432,400',
    },
    {
      timestamp: '2020-12-15T15:35:37.625Z',
      total_quote: '727215600',
      pretty_total_quote: '$727,215,600',
    },
    {
      timestamp: '2020-12-14T15:35:37.625Z',
      total_quote: '722733900',
      pretty_total_quote: '$722,733,900',
    },
    {
      timestamp: '2020-12-13T15:35:37.625Z',
      total_quote: '728665500',
      pretty_total_quote: '$728,665,500',
    },
    {
      timestamp: '2020-12-12T15:35:37.625Z',
      total_quote: '701724350',
      pretty_total_quote: '$701,724,350',
    },
    {
      timestamp: '2020-12-11T15:35:37.625Z',
      total_quote: '673314050',
      pretty_total_quote: '$673,314,050',
    },
    {
      timestamp: '2020-12-10T15:35:37.625Z',
      total_quote: '691041000',
      pretty_total_quote: '$691,041,000',
    },
    {
      timestamp: '2020-12-09T15:35:37.625Z',
      total_quote: '708512060',
      pretty_total_quote: '$708,512,060',
    },
    {
      timestamp: '2020-12-08T15:35:37.625Z',
      total_quote: '684485600',
      pretty_total_quote: '$684,485,600',
    },
    {
      timestamp: '2020-12-07T15:35:37.625Z',
      total_quote: '731377800',
      pretty_total_quote: '$731,377,800',
    },
    {
      timestamp: '2020-12-06T15:35:37.625Z',
      total_quote: '743270460',
      pretty_total_quote: '$743,270,460',
    },
    {
      timestamp: '2020-12-05T15:35:37.625Z',
      total_quote: '735612000',
      pretty_total_quote: '$735,612,000',
    },
    {
      timestamp: '2020-12-04T15:35:37.625Z',
      total_quote: '704693440',
      pretty_total_quote: '$704,693,440',
    },
    {
      timestamp: '2020-12-03T15:35:37.625Z',
      total_quote: '761577200',
      pretty_total_quote: '$761,577,200',
    },
    {
      timestamp: '2020-12-02T15:35:37.625Z',
      total_quote: '739547840',
      pretty_total_quote: '$739,547,840',
    },
    {
      timestamp: '2020-12-01T15:35:37.625Z',
      total_quote: '728114100',
      pretty_total_quote: '$728,114,100',
    },
    {
      timestamp: '2020-11-30T15:35:37.625Z',
      total_quote: '754640700',
      pretty_total_quote: '$754,640,700',
    },
    {
      timestamp: '2020-11-29T15:35:37.625Z',
      total_quote: '709650560',
      pretty_total_quote: '$709,650,560',
    },
    {
      timestamp: '2020-11-28T15:35:37.625Z',
      total_quote: '664100860',
      pretty_total_quote: '$664,100,860',
    },
    {
      timestamp: '2020-11-27T15:35:37.625Z',
      total_quote: '639309060',
      pretty_total_quote: '$639,309,060',
    },
    {
      timestamp: '2020-11-26T15:35:37.625Z',
      total_quote: '640742200',
      pretty_total_quote: '$640,742,200',
    },
    {
      timestamp: '2020-11-25T15:35:37.625Z',
      total_quote: '700794940',
      pretty_total_quote: '$700,794,940',
    },
    {
      timestamp: '2020-11-24T15:35:37.625Z',
      total_quote: '744139900',
      pretty_total_quote: '$744,139,900',
    },
    {
      timestamp: '2020-11-23T15:35:37.625Z',
      total_quote: '751092160',
      pretty_total_quote: '$751,092,160',
    },
    {
      timestamp: '2020-11-22T15:35:37.625Z',
      total_quote: '691970050',
      pretty_total_quote: '$691,970,050',
    },
    {
      timestamp: '2020-11-21T15:35:37.625Z',
      total_quote: '679133400',
      pretty_total_quote: '$679,133,400',
    },
    {
      timestamp: '2020-11-20T15:35:37.625Z',
      total_quote: '628172160',
      pretty_total_quote: '$628,172,160',
    },
    {
      timestamp: '2020-11-19T15:35:37.625Z',
      total_quote: '582136100',
      pretty_total_quote: '$582,136,100',
    },
    {
      timestamp: '2020-11-18T15:35:37.625Z',
      total_quote: '592653900',
      pretty_total_quote: '$592,653,900',
    },
    {
      timestamp: '2020-11-17T15:35:37.625Z',
      total_quote: '595223700',
      pretty_total_quote: '$595,223,700',
    },
    {
      timestamp: '2020-11-16T15:35:37.625Z',
      total_quote: '569827140',
      pretty_total_quote: '$569,827,140',
    },
    {
      timestamp: '2020-11-15T15:35:37.625Z',
      total_quote: '554748860',
      pretty_total_quote: '$554,748,860',
    },
    {
      timestamp: '2020-11-14T15:35:37.625Z',
      total_quote: '571387970',
      pretty_total_quote: '$571,387,970',
    },
    {
      timestamp: '2020-11-13T15:35:37.625Z',
      total_quote: '588015400',
      pretty_total_quote: '$588,015,400',
    },
    {
      timestamp: '2020-11-12T15:35:37.625Z',
      total_quote: '570638900',
      pretty_total_quote: '$570,638,900',
    },
    {
      timestamp: '2020-11-11T15:35:37.625Z',
      total_quote: '572006900',
      pretty_total_quote: '$572,006,900',
    },
    {
      timestamp: '2020-11-10T15:35:37.625Z',
      total_quote: '555438660',
      pretty_total_quote: '$555,438,660',
    },
    {
      timestamp: '2020-11-09T15:35:37.625Z',
      total_quote: '549749250',
      pretty_total_quote: '$549,749,250',
    },
    {
      timestamp: '2020-11-08T15:35:37.625Z',
      total_quote: '562327740',
      pretty_total_quote: '$562,327,740',
    },
    {
      timestamp: '2020-11-07T15:35:37.625Z',
      total_quote: '536775040',
      pretty_total_quote: '$536,775,040',
    },
    {
      timestamp: '2020-11-06T15:35:37.625Z',
      total_quote: '560995460',
      pretty_total_quote: '$560,995,460',
    },
    {
      timestamp: '2020-11-05T15:35:37.625Z',
      total_quote: '513816000',
      pretty_total_quote: '$513,816,000',
    },
    {
      timestamp: '2020-11-04T15:35:37.625Z',
      total_quote: '495053200',
      pretty_total_quote: '$495,053,200',
    },
    {
      timestamp: '2020-11-03T15:35:37.625Z',
      total_quote: '479485980',
      pretty_total_quote: '$479,485,980',
    },
    {
      timestamp: '2020-11-02T15:35:37.625Z',
      total_quote: '473477470',
      pretty_total_quote: '$473,477,470',
    },
    {
      timestamp: '2020-11-01T15:35:37.625Z',
      total_quote: '487772800',
      pretty_total_quote: '$487,772,800',
    },
    {
      timestamp: '2020-10-31T15:35:37.625Z',
      total_quote: '476327870',
      pretty_total_quote: '$476,327,870',
    },
    {
      timestamp: '2020-10-30T15:35:37.625Z',
      total_quote: '471353660',
      pretty_total_quote: '$471,353,660',
    },
    {
      timestamp: '2020-10-29T15:35:37.625Z',
      total_quote: '476969600',
      pretty_total_quote: '$476,969,600',
    },
    {
      timestamp: '2020-10-28T15:35:37.625Z',
      total_quote: '480335500',
      pretty_total_quote: '$480,335,500',
    },
    {
      timestamp: '2020-10-27T15:35:37.625Z',
      total_quote: '498041150',
      pretty_total_quote: '$498,041,150',
    },
    {
      timestamp: '2020-10-26T15:35:37.625Z',
      total_quote: '485631900',
      pretty_total_quote: '$485,631,900',
    },
    {
      timestamp: '2020-10-25T15:35:37.625Z',
      total_quote: '501441540',
      pretty_total_quote: '$501,441,540',
    },
    {
      timestamp: '2020-10-24T15:35:37.625Z',
      total_quote: '508654430',
      pretty_total_quote: '$508,654,430',
    },
    {
      timestamp: '2020-10-23T15:35:37.625Z',
      total_quote: '504775740',
      pretty_total_quote: '$504,775,740',
    },
    {
      timestamp: '2020-10-22T15:35:37.625Z',
      total_quote: '509602200',
      pretty_total_quote: '$509,602,200',
    },
    {
      timestamp: '2020-10-21T15:35:37.625Z',
      total_quote: '482279140',
      pretty_total_quote: '$482,279,140',
    },
    {
      timestamp: '2020-10-20T15:35:37.625Z',
      total_quote: '454405800',
      pretty_total_quote: '$454,405,800',
    },
    {
      timestamp: '2020-10-19T15:35:37.625Z',
      total_quote: '468933980',
      pretty_total_quote: '$468,933,980',
    },
    {
      timestamp: '2020-10-18T15:35:37.625Z',
      total_quote: '467185920',
      pretty_total_quote: '$467,185,920',
    },
    {
      timestamp: '2020-10-17T15:35:37.625Z',
      total_quote: '455256640',
      pretty_total_quote: '$455,256,640',
    },
    {
      timestamp: '2020-10-16T15:35:37.625Z',
      total_quote: '451603420',
      pretty_total_quote: '$451,603,420',
    },
    {
      timestamp: '2020-10-15T15:35:37.625Z',
      total_quote: '465584300',
      pretty_total_quote: '$465,584,300',
    },
    {
      timestamp: '2020-10-14T15:35:37.625Z',
      total_quote: '469060860',
      pretty_total_quote: '$469,060,860',
    },
    {
      timestamp: '2020-10-13T15:35:37.625Z',
      total_quote: '470615170',
      pretty_total_quote: '$470,615,170',
    },
    {
      timestamp: '2020-10-12T15:35:37.625Z',
      total_quote: '478296700',
      pretty_total_quote: '$478,296,700',
    },
  ];

  const data = rawdata
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((price) => ({
      date: new Date(price.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
      price: Number(price.total_quote),
      pretty_price: price.pretty_total_quote,
    }));

  return (
    <AppLayout>
      <div className="w-full font-inter md:mx-auto md:w-2/3 2xl:w-fit">
        {/* Header */}
        <div
          className="p-6 text-center"
          style={{
            background: 'radial-gradient(100% 100% at 50% 100%, #FFECE6 0%, #FFFFFF 100%)',
          }}
        >
          <div>
            <h2 className="font-sora text-4xl font-semibold">{portfolio?.ens}</h2>
            <span className="mt-4 text-sm font-medium" title={address}>
              {address?.slice(0, 11)}.........{address?.slice(-10)}
            </span>
          </div>
          <div className="mt-5 flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <FollowingIcon />
              <span>{portfolio.followers.length}</span>
              <span className="text-bali-hai-600">Following</span>
            </div>
            <div className="flex items-center gap-1">
              <FollowerIcon />
              <span>{portfolio.followings.length}</span>
              <span className="text-bali-hai-600">Followers</span>
            </div>
          </div>
          <div className="mt-5 text-white">
            <button
              className={cn('rounded bg-orange-400 px-4 py-[10px] font-bold', {
                hidden: user.address === address,
              })}
              onClick={handleFollow}
              disabled={following}
            >
              {following ? 'Following...' : 'Follow'}
            </button>
          </div>

          <div className="flex justify-end hover:cursor-pointer" onClick={() => setNotificationOn((state) => !state)}>
            {notificationOn ? <NotificationOnIcon /> : <NotificationsIcon />}
          </div>
        </div>
        <div className="mt-2 flex justify-start gap-6 bg-white px-4 py-6 font-sora text-[32px] 2xl:hidden ">
          <span
            className={cn('leading-8', {
              'text-orange-400': selected === ContentType.PORTFOLIO,
            })}
            onClick={() => setSelected(ContentType.PORTFOLIO)}
          >
            Portfolio
          </span>
          <span
            className={cn('leading-8', {
              'text-orange-400': selected === ContentType.TRANSACTIONS,
            })}
            onClick={() => setSelected(ContentType.TRANSACTIONS)}
          >
            Transactions
          </span>
        </div>
        {/* Main */}
        <div className="mt-2 flex flex-col justify-center gap-4 2xl:flex-row 2xl:justify-between">
          {/* Portfolio */}
          <div
            className={cn('px-0 2xl:w-[808px]', {
              hidden: selected !== ContentType.PORTFOLIO && selected !== ContentType.ALL,
            })}
          >
            <span className="hidden font-sora text-[32px] 2xl:block">Portfolio</span>
            {/* Balance History */}
            <div className="w-full bg-white">
              <div className="flex justify-between p-4">
                <span className="font-sora text-2xl font-semibold">Balance History</span>
                <ChainSelection
                  value={chain}
                  onChange={(chain) => {
                    if (chain) setChain(chain.value);
                  }}
                />
              </div>
              <ResponsiveContainer height={430} width="100%">
                <AreaChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                  <defs>
                    <linearGradient id="quote" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3354F4" stopOpacity={0.8} />
                      <stop offset="85%" stopColor="#6359E8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    interval={365}
                    tickFormatter={(date) => moment(date).format('YYYY')}
                    axisLine={false}
                  />
                  <YAxis orientation="right" axisLine={false} tickLine={false} tickFormatter={keyFormatter} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="price" stroke="#8884d8" fillOpacity={1} fill="url(#quote)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Asset Overview */}
            <div className="mt-2 bg-white p-4">
              <div className="flex justify-between">
                <span className="text-sora text-xl font-semibold">Asset Overview</span>
              </div>
              <div className="mt-2 flex flex-wrap justify-between gap-4">
                {/* <Asset
                  blockchain="All"
                  balance={balanceFormatter(
                    EtherValues + BinanceValues + PolygonValues,
                  )}
                  history={AllSparkLineData}
                />
                <Asset
                  blockchain="BNB Chain"
                  balance={balanceFormatter(BinanceValues)}
                  history={BinanceSparkLineData}
                />
                <Asset
                  blockchain="ETH"
                  balance={balanceFormatter(EtherValues)}
                  history={EthereumSparkLineData}
                />
                <Asset
                  blockchain="Polygon"
                  balance={balanceFormatter(PolygonValues)}
                  history={PolygonSparkLineData}
                /> */}
              </div>
              <TableContainer>
                <Table sx={{ minWidth: 400, heigh: 600 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>Token</TableCell>
                      <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>Amount</TableCell>
                      <TableCell style={{ fontWeight: 600, fontSize: '14px' }}>USD Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {portfolio.balances ? (
                      portfolio.balances.map((token, id) => (
                        <TableRow
                          key={token.contract_address}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                          }}
                        >
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <img
                                src={'/images/tokens/empty-ethereum.png'}
                                width={32}
                                height={32}
                                alt="no icon"
                                loading="lazy"
                              />
                              {token.contract_ticker_symbol}
                            </div>
                          </TableCell>
                          <TableCell>
                            {(Number(token.balance) / 10 ** token.contract_decimals).toLocaleString()}
                          </TableCell>
                          <TableCell>{token.pretty_quote}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          style={{
                            textAlign: 'center',
                            verticalAlign: 'middle',
                          }}
                        >
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
          </div>
          {/* Transaction */}
          <div
            className={cn('mx-auto 2xl:mx-0', {
              hidden: selected !== ContentType.TRANSACTIONS && selected !== ContentType.ALL,
            })}
          >
            <span className="hidden font-sora text-[32px] 2xl:block">Transactions</span>
            {portfolio.transactions.length ? (
              <InfiniteScroll
                dataLength={portfolio.transactions.length}
                next={fetchMoreTransactions}
                hasMore={fetchMore}
                loader={<h4 className="text-center">Loading...</h4>}
              >
                {portfolio.transactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.txHash}
                    transaction={transaction}
                    likes={transaction.likes}
                    dislikes={transaction.dislikes}
                    comments={transaction.comments}
                  />
                ))}
              </InfiniteScroll>
            ) : (
              <EmptyContainer descirption="no transactions" />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
