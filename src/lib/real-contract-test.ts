// 🚀 REAL CONTRACT TEST - Actually Execute Something!
// src/lib/real-contract-test.ts

import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { AnchorProvider, Program, Wallet, BN } from '@coral-xyz/anchor';

// === 1. SETUP CONSTANTS ===

const PROGRAM_ID = new PublicKey("357EfrYtzfofyDAAmHkPYxyjPG3ohzAo5cVay4cUBMgs");

// ⬇️ Use real IDL file later — for now, simplified inline version
const IDL = {
  version: "0.1.0",
  name: "graph_arbitrage",
  instructions: [
    {
      name: "initialize",
      accounts: [
        { name: "user", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: []
    },
    {
      name: "testArbitrage",
      accounts: [
        { name: "user", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [{ name: "amount", type: "u64" }]
    }
  ]
};

// === 2. MAIN EXECUTION FUNCTION ===

async function testRealContract() {
  console.log(`\n🚀 LAUNCHING REAL CONTRACT TEST\n`);

  // 1. Connect to devnet
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  console.log(`🔗 Connected to Devnet`);

  // 2. Load wallet — ⚠️ REPLACE this with your actual devnet key
  const wallet = Keypair.generate(); // use fs.readFileSync if loading from file
  console.log(`🔑 Wallet: ${wallet.publicKey.toBase58()}`);

  const balance = await connection.getBalance(wallet.publicKey);
  if (balance === 0) {
    console.log(`❌ Wallet has 0 SOL. Run:\nsolana airdrop 2 ${wallet.publicKey.toBase58()} --url devnet`);
    return;
  }

  // 3. Create provider
  const provider = new AnchorProvider(connection, new Wallet(wallet), {
    preflightCommitment: "confirmed"
  });
  anchor.setProvider(provider);

  // 4. Load program
  const program = new Program(IDL as any, provider);
  console.log(`📦 Program loaded`);

  // === TEST 1: initialize ===
  console.log(`\n🧪 TEST 1: initialize()`);
  try {
    const tx = await program.methods
      .initialize()
      .accounts({
        user: wallet.publicKey,
        systemProgram: SystemProgram.programId
      })
      .rpc();

    console.log(`✅ Initialize success. Tx: ${tx}`);
  } catch (err) {
    console.log(`⚠️ initialize() failed or already initialized.`);
    console.log(`🪵 ${err.message}`);
  }

  // === TEST 2: testArbitrage(amount) ===
  console.log(`\n🧪 TEST 2: testArbitrage(1000)`);
  try {
    const amount = new BN(1000);
    const tx = await program.methods
      .testArbitrage(amount)
      .accounts({
        user: wallet.publicKey,
        systemProgram: SystemProgram.programId
      })
      .rpc();

    console.log(`✅ Arbitrage test successful! Tx: ${tx}`);
    console.log(`🔍 Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);

    // Optional: log parsing
    await new Promise(res => setTimeout(res, 2000));
    const details = await connection.getTransaction(tx, { commitment: "confirmed" });
    if (details?.meta?.logMessages) {
      console.log(`\n📝 Logs:`);
      details.meta.logMessages.forEach((log, i) => {
        if (log.includes("🚀") || log.includes("Testing")) console.log(` ${i}: ${log}`);
      });
    }
  } catch (err) {
    console.log(`❌ testArbitrage() failed: ${err.message}`);
    if (err.logs) {
      console.log("📋 Logs:", err.logs);
    }
  }

  console.log(`\n🎉 TEST COMPLETE.`);
}

// === 3. RUN ===

testRealContract().catch(console.error);