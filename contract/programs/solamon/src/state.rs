use crate::constant::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

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
