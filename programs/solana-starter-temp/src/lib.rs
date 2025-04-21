use anchor_lang::prelude::*;

declare_id!("6ycgerWbKhew5p4Pp1vCNeiSRxVdDVSdmRJ1SG12LkCZ");

#[program]
pub mod solana_starter_temp {
    use super::*;

    pub fn create_note_entry(ctx: Context<CreateEntry>,title:String,message:String) -> Result<()> {
        let note_entry = &mut ctx.accounts.note_entry;
        note_entry.owner = *ctx.accounts.owner.key;
        note_entry.title = title;
        note_entry.message = message;
        msg!("Note Entry Created");
        Ok(())
    }
    pub fn update_note_entry(ctx: Context<UpdateNote>,title:String,message:String) -> Result<()> {
        let note_entry = &mut ctx.accounts.note_entry;
        note_entry.message = message;
        msg!("Note Entry Updated");
        Ok(())
    }
    pub fn delete_note_entry(ctx: Context<DeleteNote>,title:String) -> Result<()> {
        msg!("Note Entry Deleted");
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title:String,message:String)]

pub struct DeleteNote<'info> {
    #[account(
        mut,
        seeds= [title.as_bytes(),owner.key.as_ref()],
        bump,
        close=owner        
    )]
    pub note_entry: Account<'info, NoteEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,

}
#[derive(Accounts)]
#[instruction(title:String,message:String)]

pub struct UpdateNote<'info> {
    #[account(
        mut,
        seeds= [title.as_bytes(),owner.key.as_ref()],
        bump,
        realloc = 8+ NoteEntryState::INIT_SPACE,
        realloc::payer = owner,
        realloc::zero=true
    )]
    pub note_entry: Account<'info, NoteEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
#[instruction(title:String,message:String)]
pub struct CreateEntry<'info> {
    #[account(
    init,
    seeds= [title.as_bytes(),owner.key.as_ref()],
    bump,
    space = 8+ NoteEntryState::INIT_SPACE,
    payer=owner
)]
    pub note_entry: Account<'info, NoteEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}
#[account]
#[derive(InitSpace)]
pub struct NoteEntryState {
    pub owner: Pubkey,
    #[max_len(60)]
    pub title: String,
    #[max_len(60)]
    pub message: String,
}
