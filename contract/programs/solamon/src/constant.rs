use anchor_lang::{prelude::Pubkey, pubkey};

pub const CONFIG_ACCOUNT: &[u8] = b"config_account";
pub const USER_ACCOUNT: &[u8] = b"user_account";
pub const BATTLE_ACCOUNT: &[u8] = b"battle_account";
pub const SOLAMON_PROTOTYPE_ACCOUNT: &[u8] = b"solamon_prototype_account";

pub const MAX_SOLAMONS_PER_USER_ACCOUNT: usize = 50;
pub const MAX_SOLAMON_PROTOTYPES: usize = 30;
pub const BATTLE_PARTICIPANTS: usize = 3;
pub const MAX_BASIS_POINTS: usize = 10_000;
pub const WINNER_POINTS: u16 = 10;
pub const LOSER_POINTS: u16 = 5;
pub const NATIVE_MINT: Pubkey = pubkey!("So11111111111111111111111111111111111111112");
