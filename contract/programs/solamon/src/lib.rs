use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
declare_id!("So1a3o9526u65W9nv8pZ3BeuiJa78FaFgfpWsTaZzGD");

mod errors;
use errors::SolamonError;
mod constant;
use constant::*;
mod helper;
use helper::*;

//@TODO: user or player, choose one
//@TODO: refactor this file
#[program]
pub mod solamon {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        fee_account: Pubkey,
        admin: Pubkey,
        fee_percentage_in_basis_points: u16,
        spawn_fee: u64,
    ) -> Result<()> {
        let config_account = &mut ctx.accounts.config_account;
        config_account.bump = ctx.bumps.config_account;
        config_account.fee_account = fee_account.key();
        config_account.admin = admin;
        config_account.fee_percentage_in_basis_points = fee_percentage_in_basis_points;
        config_account.spawn_fee = spawn_fee;
        Ok(())
    }

    pub fn create_solamon_prototype(
        ctx: Context<CreateSolamonPrototype>,
        solamon_prototypes: Vec<SolamonPrototype>,
    ) -> Result<()> {
        let solamon_prototype_account = &mut ctx.accounts.solamon_prototype_account;
        solamon_prototype_account.bump = ctx.bumps.solamon_prototype_account;
        solamon_prototype_account.total_species = solamon_prototypes.len() as u8;
        // @TODO: check probability sum and order
        solamon_prototype_account.solamon_prototypes = solamon_prototypes;
        Ok(())
    }

    // @TODO: add & update solamon prototype logic

    pub fn spawn_solamons(ctx: Context<SpawnSolamons>, count: u8) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let config_account = &mut ctx.accounts.config_account;
        user_account.bump = ctx.bumps.user_account;
        let current_count = user_account.solamons.len();
        let solamon_prototype_account = &ctx.accounts.solamon_prototype_account;

        require!(
            current_count + count as usize <= MAX_SOLAMONS_PER_USER_ACCOUNT,
            SolamonError::MaxElementsReached
        );

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.player.key(),
            &ctx.accounts.fee_account.key(),
            config_account.spawn_fee * count as u64,
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
            let species: u8 = pseudorandom_u8(i as u64) % solamon_prototype_account.total_species;
            let solamon_prototype = &solamon_prototype_account.solamon_prototypes[species as usize];

            // choose element based on probability
            let random_value = pseudorandom_u64(i as u64) as usize % MAX_BASIS_POINTS;
            let mut cumulative_probability = 0;
            let mut selected_element = &solamon_prototype.possible_elements[0]; // Default to first element
            for (idx, probability) in solamon_prototype
                .element_probability_in_basis_points
                .iter()
                .enumerate()
            {
                cumulative_probability += *probability as usize;
                if random_value < cumulative_probability {
                    selected_element = &solamon_prototype.possible_elements[idx];
                    break;
                }
            }

            let mut attack = pseudorandom_u8(i as u64) % solamon_prototype.distributable_points;
            if attack == 0 {
                attack = 1;
            }
            let health = solamon_prototype.distributable_points - attack;

            let solamon = Solamon {
                id: config_account.solamon_count,
                species: species,
                element: selected_element.clone(),
                attack: attack,
                health: health,
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
    pub fn open_battle(
        ctx: Context<OpenBattle>,
        solamon_ids: Vec<u16>,
        battle_stake: u64,
    ) -> Result<()> {
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
        battle_account.battle_stake = battle_stake;

        transfer_token(
            &ctx.accounts.player_token_account.to_account_info(),
            &ctx.accounts.battle_stake_account.to_account_info(),
            &ctx.accounts.player.to_account_info(),
            &ctx.accounts.token_program.to_account_info(),
            battle_stake,
        )?;

        config_account.available_battle_ids.push(battle_id);

        user_account.battle_count += 1;
        config_account.battle_count += 1;
        Ok(())
    }

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

        // return battle stake
        transfer_token_with_signer(
            &ctx.accounts.battle_stake_account.to_account_info(),
            &ctx.accounts.player_token_account.to_account_info(),
            &config_account.to_account_info(),
            &ctx.accounts.token_program.to_account_info(),
            battle_account.battle_stake,
            &[&[CONFIG_ACCOUNT.as_ref(), &[config_account.bump]]],
        )?;

        // remove battle from available battles
        if let Some(index) = config_account
            .available_battle_ids
            .iter()
            .position(|&id| id == battle_account.battle_id)
        {
            config_account.available_battle_ids.remove(index);
        }

        battle_account.battle_status = BattleStatus::Canceled;
        Ok(())
    }

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

        transfer_token(
            &ctx.accounts.player_token_account.to_account_info(),
            &ctx.accounts.battle_stake_account.to_account_info(),
            &ctx.accounts.player.to_account_info(),
            &ctx.accounts.token_program.to_account_info(),
            battle_account.battle_stake,
        )?;

        let battle_status = execute_battle(&mut battle_account.clone());
        battle_account.battle_status = battle_status;
        user_account.battle_count += 1;

        if let Some(index) = config_account
            .available_battle_ids
            .iter()
            .position(|&id| id == battle_account.battle_id)
        {
            config_account.available_battle_ids.remove(index);
        }

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

    pub fn claim_battle(ctx: Context<ClaimBattle>) -> Result<()> {
        let battle_account = &mut ctx.accounts.battle_account;
        let config_account = &mut ctx.accounts.config_account;

        let winner = match battle_account.battle_status {
            BattleStatus::Player1Wins => battle_account.player_1,
            BattleStatus::Player2Wins => battle_account.player_2,
            _ => return Err(SolamonError::InvalidBattleStatus.into()),
        };

        require!(
            winner == ctx.accounts.player.key(),
            SolamonError::InvalidBattleWinner
        );

        require!(
            battle_account.claim_timestamp == 0,
            SolamonError::BattleAlreadyClaimed
        );

        let claimable_amount = battle_account.battle_stake * 2;
        let fee = claimable_amount * config_account.fee_percentage_in_basis_points as u64
            / MAX_BASIS_POINTS as u64;

        msg!("Claimable amount: {}", claimable_amount);
        msg!("Fee: {}", fee);
        msg!(
            "Current Balance of Battle Stake Account: {}",
            ctx.accounts.battle_stake_account.amount
        );

        // transfer prize money
        transfer_token_with_signer(
            &ctx.accounts.battle_stake_account.to_account_info(),
            &ctx.accounts.player_token_account.to_account_info(),
            &config_account.to_account_info(),
            &ctx.accounts.token_program.to_account_info(),
            claimable_amount - fee,
            &[&[CONFIG_ACCOUNT.as_ref(), &[config_account.bump]]],
        )?;

        msg!("Transferred prize money: {}", claimable_amount - fee);
        msg!(
            "Current Balance of Battle Stake Account: {}",
            ctx.accounts.battle_stake_account.amount
        );

        // transfer fee to fee account
        transfer_token_with_signer(
            &ctx.accounts.battle_stake_account.to_account_info(),
            &ctx.accounts.fee_token_account.to_account_info(),
            &config_account.to_account_info(),
            &ctx.accounts.token_program.to_account_info(),
            fee,
            &[&[CONFIG_ACCOUNT.as_ref(), &[config_account.bump]]],
        )?;

        battle_account.claim_timestamp = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(init, payer = signer, space = ConfigAccount::INIT_SPACE, seeds = [CONFIG_ACCOUNT], bump)]
    pub config_account: Account<'info, ConfigAccount>,

    #[account(address = NATIVE_MINT)]
    pub mint: Account<'info, Mint>,

    #[account(init,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = config_account,
    )]
    pub battle_stake_account: Account<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct ConfigAccount {
    pub bump: u8,
    pub fee_account: Pubkey,
    pub battle_count: u64,
    pub solamon_count: u16,
    pub admin: Pubkey,
    pub spawn_fee: u64,
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
        + 8 // spawn_fee
        + 2 // fee_percentage_in_basis_points
        + 8 * 100; // available_battle_ids (max 100 battles)
}

