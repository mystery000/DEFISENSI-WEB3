import { BadRequestException, Injectable } from '@nestjs/common';

import { JSDOM } from 'jsdom';
import * as moment from 'moment';
import { ZenRows } from 'zenrows';
import { logger } from 'src/utils/logger';
import { ConfigService } from '@nestjs/config';
import { CovalenthqChain } from 'src/utils/chains';
import { CovalentClient } from '@covalenthq/client-sdk';
import { ServiceConfig } from 'src/config/service.config';
import {
  BalancesResponse,
  PortfolioResponse,
  TokenPricesResponse,
  TopERC20Token,
  TopNFT,
  TopWallet,
} from 'src/utils/types';
@Injectable()
export class AvalancheService {
  private readonly serviceConfig: ServiceConfig;

  constructor(private readonly configService: ConfigService) {
    this.serviceConfig = this.configService.get<ServiceConfig>('service');
  }

  async getTransactionsByAccount(address: string, fromBlock: number = 0) {}

  async getTransactionsByContract(address: string, fromBlock: number = 0) {}

  async getTransactionsByNFT(address: string, fromBlock: number = 0) {}

  async getPriceFromExchanges(address: string) {}

  async getTopERC20Tokens() {
    let topTokens: TopERC20Token[] = [];
    const url = 'https://avascan.info/blockchain/all/marketcap';
    try {
      const client = new ZenRows(this.serviceConfig.zenrows_api_key);
      const { data } = await client.get(url, { js_render: true, wait_for: 'table.tokens-table' });
      const dom = new JSDOM(data);
      const tokenList = dom.window.document.querySelectorAll('table.tokens-table tbody tr');
      topTokens = Array.from(tokenList).map((token) => {
        return {
          name: token.querySelector('td.evm-td-token span.token-name').innerHTML,
          address: token.querySelector('td.evm-td-token a').getAttribute('href').slice(20),
          price: token.querySelector('td.td-price').textContent.trim(),
          change: '-',
        };
      });
    } catch (error) {
      logger.error(error);
    } finally {
      return topTokens;
    }
  }

  async getTopWallets() {
    let accounts: TopWallet[] = [];
    const url = 'https://avascan.info/stats/top-accounts';
    try {
      const client = new ZenRows(this.serviceConfig.zenrows_api_key);
      const { data } = await client.get(url, { js_render: true, wait_for: '#stats-top-accounts' });
      const dom = new JSDOM(data);
      const accountList = dom.window.document.querySelectorAll('#stats-top-accounts tbody tr');
      accounts = Array.from(accountList).map((account) => {
        return {
          address: account.querySelector('td.td-address a').getAttribute('title').slice(15),
          balance: account.querySelector('td.td-balance').textContent.trim(),
          percentage: '-',
        };
      });
    } catch (error) {
      logger.error(error);
    } finally {
      return accounts;
    }
  }

  async getTopNFTs() {
    let topNFTs: TopNFT[] = [];
    const url = 'https://avax.nftscan.com/ranking';
    try {
      const client = new ZenRows(this.serviceConfig.zenrows_api_key);
      const { data } = await client.get(url, { js_render: true, wait: 30000, wait_for: '.tr____CfO6' });
      const dom = new JSDOM(data);
      const nfts = dom.window.document.querySelectorAll('table tbody tr.tr____CfO6');
      topNFTs = Array.from(nfts).map((nft) => {
        const holdersHTML = nft.querySelector('td:nth-child(2) div.f-small').innerHTML;
        return {
          address: nft.querySelector('td:nth-child(2) a:first-child').getAttribute('href').slice(1),
          name: nft.querySelector('td:nth-child(2) a:first-child').innerHTML,
          volume: nft.querySelector('td:nth-child(4) span').innerHTML + ' AVAX',
          floor: nft.querySelector('td:nth-child(6)').textContent.trim() + ' AVAX',
          change: nft.querySelector('td:nth-child(7)').textContent.trim(),
          holders: holdersHTML.slice(0, holdersHTML.indexOf('Owners') - 1),
        };
      });
    } catch (error) {
      logger.error(error);
    } finally {
      return topNFTs;
    }
  }

  async getTokenBalancesForWalletAddress(address: string): Promise<BalancesResponse> {
    try {
      const client = new CovalentClient(this.serviceConfig.covalenthq_api_key);
      const resp = await client.BalanceService.getTokenBalancesForWalletAddress(CovalenthqChain.Avalanche, address, {
        nft: true,
        quoteCurrency: 'USD',
      });
      return resp.data.items.map((item) => ({
        logo_url: item.logo_url,
        contract_decimals: item.contract_decimals,
        contract_name: item.contract_name,
        contract_address: item.contract_address,
        contract_ticker_symbol: item.contract_ticker_symbol,
        balance: item.balance?.toString() || '0',
        quote: item.quote?.toString() || '0',
        pretty_quote: item.pretty_quote || '0',
        type: item.type,
      }));
    } catch (error) {
      logger.error(error);
      throw new BadRequestException(`Malformed address provided: ${address}`);
    }
  }

  async getHistoricalPortfolioForWalletAddress(address: string, days: number): Promise<PortfolioResponse> {
    try {
      const client = new CovalentClient(this.serviceConfig.covalenthq_api_key);
      const resp = await client.BalanceService.getHistoricalPortfolioForWalletAddress(
        CovalenthqChain.Avalanche,
        address,
        {
          days: days,
          quoteCurrency: 'USD',
        },
      );

      const transformedData = resp.data.items.reduce((acc, curr) => {
        const singleTokenTimeSeries = curr.holdings.map((holdingsItem) => {
          return {
            timestamp: holdingsItem.timestamp,
            [curr.contract_ticker_symbol]: holdingsItem.close.quote || 0,
          };
        });
        const newArr = singleTokenTimeSeries.map((item, i) => Object.assign(item, acc[i]));
        return newArr;
      }, []);
      return transformedData.map((data) => {
        let total = 0;
        for (const [key, value] of Object.entries(data)) {
          if (key === 'timestamp') continue;
          total += Number(value);
        }
        return {
          timestamp: data.timestamp,
          total_quote: total.toString(),
          pretty_total_quote: `$${total.toLocaleString()}`,
        };
      });
    } catch (error) {
      logger.error(error);
      throw new BadRequestException(`Malformed address provided: ${address}`);
    }
  }

  async getTokenPrices(address: string, from: string, to: string): Promise<TokenPricesResponse> {
    if (!moment(from, 'YYYY-MM-DD', true).isValid() || !moment(to, 'YYYY-MM-DD', true).isValid()) {
      throw new BadRequestException('Please use YYYY-MM-DD date format');
    }
    try {
      const client = new CovalentClient(this.serviceConfig.covalenthq_api_key);
      const resp = await client.PricingService.getTokenPrices(CovalenthqChain.Avalanche, 'USD', address, { to, from });
      return resp.data[0];
    } catch (error) {
      logger.error(error);
      throw new BadRequestException(`Malformed address provided: ${address}`);
    }
  }

  async test() {
    return this.getTopERC20Tokens();
  }
}
