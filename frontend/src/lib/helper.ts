import { Program } from '@coral-xyz/anchor'
import {
  Connection,
  AddressLookupTableAccount,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js'

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

export const deserializeInstruction = (instruction: any) => {
  return new TransactionInstruction({
    programId: new PublicKey(instruction.programId),
    keys: instruction.accounts.map((key: any) => ({
      pubkey: new PublicKey(key.pubkey),
      isSigner: key.isSigner,
      isWritable: key.isWritable,
    })),
    data: Buffer.from(instruction.data, 'base64'),
  })
}

export const getAddressLookupTableAccounts = async (
  connection: Connection,
  keys: string[]
): Promise<AddressLookupTableAccount[]> => {
  const addressLookupTableAccountInfos =
    await connection.getMultipleAccountsInfo(
      keys.map((key) => new PublicKey(key))
    )

  return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
    const addressLookupTableAddress = keys[index]
    if (accountInfo) {
      const addressLookupTableAccount = new AddressLookupTableAccount({
        key: new PublicKey(addressLookupTableAddress),
        state: AddressLookupTableAccount.deserialize(accountInfo.data),
      })
      acc.push(addressLookupTableAccount)
    }

    return acc
  }, new Array<AddressLookupTableAccount>())
}

export const getExplorerUrl = (publicKey: string) => {
  return `https://solscan.io/account/${publicKey}`
}
