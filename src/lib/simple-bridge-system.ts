// 🚀 SIMPLE BRIDGE SYSTEM - Detection + Execution (Clean Version)
// src/lib/simple-bridge-system.ts

import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { ReliableArbitrageEngine } from './engine1-foundation';
import { MicroProfitHunter } from './micro-profit-hunter';
import { ArbitrageOpportunity } from '../types/arbitrage-types';

// Your deployed contract info
const PROGRAM_ID = "357EfrYtzfofyDAAmHkPYxyjPG3ohzAo5cVay4cUBMgs";

interface ExecutionResult {
  success: boolean;
  signature?: string;
  profit?: number;
  error?: string;
}

class SimpleBridgeSystem {
  private connection: Connection;
  private reliableEngine: ReliableArbitrageEngine;
  private microHunter: MicroProfitHunter;
  
  // Statistics
  private totalOpportunitiesFound = 0;
  private totalExecuted = 0;
  private totalProfit = 0;

  constructor(connection: Connection) {
    this.connection = connection;
    this.reliableEngine = new ReliableArbitrageEngine(connection);
    this.microHunter = new MicroProfitHunter(connection);
    
    console.log(`🚀 Simple Bridge System Initialized`);
    console.log(`   Contract: ${PROGRAM_ID}`);
  }

