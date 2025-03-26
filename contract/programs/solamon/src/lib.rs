use anchor_lang::prelude::*;

declare_id!("BcH8K2v6nUU72y3CctTH2zR7W2ZFpA94qqWZQerdAEnd");

mod errors;
use errors::SolamonError;
mod constant;
use constant::*;
mod helper;
use helper::*;

#[program]
pub mod solamon {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        fee_account: Pubkey,
        admin: Pubkey,
        fee_percentage_in_basis_points: u16,
    ) -> Result<()> {
        let config_account = &mut ctx.accounts.config_account;
        config_account.bump = ctx.bumps.config_account;
        config_account.fee_account = fee_account.key();
        config_account.admin = admin;
        config_account.fee_percentage_in_basis_points = fee_percentage_in_basis_points;
        Ok(())
    }

    // TODO: add create solamon logic

    pub fn spawn_solamons(ctx: Context<SpawnSolamons>, count: u8) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let config_account = &mut ctx.accounts.config_account;
        user_account.bump = ctx.bumps.user_account;
        let current_count = user_account.solamons.len();

        require!(
            current_count + count as usize <= MAX_SOLAMONS,
            SolamonError::MaxElementsReached
        );

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.player.key(),
            &ctx.accounts.fee_account.key(),
            FEE * count as u64,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.player.to_account_info(),
                ctx.accounts.fee_account.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
        for i in 0..count {
            let solamon = Solamon {
                id: config_account.solamon_count,
                species: pseudorandom_u8(i as u64) % 5,
                element: match pseudorandom_u64(i as u64) as usize % 5 {
                    0 => Element::FIRE,
                    1 => Element::WOOD,
                    2 => Element::EARTH,
                    3 => Element::WATER,
                    _ => Element::METAL,
                },
                //@TODO divide from 15
                attack: pseudorandom_u8(i as u64) % (MAX_ATTACK / 2) + (MAX_ATTACK / 2), // give at least 50
                health: pseudorandom_u8(i as u64 + 1) % (MAX_HEALTH / 2) + (MAX_HEALTH / 2), // give at least 50
                is_available: true,
            };
            // 'Program log: Solamon { id: 0, species: 0, element: Fire, attack: 55, health: 89 }',
            msg!("Spawned {:?}", solamon);
            user_account.solamons.push(solamon);
            config_account.solamon_count += 1;
        }
        Ok(())
    }

    // TODO: Add fight money logic
    pub fn open_battle(ctx: Context<OpenBattle>, solamon_ids: Vec<u16>) -> Result<()> {
        require!(
            solamon_ids.len() == BATTLE_PARTICIPANTS,
            SolamonError::InvalidBattleParticipants
        );
        let config_account = &mut ctx.accounts.config_account;
        let user_account = &mut ctx.accounts.user_account;
        let battle_account = &mut ctx.accounts.battle_account;
        let battle_id = config_account.battle_count;

        battle_account.bump = ctx.bumps.battle_account;
        battle_account.battle_id = battle_id;
        battle_account.player_1 = ctx.accounts.player.key();
        battle_account.player_1_solamons = solamon_ids
            .iter()
            .map(|id| {
                let solamon_index = user_account
                    .solamons
                    .iter()
                    .position(|solamon| solamon.id == *id)
                    .ok_or(SolamonError::InvalidSolamonIds)
                    .unwrap();
                if user_account.solamons[solamon_index].is_available {
                    user_account.solamons[solamon_index].is_available = false;
                    user_account.solamons[solamon_index].clone()
                } else {
                    // @TODO: use SolamonError::SolamonNotAvailable
                    panic!("Solamon not available");
                }
            })
            .collect();
        battle_account.battle_status = BattleStatus::Pending;
        config_account.available_battle_ids.push(battle_id);

        user_account.battle_count += 1;
        config_account.battle_count += 1;
        Ok(())
    }

    // @TODO: add cancel battle logic
    pub fn cancel_battle(ctx: Context<CancelBattle>) -> Result<()> {
        let battle_account = &mut ctx.accounts.battle_account;
        let user_account = &mut ctx.accounts.user_account;
        let config_account = &mut ctx.accounts.config_account;

        require!(
            battle_account.battle_status == BattleStatus::Pending,
            SolamonError::BattleNotAvailable
        );
        require!(
            battle_account.player_1 == ctx.accounts.player.key(),
            SolamonError::InvalidBattleParticipant
        );

        // make solamons available again
        for solamon in battle_account.player_1_solamons.iter() {
            user_account
                .solamons
                .iter_mut()
                .find(|s| s.id == solamon.id)
                .unwrap()
                .is_available = true;
        }

        // remove battle from available battles
        config_account
            .available_battle_ids
            .remove(battle_account.battle_id as usize);

        battle_account.battle_status = BattleStatus::Canceled;
        Ok(())
    }

    // TODO: Add fight money logic
    pub fn join_battle(ctx: Context<JoinBattle>, solamon_ids: Vec<u16>) -> Result<()> {
        require!(
            solamon_ids.len() == BATTLE_PARTICIPANTS,
            SolamonError::InvalidBattleParticipants
        );
        let battle_account = &mut ctx.accounts.battle_account;
        let user_account = &mut ctx.accounts.user_account;
        let config_account = &mut ctx.accounts.config_account;
        let opponent_user_account = &mut ctx.accounts.opponent_user_account;
        require!(
            battle_account.battle_status == BattleStatus::Pending,
            SolamonError::BattleNotAvailable
        );

        battle_account.player_2 = ctx.accounts.player.key();
        battle_account.player_2_solamons = solamon_ids
            .iter()
            .map(|id| {
                user_account
                    .solamons
                    .iter()
                    .find(|solamon| solamon.id == *id)
                    .ok_or(SolamonError::InvalidSolamonIds)
                    .unwrap()
                    .clone()
            })
            .collect();

        let battle_status = execute_battle(&mut battle_account.clone());
        battle_account.battle_status = battle_status;
        user_account.battle_count += 1;
        config_account
            .available_battle_ids
            .remove(battle_account.battle_id as usize);

        opponent_user_account
            .solamons
            .iter_mut()
            .filter(|solamon| {
                battle_account
                    .player_1_solamons
                    .iter()
                    .any(|p1_solamon| p1_solamon.id == solamon.id)
            })
            .for_each(|solamon| {
                solamon.is_available = true;
            });
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(init, payer = signer, space = ConfigAccount::INIT_SPACE, seeds = [CONFIG_ACCOUNT ], bump)]
    pub config_account: Account<'info, ConfigAccount>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct ConfigAccount {
    pub bump: u8,
    pub fee_account: Pubkey,
    pub battle_count: u64,
    pub solamon_count: u16,
    pub admin: Pubkey,
    pub fee_percentage_in_basis_points: u16,
    pub available_battle_ids: Vec<u64>,
}

