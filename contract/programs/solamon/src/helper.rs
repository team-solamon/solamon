use crate::BattleAccount;
use crate::BattleResult;
use crate::Element;
use crate::Solamon;
use anchor_lang::prelude::*;

pub fn pseudorandom_u64(seed: u64) -> u64 {
    let clock = Clock::get().unwrap();
    xorshift64(seed + clock.slot + clock.unix_timestamp as u64)
}

pub fn pseudorandom_u8(seed: u64) -> u8 {
    (pseudorandom_u64(seed) % 255) as u8
}

pub fn xorshift64(seed: u64) -> u64 {
    let mut x = seed;
    x ^= x << 13;
    x ^= x >> 7;
    x ^= x << 17;
    x
}

pub fn execute_battle(battle_account: &mut BattleAccount) -> BattleResult {
    let mut player1_index = 0;
    let mut player2_index = 0;
    let player1_len = battle_account.player_1_solamons.len();
    let player2_len = battle_account.player_2_solamons.len();

    let mut player1_solamon = &mut battle_account.player_1_solamons[0];
    msg!(
        "Player 1's Solamon (index: {}, id: {}) comes to the battle! (Attack: {}, Health: {})",
        player1_index,
        player1_solamon.id,
        player1_solamon.attack,
        player1_solamon.health
    );
    let mut player2_solamon = &mut battle_account.player_2_solamons[0];
    msg!(
        "Player 2's Solamon (index: {}, id: {}) comes to the battle! (Attack: {}, Health: {})",
        player2_index,
        player2_solamon.id,
        player2_solamon.attack,
        player2_solamon.health
    );

    while player1_index < player1_len && player2_index < player2_len {
        // Player 1's Solamon attacks Player 2's Solamon
        msg!(
            "Player 1's Solamon (index: {}, id: {}) attacks Player 2's Solamon (index: {}, id: {})",
            player1_index,
            player1_solamon.id,
            player2_index,
            player2_solamon.id,
        );

        let damage = calculate_damage(player1_solamon.clone(), player2_solamon.clone());
        msg!("Damage: {}", damage);

        if player2_solamon.health <= damage {
            player2_solamon.health = 0;
            msg!(
                "Player 2's Solamon (index: {}, id: {}) is defeated!",
                player2_index,
                player2_solamon.id
            );

            player2_index += 1; // Move to the next Solamon

            // Check if Player 2 has any Solamons left
            if player2_index >= player2_len {
                msg!("Player 1 wins the battle!");
                return BattleResult::Player1Wins;
            } else {
                // Bring the next Solamon to the battle
                player2_solamon = &mut battle_account.player_2_solamons[player2_index];
                msg!(
                    "Player 2's Solamon (index: {}, id: {}) comes to the battle! (Attack: {}, Health: {})",
                    player2_index,
                    player2_solamon.id,
                    player2_solamon.attack,
                    player2_solamon.health
                );
            }
        } else {
            player2_solamon.health -= damage;
            msg!(
                "Player 2's Solamon (index: {}, id: {}) health after attack: {}",
                player2_index,
                player2_solamon.id,
                player2_solamon.health
            );
        }

        // Player 2's Solamon attacks Player 1's Solamon
        msg!(
            "Player 2's Solamon (index: {}, id: {}) attacks Player 1's Solamon (index: {}, id: {})",
            player2_index,
            player2_solamon.id,
            player1_index,
            player1_solamon.id
        );

        let damage = calculate_damage(player2_solamon.clone(), player1_solamon.clone());
        msg!("Damage: {}", damage);

        if player1_solamon.health <= damage {
            player1_solamon.health = 0;
            msg!(
                "Player 1's Solamon (index: {}, id: {}) is defeated!",
                player1_index,
                player1_solamon.id
            );

            player1_index += 1; // Move to the next Solamon

            // Check if Player 1 has any Solamons left
            if player1_index >= player1_len {
                msg!("Player 2 wins the battle!");
                return BattleResult::Player2Wins;
            } else {
                // Bring the next Solamon to the battle
                player1_solamon = &mut battle_account.player_1_solamons[player1_index];
                msg!(
                    "Player 1's Solamon (index: {}, id: {}) comes to the battle! (Attack: {}, Health: {})",
                    player1_index,
                    player1_solamon.id,
                    player1_solamon.attack,
                    player1_solamon.health
                );
            }
        } else {
            player1_solamon.health -= damage;
            msg!(
                "Player 1's Solamon (index: {}, id: {}) health after attack: {}",
                player1_index,
                player1_solamon.id,
                player1_solamon.health
            );
        }
    }

    // If the loop exits without returning, it means all Solamons are defeated
    msg!("Battle ended in a draw, which should not happen!");
    BattleResult::Pending // This should not happen in a normal battle
}

pub fn calculate_damage(attacker: Solamon, defender: Solamon) -> u8 {
    let mut damage = attacker.attack;

    if attacker.element == Element::Wood && defender.element == Element::Earth {
        damage = damage * 2;
        msg!("Wood beats Earth, damage is doubled!");
    }

    if attacker.element == Element::Fire && defender.element == Element::Metal {
        damage = damage * 2;
        msg!("Fire beats Metal, damage is doubled!");
    }

    if attacker.element == Element::Metal && defender.element == Element::Wood {
        damage = damage * 2;
        msg!("Metal beats Wood, damage is doubled!");
    }
    if attacker.element == Element::Water && defender.element == Element::Fire {
        damage = damage * 2;
        msg!("Water beats Fire, damage is doubled!");
    }
    if attacker.element == Element::Earth && defender.element == Element::Water {
        damage = damage * 2;
        msg!("Earth beats Water, damage is doubled!");
    }

    if attacker.element == Element::Wood && defender.element == Element::Fire {
        damage = damage / 2;
        msg!("Wood is weak against Fire, damage is halved!");
    }

    if attacker.element == Element::Fire && defender.element == Element::Earth {
        damage = damage / 2;
        msg!("Fire is weak against Earth, damage is halved!");
    }

    if attacker.element == Element::Earth && defender.element == Element::Metal {
        damage = damage / 2;
        msg!("Earth is weak against Metal, damage is halved!");
    }

    if attacker.element == Element::Metal && defender.element == Element::Water {
        damage = damage / 2;
        msg!("Metal is weak against Water, damage is halved!");
    }

    if attacker.element == Element::Water && defender.element == Element::Wood {
        damage = damage / 2;
        msg!("Water is weak against Wood, damage is halved!");
    }

    damage
}