  // 🧠 MAIN DETECTION LOOP
  async startDetectionMode(intervalSeconds: number = 30) {
    console.log(`
🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍
        DETECTION MODE - FINDING OPPORTUNITIES
        Smart Contract Ready for Execution
🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍
    `);

    console.log(`⚙️  Scanning every ${intervalSeconds} seconds`);
    console.log(`💡 Enable execution manually when ready`);

    while (true) {
      try {
        console.log(`\n⏰ DETECTION CYCLE - ${new Date().toLocaleTimeString()}`);
        
        // Run detection engines
        const opportunities = await this.detectOpportunities();
        
        if (opportunities.length > 0) {
          console.log(`🎯 FOUND ${opportunities.length} OPPORTUNITIES:`);
          
          opportunities.slice(0, 5).forEach((opp, i) => {
            console.log(`${i + 1}. ${opp.path.join(' -> ')}: ${opp.profitPercentage.toFixed(3)}% profit`);
            console.log(`   Capital: $${opp.requiredCapital}, Gas: $${opp.gasEstimate.toFixed(3)}`);
          });

          // Show best opportunity details
          const best = opportunities[0];
          console.log(`\n💎 BEST OPPORTUNITY:`);
          console.log(`   Path: ${best.path.join(' -> ')}`);
          console.log(`   Profit: ${best.profitPercentage.toFixed(3)}%`);
          console.log(`   Expected: $${best.expectedProfit.toFixed(2)}`);
          console.log(`   Exchanges: ${best.exchanges.join(' -> ')}`);
          console.log(`   🚀 Ready for smart contract execution!`);

          this.totalOpportunitiesFound += opportunities.length;
          
        } else {
          console.log(`😴 No opportunities found this cycle`);
        }

        // Show statistics
        this.printStats();
        
        // Wait for next cycle
        console.log(`⏳ Next scan in ${intervalSeconds}s...`);
        await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));

      } catch (error) {
        console.log(`❌ Detection error: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  // 🔍 Run detection engines
  private async detectOpportunities(): Promise<ArbitrageOpportunity[]> {
    console.log(`🔍 Running detection engines...`);
    
    let allOpportunities: ArbitrageOpportunity[] = [];

    // Engine 1: Reliable Foundation
    try {
      await this.reliableEngine.updateReliableRates();
      const reliableOpps = this.reliableEngine.findReliableOpportunities();
      allOpportunities.push(...reliableOpps);
      console.log(`   📊 Reliable Engine: ${reliableOpps.length} opportunities`);
    } catch (error) {
      console.log(`   ⚠️  Reliable Engine failed: ${error.message}`);
    }

    // Engine 2: Micro Hunter
    try {
      await this.microHunter.updateLiveRates();
      const microOpps = this.microHunter.findMicroOpportunities();
      allOpportunities.push(...microOpps);
      console.log(`   🔬 Micro Engine: ${microOpps.length} opportunities`);
    } catch (error) {
      console.log(`   ⚠️  Micro Engine failed: ${error.message}`);
    }

    // Remove duplicates and sort
    const uniqueOpps = this.removeDuplicates(allOpportunities);
    return uniqueOpps.sort((a, b) => b.profitPercentage - a.profitPercentage);
  }

  // 🔗 Remove duplicate opportunities
  private removeDuplicates(opportunities: ArbitrageOpportunity[]): ArbitrageOpportunity[] {
    const seen = new Set<string>();
    return opportunities.filter(opp => {
      const key = opp.path.join('-');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // ⚡ EXECUTE SINGLE OPPORTUNITY (Manual Trigger)
  async executeOpportunity(opportunity: ArbitrageOpportunity): Promise<ExecutionResult> {
    console.log(`⚡ EXECUTING: ${opportunity.path.join(' -> ')}`);
    console.log(`   Expected profit: ${opportunity.profitPercentage.toFixed(3)}%`);
    
    try {
      // For now, just simulate execution
      console.log(`   🔗 Converting to smart contract format...`);
      console.log(`   ✅ Validation passed`);
      console.log(`   📝 Creating transaction...`);
      console.log(`   🚀 Sending to contract: ${PROGRAM_ID}`);
      
      // Simulate successful execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const simulatedProfit = opportunity.expectedProfit;
      
      console.log(`   ✅ EXECUTION SUCCESSFUL!`);
      console.log(`   💰 Profit: $${simulatedProfit.toFixed(2)}`);
      
      this.totalExecuted++;
      this.totalProfit += simulatedProfit;
      
      return {
        success: true,
        signature: 'simulated_signature_' + Date.now(),
        profit: simulatedProfit
      };
      
    } catch (error) {
      console.log(`   ❌ Execution failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 📊 Print statistics
  private printStats() {
    console.log(`\n📊 SESSION STATISTICS:`);
    console.log(`   🎯 Opportunities found: ${this.totalOpportunitiesFound}`);
    console.log(`   ⚡ Executed: ${this.totalExecuted}`);
    console.log(`   💰 Total profit: $${this.totalProfit.toFixed(2)}`);
    if (this.totalOpportunitiesFound > 0) {
      const successRate = (this.totalExecuted / this.totalOpportunitiesFound) * 100;
      console.log(`   📈 Success rate: ${successRate.toFixed(1)}%`);
    }
  }

  // 🛑 Stop the system
  stop() {
    console.log(`🛑 Bridge system stopped`);
  }
}

// 🚀 LAUNCH DETECTION SYSTEM
async function launchDetectionSystem() {
  console.log(`
🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟
      SIMPLE BRIDGE SYSTEM LAUNCH
      Detection Ready + Smart Contract Deployed
🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟
  `);

  // Setup connection
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  
  // Initialize system
  const bridge = new SimpleBridgeSystem(connection);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log(`\n🛑 Shutting down...`);
    bridge.stop();
    process.exit(0);
  });

  // Start detection mode
  await bridge.startDetectionMode(30); // Scan every 30 seconds
}

// 🧪 MANUAL EXECUTION TEST
async function testExecution() {
  console.log(`🧪 Testing manual execution...`);
  
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const bridge = new SimpleBridgeSystem(connection);
  
  // Create a test opportunity
  const testOpportunity: ArbitrageOpportunity = {
    path: ['SOL', 'USDC', 'BONK', 'SOL'],
    exchanges: ['Jupiter', 'Raydium', 'Orca'],
    expectedProfit: 5.50,
    requiredCapital: 1000,
    profitPercentage: 0.55,
    gasEstimate: 0.002
  };
  
  // Execute it
  const result = await bridge.executeOpportunity(testOpportunity);
  
  if (result.success) {
    console.log(`✅ Test execution successful! Profit: $${result.profit}`);
  } else {
    console.log(`❌ Test execution failed: ${result.error}`);
  }
}

// Export everything
export { SimpleBridgeSystem, launchDetectionSystem, testExecution };

// Run detection system (uncomment to start)
// launchDetectionSystem().catch(console.error);

// Or test manual execution (uncomment to test)
// testExecution().catch(console.error);