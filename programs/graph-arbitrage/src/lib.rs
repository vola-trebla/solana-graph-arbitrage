use anchor_lang::prelude::*;

declare_id!("357EfrYtzfofyDAAmHkPYxyjPG3ohzAo5cVay4cUBMgs");

#[program]
pub mod graph_arbitrage {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