#[derive(Accounts)]
pub struct CreateSolamonPrototype<'info> {
    #[account(mut, constraint = admin.key() == config_account.admin)]
    pub admin: Signer<'info>,

    #[account(mut, seeds = [CONFIG_ACCOUNT], bump = config_account.bump)]
    pub config_account: Account<'info, ConfigAccount>,

    #[account(init_if_needed, payer = admin, space = SolamonPrototypeAccount::INIT_SPACE, seeds = [SOLAMON_PROTOTYPE_ACCOUNT], bump)]
    pub solamon_prototype_account: Account<'info, SolamonPrototypeAccount>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct SolamonPrototypeAccount {
    pub bump: u8,
    pub total_species: u8,
    pub solamon_prototypes: Vec<SolamonPrototype>,
}

impl Space for SolamonPrototypeAccount {
    const INIT_SPACE: usize = 8 // discriminator
        + 1 // bump
        + 1 // total_species
        + MAX_SOLAMON_PROTOTYPES * SolamonPrototype::INIT_SPACE; // solamon_prototypes (max 30 species)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub struct SolamonPrototype {
    pub image_url: String,
    pub possible_elements: Vec<Element>,
    pub element_probability_in_basis_points: Vec<u16>,
    pub distributable_points: u8,
}

impl Space for SolamonPrototype {
    const INIT_SPACE: usize = 80 // image_url (max 80 characters)
        + 5 // possible_elements
        + 10 // element_probability_in_basis_points
        + 1; // distributable_points
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

    #[account(mut, seeds = [SOLAMON_PROTOTYPE_ACCOUNT], bump = solamon_prototype_account.bump)]
    pub solamon_prototype_account: Account<'info, SolamonPrototypeAccount>,

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
        + MAX_SOLAMONS_PER_USER_ACCOUNT * Solamon::INIT_SPACE // solamons
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
    Fire,
    Wood,
    Earth,
    Water,
    Metal,
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

    #[account(
        mut,
        token::mint = mint,
        token::authority = player
    )]
    pub player_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = config_account
    )]
    pub battle_stake_account: Account<'info, TokenAccount>,

    #[account(address = NATIVE_MINT)]
    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
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
    pub battle_stake: u64,
    pub claim_timestamp: i64,
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

    #[account(
        mut,
        token::mint = mint,
        token::authority = player
    )]
    pub player_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = config_account
    )]
    pub battle_stake_account: Account<'info, TokenAccount>,

    #[account(address = NATIVE_MINT)]
    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
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

    #[account(
        mut,
        token::mint = mint,
        token::authority = player
    )]
    pub player_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = config_account
    )]
    pub battle_stake_account: Account<'info, TokenAccount>,

    #[account(address = NATIVE_MINT)]
    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimBattle<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(mut, seeds = [CONFIG_ACCOUNT], bump = config_account.bump)]
    pub config_account: Account<'info, ConfigAccount>,
    #[account(mut, seeds = [BATTLE_ACCOUNT, &battle_account.battle_id.to_le_bytes()], bump = battle_account.bump)]
    pub battle_account: Account<'info, BattleAccount>,

    #[account(
        mut,
        token::mint = mint,
        token::authority = config_account.fee_account
    )]
    pub fee_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = mint,
        token::authority = player
    )]
    pub player_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = config_account
    )]
    pub battle_stake_account: Account<'info, TokenAccount>,

    #[account(address = NATIVE_MINT)]
    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
