// 🚀 ArbitrageGraph with Axios (Real API Calls)
// src/lib/graph-arbitrage.ts

import { Connection, PublicKey } from '@solana/web3.js';
import { TokenNode, Edge, ArbitrageOpportunity } from '../types/arbitrage-types';
import axios from 'axios';

class ArbitrageGraph {
  private nodes: Map<string, TokenNode> = new Map();
  private edges: Edge[] = [];
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  addToken(token: TokenNode) {
    this.nodes.set(token.mint, token);
    console.log(`➕ Added token: ${token.symbol} (${token.mint.slice(0, 8)}...)`);
  }

  addEdge(edge: Edge) {
    this.edges.push(edge);
    console.log(`➕ Added edge: ${this.getSymbol(edge.from)} -> ${this.getSymbol(edge.to)}, rate: ${edge.rate.toFixed(4)}`);
  }

  // 🔄 Get real exchange rates using axios
  async updateRatesFromPrices() {
    console.log('🔄 Fetching real token prices with axios...');
    
    try {
      // Get current prices for each token using CoinGecko API
      const prices = await this.getTokenPrices();
      
      if (Object.keys(prices).length < 2) {
        console.log('❌ Could not fetch enough prices, using realistic mock data');
        this.addRealisticRates();
        return;
      }

      console.log('💰 Current real prices:', prices);

      // Calculate exchange rates between all token pairs
      const tokens = Array.from(this.nodes.keys());
      let ratesAdded = 0;

      for (let i = 0; i < tokens.length; i++) {
        for (let j = 0; j < tokens.length; j++) {
          if (i !== j) {
            const fromToken = tokens[i];
            const toToken = tokens[j];
            const fromSymbol = this.getSymbol(fromToken);
            const toSymbol = this.getSymbol(toToken);
            
            if (prices[fromSymbol] && prices[toSymbol]) {
              // Rate = how much toToken you get for 1 fromToken
              const rate = prices[fromSymbol] / prices[toSymbol];
              
              this.addEdge({
                from: fromToken,
                to: toToken,
                exchange: 'real-market',
                rate: rate,
                liquidity: 100000,
                fee: 0.0025, // 0.25% fee assumption
                lastUpdated: Date.now()
              });
              ratesAdded++;
            }
          }
        }
      }

      console.log(`✅ Added ${ratesAdded} real market exchange rates`);
      
    } catch (error) {
      console.log('❌ Error fetching real prices, using realistic mock data:', error);
      this.addRealisticRates();
    }
  }

  // 💰 Get real token prices using axios
  private async getTokenPrices(): Promise<{[symbol: string]: number}> {
    try {
      console.log('📡 Calling CoinGecko API...');
      
      // Use CoinGecko API (free, no auth required)
      const url = 'https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin,bonk&vs_currencies=usd';
      
      const response = await axios.get(url);
      const data = response.data;
      
      console.log('📊 API Response:', data);
      
      return {
        'SOL': data.solana?.usd || 0,
        'USDC': data['usd-coin']?.usd || 1, 
        'BONK': data.bonk?.usd || 0
      };
    } catch (error) {
      console.log('❌ Price API error:', error.message);
      return {};
    }
  }





