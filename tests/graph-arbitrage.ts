import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GraphArbitrage } from "../target/types/graph_arbitrage";

describe("graph-arbitrage", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.GraphArbitrage as Program<GraphArbitrage>;

  it("Is initialized!", async () => {
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  // NEW: Test our graph theory function!
  it("Creates token graph!", async () => {
    const tx = await program.methods.createTokenGraph().rpc();
    console.log("🧠 Graph creation signature:", tx);
  });
});