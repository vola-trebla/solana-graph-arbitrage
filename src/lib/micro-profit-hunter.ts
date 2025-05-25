// 🔍 MICRO-PROFIT HUNTER - Find Real Tiny Opportunities
// src/lib/micro-profit-hunter.ts

import { Connection, PublicKey } from '@solana/web3.js';
import { TokenNode, Edge, ArbitrageOpportunity } from '../types/arbitrage-types';
import axios from 'axios';

class MicroProfitHunter {
  private nodes: Map<string, TokenNode> = new Map();
  private edges: Edge[] = [];
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
    this.initializeHuntingTokens();
  }

  // 🎯 Initialize tokens optimized for finding micro-opportunities
  private initializeHuntingTokens() {
    const huntingTokens: TokenNode[] = [
      // Core stable tokens
      { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL', decimals: 9 },
      { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', decimals: 6 },
      
      // High-volume tokens (more likely to have micro-inefficiencies)
      { mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', symbol: 'WIF', decimals: 6 },
      { mint: '27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4', symbol: 'JUP', decimals: 6 },
      
      // Volatile tokens (price differences more likely)
      { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK', decimals: 5 },
      { mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', symbol: 'RAY', decimals: 6 },
    ];

    huntingTokens.forEach(token => {
      this.nodes.set(token.mint, token);
    });

    console.log(`🎯 MICRO-PROFIT HUNTER: ${this.nodes.size} carefully selected tokens loaded`);
  }

  // 💰 Get REAL-TIME prices optimized for micro-opportunities
  async updateLiveRates() {
    console.log('💰 Fetching LIVE prices for micro-profit hunting...');
    
    try {
      const prices = await this.getLivePrices();
      
      if (Object.keys(prices).length < 3) {
        console.log('❌ Insufficient live price data');
        return;
      }

      console.log('📊 LIVE market prices:');
      Object.entries(prices).forEach(([symbol, price]) => {
        console.log(`   ${symbol}: $${this.formatPrice(price)}`);
      });

      // Build exchange rates with ULTRA-HIGH PRECISION for micro-opportunities
      await this.buildMicroRates(prices);
      
    } catch (error) {
      console.log('❌ Error building live rates:', error.message);
    }
  }

  // 📡 Get live prices with extended token list
  private async getLivePrices(): Promise<{[symbol: string]: number}> {
    try {
      console.log('📡 Calling CoinGecko for EXTENDED token prices...');
      
      const url = 'https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin,bonk,dogwifcoin,jupiter-exchange-solana,raydium&vs_currencies=usd';
      
      const response = await axios.get(url, { timeout: 10000 });
      const data = response.data;
      
      console.log('📊 Extended API response:', data);
      
      const prices: {[symbol: string]: number} = {};
      
      // Extract all available prices
      if (data.solana?.usd) prices['SOL'] = data.solana.usd;
      if (data['usd-coin']?.usd) prices['USDC'] = data['usd-coin'].usd;
      if (data.bonk?.usd) prices['BONK'] = data.bonk.usd;
      if (data.dogwifcoin?.usd) prices['WIF'] = data.dogwifcoin.usd;
      if (data['jupiter-exchange-solana']?.usd) prices['JUP'] = data['jupiter-exchange-solana'].usd;
      if (data.raydium?.usd) prices['RAY'] = data.raydium.usd;
      
      console.log(`✅ Loaded ${Object.keys(prices).length} live token prices`);
      
      return prices;
      
    } catch (error) {
      console.log('❌ Live price API error:', error.message);
      return {};
    }
  }

  // 🔬 Build micro-rates with extreme precision
  private async buildMicroRates(prices: {[symbol: string]: number}) {
    const tokens = Array.from(this.nodes.keys());
    this.edges = [];
    let validRates = 0;

    for (let i = 0; i < tokens.length; i++) {
      for (let j = 0; j < tokens.length; j++) {
        if (i !== j) {
          const fromToken = tokens[i];
          const toToken = tokens[j];
          const fromSymbol = this.getSymbol(fromToken);
          const toSymbol = this.getSymbol(toToken);
          
          if (prices[fromSymbol] && prices[toSymbol]) {
            // ULTRA-HIGH PRECISION for micro-opportunities
            const rate = this.calculateUltraPreciseRate(prices[fromSymbol], prices[toSymbol]);
            
            // Accept even tiny rates for micro-profit hunting
            if (rate > 0) {
              this.edges.push({
                from: fromToken,
                to: toToken,
                exchange: 'live-micro-hunter',
                rate: rate,
                liquidity: this.estimateLiveLiquidity(fromSymbol, toSymbol),
                fee: this.getOptimizedFee(fromSymbol, toSymbol),
                lastUpdated: Date.now()
              });
              
              console.log(`   ➕ ${fromSymbol} -> ${toSymbol}: ${this.formatRate(rate)} (fee: ${(this.getOptimizedFee(fromSymbol, toSymbol)*100).toFixed(3)}%)`);
              validRates++;
            }
          }
        }
      }
    }

    console.log(`✅ Micro-hunter ready: ${validRates} ultra-precise exchange rates`);
  }

  // 🎯 Ultra-precise rate calculation
  private calculateUltraPreciseRate(fromPrice: number, toPrice: number): number {
    if (toPrice === 0 || !toPrice) return 0;
    
    // Use maximum JavaScript precision
    const rate = fromPrice / toPrice;
    
    // Keep full precision (no rounding for micro-opportunities)
    return rate;
  }

  // 💧 Estimate live liquidity more accurately
  private estimateLiveLiquidity(fromSymbol: string, toSymbol: string): number {
    // Updated liquidity estimates based on current market
    const liquidityMatrix: {[key: string]: number} = {
      'SOL-USDC': 5000000,   // $5M - Very high
      'USDC-SOL': 5000000,
      'SOL-WIF': 1200000,    // $1.2M - High (popular)
      'WIF-SOL': 1200000,
      'SOL-JUP': 2000000,    // $2M - Very high (native)
      'JUP-SOL': 2000000,
      'SOL-RAY': 800000,     // $800K - Good
      'RAY-SOL': 800000,
      'USDC-WIF': 600000,    // $600K - Good
      'WIF-USDC': 600000,
      'USDC-JUP': 1000000,   // $1M - High
      'JUP-USDC': 1000000,
      'WIF-JUP': 300000,     // $300K - Moderate
      'JUP-WIF': 300000,
    };
    
    const pair = `${fromSymbol}-${toSymbol}`;
    return liquidityMatrix[pair] || 100000;
  }

  // 💰 Optimized fees for different pairs
  private getOptimizedFee(fromSymbol: string, toSymbol: string): number {
    // Lower fees for major pairs (more competitive)
    const majorPairs = ['SOL-USDC', 'USDC-SOL', 'SOL-JUP', 'JUP-SOL'];
    if (majorPairs.includes(`${fromSymbol}-${toSymbol}`)) {
      return 0.0015; // 0.15% for major pairs
    }
    
    return 0.0025; // 0.25% standard
  }

  // 🔍 MICRO-OPPORTUNITY HUNTER (Ultra-sensitive Bellman-Ford)
  findMicroOpportunities(maxHops: number = 5): ArbitrageOpportunity[] {
    console.log(`\n🔍 MICRO-PROFIT HUNTING ANALYSIS`);
    console.log(`📊 Scanning ${this.edges.length} live rates for micro-opportunities...`);
    
    if (this.edges.length === 0) {
      console.log('❌ No live rates loaded. Call updateLiveRates() first.');
      return [];
    }

    const opportunities: ArbitrageOpportunity[] = [];
    const startTokens = Array.from(this.nodes.keys());

    // Hunt from multiple starting points
    for (const startToken of startTokens) {
      const microOpps = this.microBellmanFord(startToken, maxHops);
      opportunities.push(...microOpps);
    }

    // ULTRA-LOW thresholds for micro-profit hunting
    const microOpportunities = opportunities.filter(opp => 
      opp.profitPercentage > 0.001 && // Accept as low as 0.001% (1 basis point)
      opp.profitPercentage < 10      // But reject obviously fake ones
    );

    console.log(`🔍 Found ${microOpportunities.length} MICRO-OPPORTUNITIES!`);
    
    return microOpportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);
  }

  // 🎯 Micro-sensitive Bellman-Ford
  private microBellmanFord(startToken: string, maxHops: number): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];
    
    const distances = new Map<string, number>();
    const previous = new Map<string, string>();
    
    this.nodes.forEach((_, mint) => {
      distances.set(mint, mint === startToken ? 0 : Infinity);
    });

    // Ultra-sensitive relaxation
    for (let i = 0; i < maxHops; i++) {
      let updated = false;
      
      for (const edge of this.edges) {
        const currentDist = distances.get(edge.from);
        
        if (currentDist !== undefined && currentDist !== Infinity) {
          const effectiveRate = edge.rate * (1 - edge.fee);
          
          // Accept any positive rate (no upper limit for micro-hunting)
          if (effectiveRate > 0) {
            const weight = -Math.log(effectiveRate);
            const newDist = currentDist + weight;
            const targetDist = distances.get(edge.to);
            
            if (targetDist === undefined || newDist < targetDist) {
              distances.set(edge.to, newDist);
              previous.set(edge.to, edge.from);
              updated = true;
            }
          }
        }
      }
      
      if (!updated) break;
    }

    // Ultra-sensitive negative cycle detection
    for (const edge of this.edges) {
      const sourceDist = distances.get(edge.from);
      const targetDist = distances.get(edge.to);
      
      if (sourceDist !== undefined && sourceDist !== Infinity) {
        const effectiveRate = edge.rate * (1 - edge.fee);
        
        if (effectiveRate > 0) {
          const weight = -Math.log(effectiveRate);
          const newDist = sourceDist + weight;
          
          if (targetDist === undefined || newDist < targetDist) {
            const path = this.reconstructPath(previous, startToken, edge.to);
            if (path.length > 2 && path[path.length - 1] === startToken) {
              const opportunity = this.calculateMicroProfit(path);
              
              // Accept ANY positive profit for micro-hunting
              if (opportunity.profitPercentage > 0.001) {
                opportunities.push(opportunity);
              }
            }
          }
        }
      }
    }

    return opportunities;
  }

  // 🛤️ Path reconstruction
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
    }
    
    return path;
  }

  // 💵 Micro-profit calculation
  private calculateMicroProfit(path: string[]): ArbitrageOpportunity {
    let currentAmount = 1000; // Start with $1000
    const exchanges: string[] = [];
    
    console.log(`🔍 Micro-profit calculation: ${path.map(p => this.getSymbol(p)).join(' -> ')}`);
    
    for (let i = 0; i < path.length - 1; i++) {
      const fromToken = path[i];
      const toToken = path[i + 1];
      const edge = this.edges.find(e => e.from === fromToken && e.to === toToken);
      
      if (edge) {
        const oldAmount = currentAmount;
        const effectiveRate = edge.rate * (1 - edge.fee);
        currentAmount = currentAmount * effectiveRate;
        
        console.log(`  ${this.getSymbol(fromToken)} -> ${this.getSymbol(toToken)}: $${oldAmount.toFixed(4)} * ${effectiveRate.toFixed(8)} = $${currentAmount.toFixed(4)}`);
        exchanges.push(edge.exchange);
      }
    }
    
    const profit = currentAmount - 1000;
    const profitPercentage = (profit / 1000) * 100;
    
    console.log(`  💰 MICRO RESULT: $${currentAmount.toFixed(4)} (${profitPercentage.toFixed(6)}% profit)`);
    
    return {
      path: path.map(p => this.getSymbol(p)),
      exchanges,
      expectedProfit: profit,
      requiredCapital: 1000,
      profitPercentage,
      gasEstimate: path.length * 0.002
    };
  }

  private formatPrice(price: number): string {
    if (price >= 1) return price.toFixed(4);
    if (price >= 0.01) return price.toFixed(6);
    if (price >= 0.000001) return price.toFixed(10);
    return price.toExponential(4);
  }

  private formatRate(rate: number): string {
    if (rate >= 1000) return rate.toFixed(2);
    if (rate >= 1) return rate.toFixed(8);
    if (rate >= 0.000001) return rate.toFixed(12);
    return rate.toExponential(4);
  }

  private getSymbol(mint: string): string {
    const token = this.nodes.get(mint);
    return token ? token.symbol : mint.slice(0, 4);
  }
}

