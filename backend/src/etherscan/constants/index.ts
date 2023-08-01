import { UNISWAP_V2_PAIR_ABI } from '../abi/UNISWAP_V2_PAIR_ABI';
import { UNISWAP_V3_POOL_ABI } from '../abi/UNISWAP_V3_POOL_ABI';

export const ETHEREUM_SWAP_TOPICS = {
  '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822': {
    name: 'Uniswap_V2',
    abi: UNISWAP_V2_PAIR_ABI,
  }, // Uniswap V2, Sushiswap
  '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67': {
    name: 'Uniswap_V3',
    abi: UNISWAP_V3_POOL_ABI,
  }, //  Uniswap V3, MetaMask
};