impl Space for ConfigAccount {
    const INIT_SPACE: usize = 8 // discriminator
        + 1 // bump
        + 32 // fee_account
        + 8 // battle_count
        + 2 // solamon_count
        + 32 // admin
        + 2 // fee_percentage_in_basis_points
        + 8 * 100; // available_battle_ids (max 100 battles)
}

#[derive(Accounts)]
pub struct SpawnSolamons<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(
        init_if_needed,
        payer = player,
        space = UserAccount::INIT_SPACE,
        seeds = [USER_ACCOUNT, player.key().as_ref()],
        bump,
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut, seeds = [CONFIG_ACCOUNT], bump = config_account.bump)]
    pub config_account: Account<'info, ConfigAccount>,

    #[account(
        mut,
        address = config_account.fee_account,
    )]
    /// CHECK: This is the fee account
    pub fee_account: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserAccount {
    pub bump: u8,
    pub solamons: Vec<Solamon>,
    pub battle_count: u64,
}

impl Space for UserAccount {
    const INIT_SPACE: usize = 8 // discriminator
        + 1 // bump
        + MAX_SOLAMONS * Solamon::INIT_SPACE // solamons
        + 8; // battle_count
}

#[account]
#[derive(Debug)]
pub struct Solamon {
    pub id: u16,            //2 bytes
    pub species: u8,        //1 byte
    pub element: Element,   //1 byte
    pub attack: u8,         //1 byte
    pub health: u8,         //1 byte
    pub is_available: bool, //1 byte
}

impl Space for Solamon {
    const INIT_SPACE: usize = 2 + 1 + 1 + 1 + 1 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub enum Element {
    FIRE,
    WOOD,
    EARTH,
    WATER,
    METAL,
}

#[derive(Accounts)]
pub struct OpenBattle<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(mut, seeds = [CONFIG_ACCOUNT], bump = config_account.bump)]
    pub config_account: Account<'info, ConfigAccount>,

    #[account(mut, seeds = [USER_ACCOUNT, player.key().as_ref()], bump = user_account.bump)]
    pub user_account: Account<'info, UserAccount>,

    #[account(
        init_if_needed,
        payer = player,
        space = BattleAccount::INIT_SPACE,
        seeds = [BATTLE_ACCOUNT, &config_account.battle_count.to_le_bytes()],
        bump,
    )]
    pub battle_account: Account<'info, BattleAccount>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct BattleAccount {
    pub bump: u8,
    pub battle_id: u64,
    pub player_1: Pubkey,
    pub player_2: Pubkey,
    pub player_1_solamons: Vec<Solamon>,
    pub player_2_solamons: Vec<Solamon>,
    pub battle_status: BattleStatus,
    pub fight_money: u64,
    pub claim_timestamp: u64,
}

impl Space for BattleAccount {
    const INIT_SPACE: usize = 8 // discriminator
        + 1 // bump
        + 8 // battle_id
        + 32 // player_1
        + 32 // player_2
        + 3 * Solamon::INIT_SPACE // player_1_solamons
        + 3 * Solamon::INIT_SPACE // player_2_solamons
        + 1 // battle_result
        + 8  // fight_money
        + 8 // claim_timestamp
        +8; // why
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum BattleStatus {
    Pending,
    Canceled,
    Player1Wins,
    Player2Wins,
}

#[derive(Accounts)]
pub struct JoinBattle<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(mut, seeds = [CONFIG_ACCOUNT], bump = config_account.bump)]
    pub config_account: Account<'info, ConfigAccount>,

    #[account(mut, seeds = [BATTLE_ACCOUNT, &battle_account.battle_id.to_le_bytes()], bump = battle_account.bump)]
    pub battle_account: Account<'info, BattleAccount>,

    #[account(mut, seeds = [USER_ACCOUNT, player.key().as_ref()], bump = user_account.bump)]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut, seeds = [USER_ACCOUNT, battle_account.player_1.as_ref()], bump = opponent_user_account.bump)]
    pub opponent_user_account: Account<'info, UserAccount>,
}

#[derive(Accounts)]
pub struct CancelBattle<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(mut, seeds = [CONFIG_ACCOUNT], bump = config_account.bump)]
    pub config_account: Account<'info, ConfigAccount>,

    #[account(mut, seeds = [BATTLE_ACCOUNT, &battle_account.battle_id.to_le_bytes()], bump = battle_account.bump)]
    pub battle_account: Account<'info, BattleAccount>,

    #[account(mut, seeds = [USER_ACCOUNT, player.key().as_ref()], bump = user_account.bump)]
    pub user_account: Account<'info, UserAccount>,
}