  // 🎭 Add realistic rates based on current market data
  private addRealisticRates() {
    console.log('💰 Adding realistic exchange rates (Jan 2025 market data)...');
    
    // Realistic rates (no profitable arbitrage - as expected in efficient markets)
    const realisticRates = [
      { from: 'So11111111111111111111111111111111111111112', to: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', rate: 180.5 }, // SOL -> USDC ($180.5)
      { from: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', to: 'So11111111111111111111111111111111111111112', rate: 0.00554 }, // USDC -> SOL
      { from: 'So11111111111111111111111111111111111111112', to: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', rate: 7200000 }, // SOL -> BONK
      { from: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', to: 'So11111111111111111111111111111111111111112', rate: 0.00000014 }, // BONK -> SOL
      { from: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', to: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', rate: 40000 }, // USDC -> BONK
      { from: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', to: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', rate: 0.000025 }, // BONK -> USDC
    ];

    realisticRates.forEach(rate => {
      this.addEdge({
        from: rate.from,
        to: rate.to,
        exchange: 'realistic',
        rate: rate.rate,
        liquidity: 50000,
        fee: 0.0025,
        lastUpdated: Date.now()
      });
    });
  }

  // 🎯 Find arbitrage opportunities using Bellman-Ford algorithm  
  findArbitrageOpportunities(startToken: string, maxHops: number = 4): ArbitrageOpportunity[] {
    console.log(`\n🎯 Starting arbitrage search from: ${this.getSymbol(startToken)}`);
    
    if (this.edges.length === 0) {
      console.log('❌ No exchange rates loaded. Call updateRatesFromPrices() first.');
      return [];
    }

    // Initialize distances
    const distances = new Map<string, number>();
    const previous = new Map<string, string>();
    
    this.nodes.forEach((_, mint) => {
      distances.set(mint, mint === startToken ? 0 : Infinity);
    });

    // Bellman-Ford relaxation
    for (let i = 0; i < maxHops; i++) {
      let updated = false;
      
      for (const edge of this.edges) {
        const currentDist = distances.get(edge.from);
        const targetDist = distances.get(edge.to);
        
        if (currentDist !== undefined && currentDist !== Infinity) {
          const weight = -Math.log(edge.rate * (1 - edge.fee));
          const newDist = currentDist + weight;
          
          if (targetDist === undefined || newDist < targetDist) {
            distances.set(edge.to, newDist);
            previous.set(edge.to, edge.from);
            updated = true;
          }
        }
      }
      
      if (!updated) break;
    }

    // Check for negative cycles
    const opportunities: ArbitrageOpportunity[] = [];
    
    for (const edge of this.edges) {
      const sourceDist = distances.get(edge.from);
      const targetDist = distances.get(edge.to);
      
      if (sourceDist !== undefined && sourceDist !== Infinity) {
        const weight = -Math.log(edge.rate * (1 - edge.fee));
        const newDist = sourceDist + weight;
        
        if (targetDist === undefined || newDist < targetDist) {
          const path = this.reconstructPath(previous, startToken, edge.to);
          if (path.length > 2 && path[path.length - 1] === startToken) {
            const profit = this.calculateProfit(path);
            if (profit.profitPercentage > 0.1) {
              opportunities.push(profit);
            }
          }
        }
      }
    }

    return opportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);
  }

  private reconstructPath(previous: Map<string, string>, start: string, end: string): string[] {
    const path: string[] = [];
    let current = end;
    const visited = new Set<string>();
    
    while (current && !visited.has(current) && path.length < 10) {
      path.unshift(current);
      visited.add(current);
      current = previous.get(current)!;
    }
    
    if (current === start) {
      path.unshift(start);
      path.push(start);
    } else {
      // Fallback: create simple cycle
      const nodes = Array.from(this.nodes.keys());
      if (nodes.length >= 3) {
        return [nodes[0], nodes[1], nodes[2], nodes[0]];
      }
    }
    
    return path;
  }

  private calculateProfit(path: string[]): ArbitrageOpportunity {
    let currentAmount = 1000;
    const exchanges: string[] = [];
    
    console.log(`💰 Profit calculation for: ${path.map(p => this.getSymbol(p)).join(' -> ')}`);
    
    for (let i = 0; i < path.length - 1; i++) {
      const fromToken = path[i];
      const toToken = path[i + 1];
      const edge = this.edges.find(e => e.from === fromToken && e.to === toToken);
      
      if (edge) {
        const oldAmount = currentAmount;
        currentAmount = currentAmount * edge.rate * (1 - edge.fee);
        console.log(`  ${this.getSymbol(fromToken)} -> ${this.getSymbol(toToken)}: ${oldAmount.toFixed(2)} * ${edge.rate.toFixed(6)} * ${(1-edge.fee).toFixed(4)} = ${currentAmount.toFixed(2)}`);
        exchanges.push(edge.exchange);
      }
    }
    
    const profit = currentAmount - 1000;
    const profitPercentage = (profit / 1000) * 100;
    
    console.log(`  Final: ${currentAmount.toFixed(2)}, Profit: ${profitPercentage.toFixed(3)}%`);
    
    return {
      path: path.map(p => this.getSymbol(p)),
      exchanges,
      expectedProfit: profit,
      requiredCapital: 1000,
      profitPercentage,
      gasEstimate: path.length * 0.001
    };
  }

  private getSymbol(mint: string): string {
    const token = this.nodes.get(mint);
    return token ? token.symbol : mint.slice(0, 8) + '...';
  }

  printStats() {
    console.log(`\n📊 Graph Stats: ${this.nodes.size} tokens, ${this.edges.length} edges`);
  }
}

// 🧪 Test with Real/Mock Data
async function testWithRealData() {
  console.log('🧪 Testing ArbitrageGraph with Real Solana Data\n');

  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const graph = new ArbitrageGraph(connection);

  // Add popular Solana tokens
  const realTokens: TokenNode[] = [
    { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL', decimals: 9 },
    { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', decimals: 6 },
    { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK', decimals: 5 }
  ];

  realTokens.forEach(token => graph.addToken(token));

  // Fetch real exchange rates
  await graph.updateRatesFromPrices();

  // Look for arbitrage opportunities
  const opportunities = graph.findArbitrageOpportunities('So11111111111111111111111111111111111111112');

  if (opportunities.length > 0) {
    console.log(`\n💰 Found ${opportunities.length} arbitrage opportunities:`);
    opportunities.slice(0, 5).forEach((opp, i) => {
      console.log(`${i + 1}. ${opp.path.join(' -> ')}: ${opp.profitPercentage.toFixed(3)}% profit`);
    });
  } else {
    console.log('\n😔 No profitable arbitrage opportunities found');
    console.log('💡 Real markets are efficient - arbitrage is rare!');
  }

  graph.printStats();
}

testWithRealData().catch(console.error);

export { ArbitrageGraph };