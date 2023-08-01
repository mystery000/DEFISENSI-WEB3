import Web3 from 'web3';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PolygonscanService {
  private readonly web3: Web3;
  constructor(private readonly http: HttpService) {}
}
