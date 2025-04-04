use anchor_lang::prelude::*;

declare_id!("So1a3o9526u65W9nv8pZ3BeuiJa78FaFgfpWsTaZzGD");

mod errors;
use errors::SolamonError;
mod constant;
use constant::*;
mod helper;
use helper::*;
mod state;
use state::*;

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
        user_account.user = ctx.accounts.player.key();
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

        if battle_account.battle_status == BattleStatus::Player2Wins {
            user_account.points += WINNER_POINTS;
            opponent_user_account.points =
                opponent_user_account.points.saturating_sub(LOSER_POINTS);
        } else {
            user_account.points = user_account.points.saturating_sub(LOSER_POINTS);
            opponent_user_account.points += WINNER_POINTS;
        }

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
