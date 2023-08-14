import { Injectable } from '@nestjs/common';

import Moralis from 'moralis';

Moralis.start({
  apiKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImRlZWQzOTgyLWRhY2QtNDA1OS05YzY3LTAzNTE3ZTRjNjliYiIsIm9yZ0lkIjoiMzUyNjE4IiwidXNlcklkIjoiMzYyNDI5IiwidHlwZUlkIjoiOGUwZGVmY2EtMTBhYS00NDhmLTlhOWQtYWRjM2M1ZDNlNGUxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2OTE3NTY5MzIsImV4cCI6NDg0NzUxNjkzMn0.vUXf0-hjBW-fxaO9eMLQaM5EWiLfXLn80xN2XILRpr0',
});

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Defisensi!';
  }
}
