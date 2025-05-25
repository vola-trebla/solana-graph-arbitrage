// 🌉 EXECUTION BRIDGE CLIENT - Connect Off-Chain Brain to On-Chain Execution
// src/lib/execution-bridge.ts

import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, BN } from '@project-serum/anchor';
import { ArbitrageOpportunity } from '../types/arbitrage-types';

interface SwapStep {
  inputMint: PublicKey;
  outputMint: PublicKey;
  dex: 'Jupiter' | 'Raydium' | 'Orca';
  programId: PublicKey;
  expectedRate: number;
  routeData: Buffer;
}

interface ExecutionResult {
  success: boolean;
  signature?: string;
  profit?: number;
  error?: string;
}

class ArbitrageExecutionBridge {
  private connection: Connection;
  private program: Program;
  private wallet: Keypair;

  constructor(connection: Connection, program: Program, wallet: Keypair) {
    this.connection = connection;
    this.program = program;
    this.wallet = wallet;
  }

  // 🚀 MAIN EXECUTION FUNCTION
  async executeArbitrageOpportunity(
    opportunity: ArbitrageOpportunity,
    startingAmount: number,
    options: {
      minProfitBps?: number;     // Minimum profit in basis points (default: 10 = 0.1%)
      maxSlippageBps?: number;   // Maximum slippage (default: 100 = 1%)
      maxRetries?: number;       // Retry attempts (default: 3)
    } = {}
  ): Promise<ExecutionResult> {
    
    const { minProfitBps = 10, maxSlippageBps = 100, maxRetries = 3 } = options;
    
    console.log(`🚀 Executing arbitrage opportunity:`);
    console.log(`   Path: ${opportunity.path.join(' -> ')}`);
    console.log(`   Expected profit: ${opportunity.profitPercentage.toFixed(3)}%`);
    console.log(`   Starting amount: $${startingAmount}`);

    try {
      // 1. CONVERT OPPORTUNITY TO SWAP STEPS
      const swapSteps = await this.convertToSwapSteps(opportunity);
      
      // 2. VALIDATE EXECUTION SAFETY
      const validation = await this.validateExecution(swapSteps, startingAmount);
      if (!validation.safe) {
        return { success: false, error: validation.reason };
      }

      // 3. EXECUTE WITH RETRIES
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`   Attempt ${attempt}/${maxRetries}...`);
        
        try {
          const result = await this.executeAtomicSwaps(
            swapSteps,
            startingAmount,
            minProfitBps,
            maxSlippageBps
          );
          
          if (result.success) {
            console.log(`✅ Arbitrage executed successfully!`);
            console.log(`   Signature: ${result.signature}`);
            console.log(`   Profit: $${result.profit}`);
            return result;
          }
        } catch (error) {
          console.log(`   Attempt ${attempt} failed: ${error.message}`);
          if (attempt === maxRetries) {
            return { success: false, error: error.message };
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }

      return { success: false, error: 'All retry attempts failed' };

    } catch (error) {
      console.log(`❌ Execution failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // 🔄 CONVERT OPPORTUNITY TO EXECUTABLE SWAP STEPS
  private async convertToSwapSteps(opportunity: ArbitrageOpportunity): Promise<SwapStep[]> {
    const steps: SwapStep[] = [];
    
    for (let i = 0; i < opportunity.path.length - 1; i++) {
      const fromSymbol = opportunity.path[i];
      const toSymbol = opportunity.path[i + 1];
      const exchange = opportunity.exchanges[i];
      
      // Convert symbols to mint addresses
      const inputMint = this.getMintAddress(fromSymbol);
      const outputMint = this.getMintAddress(toSymbol);
      
      // Get DEX-specific routing data
      const routeData = await this.getRouteData(exchange, inputMint, outputMint);
      
      steps.push({
        inputMint,
        outputMint,
        dex: exchange as 'Jupiter' | 'Raydium' | 'Orca',
        programId: this.getDexProgramId(exchange),
        expectedRate: this.calculateExpectedRate(fromSymbol, toSymbol),
        routeData,
      });
    }
    
    return steps;
  }

  // ✅ VALIDATE EXECUTION SAFETY
  private async validateExecution(
    steps: SwapStep[],
    amount: number
  ): Promise<{safe: boolean, reason?: string}> {
    
    // Check wallet balance
    const balance = await this.connection.getBalance(this.wallet.publicKey);
    if (balance < amount * 1.1) { // Need 10% buffer for fees
      return { safe: false, reason: 'Insufficient wallet balance' };
    }
    
    // Check all DEX programs are available
    for (const step of steps) {
      const programAccount = await this.connection.getAccountInfo(step.programId);
      if (!programAccount) {
        return { safe: false, reason: `DEX program ${step.dex} not found` };
      }
    }
    
    // Check token accounts exist
    for (const step of steps) {
      // Validate mint addresses
      const inputMintInfo = await this.connection.getAccountInfo(step.inputMint);
      const outputMintInfo = await this.connection.getAccountInfo(step.outputMint);
      
      if (!inputMintInfo || !outputMintInfo) {
        return { safe: false, reason: 'Invalid token mint address' };
      }
    }
    
    return { safe: true };
  }

  // ⚡ EXECUTE ATOMIC SWAPS ON-CHAIN
  private async executeAtomicSwaps(
    steps: SwapStep[],
    amount: number,
    minProfitBps: number,
    maxSlippageBps: number
  ): Promise<ExecutionResult> {
    
    console.log(`   🔗 Creating atomic transaction...`);
    
    // Convert steps to the format expected by smart contract
    const contractSteps = steps.map(step => ({
      inputMint: step.inputMint,
      outputMint: step.outputMint,
      dex: { [step.dex.toLowerCase()]: {} }, // Enum format for Anchor
      programId: step.programId,
      expectedRate: new BN(step.expectedRate * 1000), // Convert to integer with precision
      routeData: Array.from(step.routeData), // Convert Buffer to Array
    }));

    // Get token accounts
    const userTokenAccount = await this.getUserTokenAccount(steps[0].inputMint);
    const tokenMint = steps[0].inputMint;

    // Create and send transaction
    const signature = await this.program.methods
      .executeArbitrageRoute(
        contractSteps,
        minProfitBps,
        maxSlippageBps
      )
      .accounts({
        user: this.wallet.publicKey,
        userTokenAccount,
        tokenMint,
      })
      .signers([this.wallet])
      .rpc();

    console.log(`   📝 Transaction signature: ${signature}`);

    // Wait for confirmation
    await this.connection.confirmTransaction(signature, 'confirmed');

    // Calculate actual profit
    const profit = await this.calculateActualProfit(signature, amount);

    return {
      success: true,
      signature,
      profit,
    };
  }

  // 🔧 HELPER FUNCTIONS
  private getMintAddress(symbol: string): PublicKey {
    const mintMap: {[key: string]: string} = {
      'SOL': 'So11111111111111111111111111111111111111112',
      'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      'WIF': 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
      'JUP': '27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4',
      'RAY': '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    };
    
    return new PublicKey(mintMap[symbol]);
  }

  private getDexProgramId(exchange: string): PublicKey {
    const programMap: {[key: string]: string} = {
      'Jupiter': '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
      'Raydium': '675kPX9MbS4QRb9t7xBrqJw5W6LqV4dg8r5R8Bp4Z5KE',
      'Orca': '9W959DqEETiGZocYWisQaGH2BKGt6TBV5n7UVtU7cNe',
    };
    
    return new PublicKey(programMap[exchange]);
  }

  private async getRouteData(exchange: string, inputMint: PublicKey, outputMint: PublicKey): Promise<Buffer> {
    // Get DEX-specific routing data
    // This would integrate with Jupiter/Raydium/Orca APIs to get optimal routes
    // For now, return empty buffer
    return Buffer.alloc(0);
  }

  private calculateExpectedRate(fromSymbol: string, toSymbol: string): number {
    // This would use your existing rate calculation logic
    // For now, return placeholder
    return 1.0;
  }

  private async getUserTokenAccount(mint: PublicKey): Promise<PublicKey> {
    // Get or create associated token account
    // Implementation depends on your token account setup
    return this.wallet.publicKey; // Placeholder
  }

  private async calculateActualProfit(signature: string, startAmount: number): Promise<number> {
    // Parse transaction logs to calculate actual profit
    // This would analyze the transaction result
    return 0; // Placeholder
  }

  // 🚨 EMERGENCY FUNCTIONS
  async emergencyCancel(): Promise<void> {
    console.log('🚨 Triggering emergency cancel...');
    
    await this.program.methods
      .emergencyCancel()
      .accounts({
        user: this.wallet.publicKey,
      })
      .signers([this.wallet])
      .rpc();
      
    console.log('✅ Emergency cancel completed - funds are safe');
  }
}

// 🧪 USAGE EXAMPLE
export async function testExecutionBridge() {
  console.log('🧪 Testing Execution Bridge...');

  // Initialize connection and program
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const wallet = Keypair.generate(); // Use your actual wallet
  const program = {} as Program; // Load your actual program

  const bridge = new ArbitrageExecutionBridge(connection, program, wallet);

  // Example opportunity from your detection system
  const opportunity: ArbitrageOpportunity = {
    path: ['SOL', 'USDC', 'WIF', 'SOL'],
    exchanges: ['Jupiter', 'Raydium', 'Orca'],
    expectedProfit: 5.50,
    requiredCapital: 1000,
    profitPercentage: 0.55,
    gasEstimate: 0.002,
  };

  // Execute the arbitrage
  const result = await bridge.executeArbitrageOpportunity(opportunity, 1000, {
    minProfitBps: 50,  // 0.5% minimum profit
    maxSlippageBps: 100, // 1% max slippage
    maxRetries: 3,
  });

  if (result.success) {
    console.log(`🎉 Arbitrage successful! Profit: $${result.profit}`);
  } else {
    console.log(`❌ Arbitrage failed: ${result.error}`);
  }
}

export { ArbitrageExecutionBridge, SwapStep, ExecutionResult };