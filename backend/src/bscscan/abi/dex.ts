export const DEX_ABI = {
  /*
  V2 Pair Contract ABIs
  Supported Dexs: Pancakeswap V2, Uniswap V2, Sushiswap B2
 */

  v2: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount0In',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount1In',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount0Out',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount1Out',
          type: 'uint256',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
      ],
      name: 'Swap',
      type: 'event',
    },

    {
      constant: true,
      inputs: [],
      name: 'token0',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'token1',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
  ],

  /*
  V3 Pair Contract ABIs
  Supported Dexs: Pancakeswap V3, Uniswap V3, 
*/

  v3: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'int256',
          name: 'amount0',
          type: 'int256',
        },
        {
          indexed: false,
          internalType: 'int256',
          name: 'amount1',
          type: 'int256',
        },
        {
          indexed: false,
          internalType: 'uint160',
          name: 'sqrtPriceX96',
          type: 'uint160',
        },
        {
          indexed: false,
          internalType: 'uint128',
          name: 'liquidity',
          type: 'uint128',
        },
        {
          indexed: false,
          internalType: 'int24',
          name: 'tick',
          type: 'int24',
        },
        {
          indexed: false,
          internalType: 'uint128',
          name: 'protocolFeesToken0',
          type: 'uint128',
        },
        {
          indexed: false,
          internalType: 'uint128',
          name: 'protocolFeesToken1',
          type: 'uint128',
        },
      ],
      name: 'Swap',
      type: 'event',
    },
    {
      inputs: [],
      name: 'token0',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'token1',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
  ],
};
