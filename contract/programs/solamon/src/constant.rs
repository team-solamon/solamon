pub const CONFIG_ACCOUNT: &[u8] = b"config_account";
pub const USER_ACCOUNT: &[u8] = b"user_account";
pub const BATTLE_ACCOUNT: &[u8] = b"battle_account";
pub const SOLAMON_PROTOTYPE_ACCOUNT: &[u8] = b"solamon_prototype_account";

pub const MAX_SOLAMONS_PER_USER_ACCOUNT: usize = 50;
pub const MAX_SOLAMON_PROTOTYPES: usize = 30;
pub const MAX_HEALTH: u8 = 100;
pub const MAX_ATTACK: u8 = 100;
pub const LAMPORTS_PER_SOL: u64 = 1_000_000_000; // 1 SOL = 1 billion lamports
pub const FEE: u64 = (0.1 * LAMPORTS_PER_SOL as f64) as u64; // Convert to f64, then back to u64
pub const BATTLE_PARTICIPANTS: usize = 3;
