use anchor_lang::prelude::*;

declare_id!("6ycgerWbKhew5p4Pp1vCNeiSRxVdDVSdmRJ1SG12LkCZ");

#[program]
pub mod solana_starter_temp {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