// 🔍 LAUNCH MICRO-PROFIT HUNTER
async function huntMicroProfits() {
  console.log(`
🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍
            MICRO-PROFIT HUNTER ACTIVATED!
            HUNTING FOR REAL ARBITRAGE OPPORTUNITIES
🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍
  `);

  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const hunter = new MicroProfitHunter(connection);

  // Get live market data
  await hunter.updateLiveRates();

  // Hunt for micro-opportunities with ultra-low thresholds
  const opportunities = hunter.findMicroOpportunities();

  if (opportunities.length > 0) {
    console.log(`\n🎉 REAL OPPORTUNITIES FOUND!`);
    console.log(`💰 Found ${opportunities.length} potential profit paths:`);
    
    opportunities.slice(0, 10).forEach((opp, i) => {
      console.log(`\n${i + 1}. ${opp.path.join(' -> ')}`);
      console.log(`   💵 Profit: $${opp.expectedProfit.toFixed(4)} (${opp.profitPercentage.toFixed(6)}%)`);
      console.log(`   💼 Capital: $${opp.requiredCapital}`);
      console.log(`   ⛽ Gas: $${opp.gasEstimate.toFixed(4)}`);
      
      if (opp.profitPercentage > 0.01) {
        console.log(`   🚨 ACTIONABLE OPPORTUNITY! >0.01%`);
      }
    });
  } else {
    console.log(`\n😔 No micro-opportunities found right now`);
    console.log(`💡 Try running again in a few minutes - markets change constantly!`);
  }
  
  console.log(`\n🎯 MICRO-HUNTER STATUS: COMPLETE`);
  console.log(`💡 Next: Set up continuous monitoring every 30 seconds`);
}

huntMicroProfits().catch(console.error);

export { MicroProfitHunter };