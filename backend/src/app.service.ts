import { Injectable } from '@nestjs/common';

import Moralis from 'moralis';

Moralis.start({
  apiKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjRjYTcyNGEwLTBlMmMtNDI1Ni1iM2ExLTA5OTc4ZGM5MmZiNyIsIm9yZ0lkIjoiMzUyMTY1IiwidXNlcklkIjoiMzYxOTY0IiwidHlwZUlkIjoiOWRhZGVlNjctMDhlMi00NjE3LWIyNGEtOTMxYTBhYTBlNjQyIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2OTE1MjgzNDQsImV4cCI6NDg0NzI4ODM0NH0.VILSyD1-6vvVFSqvOQs7Ui9PiUwMh_veRwEpb3W-YWY',
});

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Defisensi!';
  }
}
