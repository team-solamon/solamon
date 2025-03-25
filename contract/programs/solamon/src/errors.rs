use anchor_lang::prelude::*;

#[error_code]
pub enum SolamonError {
    #[msg("Max elements reached")]
    MaxElementsReached,
    #[msg("Invalid solamon ids")]
    InvalidSolamonIds,
    #[msg("Invalid battle participants")]
    InvalidBattleParticipants,
    #[msg("Battle not available")]
    BattleNotAvailable,
}
