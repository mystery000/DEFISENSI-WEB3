export const isUniswapV2 = (signature: string) => {
  if (signature == 'Swap(address,uint256,uint256,uint256,uint256,address)') return true;
  return false;
};

export const isUniswapV3 = (signature: string) => {
  if (signature == 'Swap(address,address,int256,int256,uint160,uint128,int24)') return true;
  return false;
};
