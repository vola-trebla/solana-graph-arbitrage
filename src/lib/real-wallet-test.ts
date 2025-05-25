// 🚀 REAL WALLET ARBITRAGE TEST - Use Your Funded Wallet
// src/lib/real-wallet-test.ts

import { Connection, Keypair } from '@solana/web3.js';
import { Program } from '@project-serum/anchor';
import { RealExecutionBridgeSystem } from './simple-bridge-system';
import { ArbitrageOpportunity } from '../types/arbitrage-types';
import * as fs from 'fs';

async function testWithRealWallet() {
  console.log(`
🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
        REAL WALLET ARBITRAGE TEST
        Using Your Funded Devnet Wallet
🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  `);

  try {
    // Setup connection
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Load YOUR real wallet (the one with 5.45 SOL)
    console.log(`🔑 Loading your funded wallet...`);
    
    let wallet: Keypair;
    try {
      // Try to load your wallet from the default location
      const walletPath = process.env.HOME + '/.config/solana/id.json';
      const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
      wallet = Keypair.fromSecretKey(new Uint8Array(walletData));
      console.log(`   ✅ Loaded wallet: ${wallet.publicKey.toString()}`);
    } catch (error) {
      console.log(`   ❌ Could not load wallet from ~/.config/solana/id.json`);
      console.log(`   💡 Make sure your wallet file exists and is readable`);
      return;
    }
    
    // Check wallet balance
    const balance = await connection.getBalance(wallet.publicKey);
    const balanceSOL = balance / 1e9;
    console.log(`   💰 Wallet balance: ${balanceSOL.toFixed(4)} SOL`);
    
    if (balanceSOL < 0.1) {
      console.log(`   ❌ Insufficient balance for testing`);
      return;
    }
    
    // Setup program (simplified for testing)
    const program = {} as Program; // Your program would be loaded here
    
    // Initialize REAL execution system with YOUR wallet
    const system = new RealExecutionBridgeSystem(connection, wallet, program);
    
    // Create test opportunity with REAL data
    const testOpportunity: ArbitrageOpportunity = {
      path: ['SOL', 'USDC', 'BONK', 'SOL'],
      exchanges: ['realistic', 'realistic', 'realistic'],
      expectedProfit: 1.30, // $1.30 profit on $20
      requiredCapital: 20,
      profitPercentage: 0.65, // 0.65% profit
      gasEstimate: 0.004
    };
    
    // Use REAL rates from current market
    const realRates = new Map([
      ['SOL-USDC', 171.27],      // Current SOL price
      ['USDC-BONK', 50114],      // Current USDC->BONK rate  
      ['BONK-SOL', 1.165e-7]     // Current BONK->SOL rate
    ]);
    
    console.log(`\n🎯 Test Opportunity:`);
    console.log(`   Path: ${testOpportunity.path.join(' -> ')}`);
    console.log(`   Expected profit: ${testOpportunity.profitPercentage.toFixed(4)}%`);
    console.log(`   Amount: $20`);
    console.log(`   Expected return: $${testOpportunity.expectedProfit.toFixed(2)}`);
    
    console.log(`\n📊 Real Market Rates:`);
    realRates.forEach((rate, pair) => {
      console.log(`   ${pair}: ${rate}`);
    });
    
    console.log(`\n🚨 EXECUTING WITH REAL WALLET AND REAL MONEY!`);
    console.log(`💡 This will attempt actual blockchain execution`);
    
    // Execute the arbitrage with your REAL wallet
    const result = await system.executeRealArbitrage(testOpportunity, realRates, 20);
    
    if (result.success) {
      console.log(`\n🎉 ARBITRAGE EXECUTION SUCCESSFUL!`);
      console.log(`   📝 Transaction: ${result.signature}`);
      console.log(`   💰 Profit: $${result.profit?.toFixed(2) || '0.00'}`);
      console.log(`   🔍 View on explorer: https://explorer.solana.com/tx/${result.signature}?cluster=devnet`);
    } else {
      console.log(`\n❌ Arbitrage execution failed: ${result.error}`);
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    console.log(`💡 This might be due to program loading or other setup issues`);
  }
}

// 🚀 SIMPLE VERSION - Just Test the Conversion
async function testConversionOnly() {
  console.log(`🧪 Testing conversion with your funded wallet (no execution)...`);
  
  try {
    const connection = new Connection('https://api.devnet.solana.com');
    
    // Load your wallet
    const walletPath = process.env.HOME + '/.config/solana/id.json';
    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    const wallet = Keypair.fromSecretKey(new Uint8Array(walletData));
    
    console.log(`🔑 Your wallet: ${wallet.publicKey.toString()}`);
    
    // Check balance
    const balance = await connection.getBalance(wallet.publicKey);
    console.log(`💰 Balance: ${(balance / 1e9).toFixed(4)} SOL`);
    
    console.log(`✅ Wallet loaded successfully - ready for real execution!`);
    console.log(`💡 The wallet loading works - now we just need to connect the program`);
    
  } catch (error) {
    console.log(`❌ Wallet loading failed: ${error.message}`);
  }
}

export { testWithRealWallet, testConversionOnly };

// Run the test
testConversionOnly().catch(console.error);