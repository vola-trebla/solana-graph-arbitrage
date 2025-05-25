// arbitrage-types.ts - Simple types
export interface TokenNode {
  mint: string;
  symbol: string;
  decimals: number;
}

export interface Edge {
  from: string;
  to: string;
  exchange: string;
  rate: number;
  liquidity: number;
  fee: number;
  lastUpdated: number;
}

export interface ArbitrageOpportunity {
  path: string[];
  exchanges: string[];
  expectedProfit: number;
  requiredCapital: number;
  profitPercentage: number;
  gasEstimate: number;
}