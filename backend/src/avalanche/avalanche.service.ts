import { Injectable } from '@nestjs/common';

import { JSDOM } from 'jsdom';
import { ZenRows } from 'zenrows';
import { TopNFT } from 'src/utils/types';
import { logger } from 'src/utils/logger';

@Injectable()
export class AvalancheService {
  async getTopNFTs() {
    let topNFTs: TopNFT[] = [];
    const url = 'https://avax.nftscan.com/ranking';
    try {
      const client = new ZenRows(process.env.ZENROWS_API_KEY);
      const { data } = await client.get(url, { js_render: true, wait: 30000, wait_for: '.tr____CfO6' });
      const dom = new JSDOM(data);
      const nfts = dom.window.document.querySelectorAll('table tbody tr.tr____CfO6');
      topNFTs = Array.from(nfts).map((nft) => {
        const holdersHTML = nft.querySelector('td:nth-child(2) div.f-small').innerHTML;
        return {
          address: nft.querySelector('td:nth-child(2) a:first-child').getAttribute('href').slice(1),
          name: nft.querySelector('td:nth-child(2) a:first-child').innerHTML,
          volume: nft.querySelector('td:nth-child(4) span').innerHTML + ' MATIC',
          floor: nft.querySelector('td:nth-child(6)').textContent.trim() + ' MATIC',
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

  async test() {
    return this.getTopNFTs();
  }
}
