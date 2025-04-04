import { Program } from '@coral-xyz/anchor'
import { Connection } from '@solana/web3.js'

import solamon from '@/target/idl/solamon.json'
import { Solamon } from '@/target/types/solamon'

import { BattleAccount } from './solana-helper'

export const getProgram = (connection: Connection) => {
  return new Program<Solamon>(solamon as Solamon, {
    connection,
  })
}

export const getWinnerFromBattleAccount = (battleAccount: BattleAccount) => {
  if (!battleAccount) return null
  const isPlayer1Winner =
    JSON.stringify(battleAccount.battleStatus) ===
    JSON.stringify({ player1Wins: {} })
  const isPlayer2Winner =
    JSON.stringify(battleAccount.battleStatus) ===
    JSON.stringify({ player2Wins: {} })

  if (isPlayer1Winner) {
    return battleAccount.player1.toString()
  }

  if (isPlayer2Winner) {
    return battleAccount.player2.toString()
  }

  return null
}

export const trimAddress = (address?: string) => {
  if (!address) return ''
  return address.slice(0, 4) + '...' + address.slice(-4)
}
