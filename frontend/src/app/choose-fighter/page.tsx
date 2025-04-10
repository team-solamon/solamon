'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { getProgram } from '@/lib/helper'
import { CardData, getPendingBattleAccounts } from '@/lib/solana-helper'
import { BattleAccount } from '@/lib/solana-helper'

import Button from '@/components/Button'
import Card from '@/components/Card'
import Nav from '@/components/Nav'
import SharedModal from '@/components/SharedModal'
import Balance from '@/components/Balance'

import { FIGHT_SOL_PRICE } from '@/constant/env'

const ChooseFighterPage = () => {
  const router = useRouter()
  const [pendingBattleAccounts, setPendingBattleAccounts] = useState<
    BattleAccount[]
  >([])
  const { connection } = useConnection()
  const program = getProgram(connection)
  useEffect(() => {
    fetchPendingBattleAccounts()
  }, [])
  const fetchPendingBattleAccounts = async () => {
    const battleAccounts = await getPendingBattleAccounts(program)
    setPendingBattleAccounts(battleAccounts)
  }
  const { publicKey } = useWallet()

  const isMyBattle = (battleAccount: BattleAccount) => {
    return battleAccount.player1.equals(publicKey)
  }

  return (
    <div className='choose-fighter-page bg-black text-white min-h-screen p-4'>
      <Nav />
      <button
        className='text-yellow-400 text-2xl mb-4'
        onClick={() => router.back()}
      >
        &lt;
      </button>
      <h1 className='text-2xl font-semibold text-yellow-400 mb-2 text-center'>
        Choose Your Fighter
      </h1>
      <p className='text-center text-yellow-400 mb-6'>
        Pick a squad to fight. You'll choose your own next.
      </p>
      <div className='fighters-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {pendingBattleAccounts.map(({ account: battleAccount }, index) => (
          <div
            key={index}
            className='fighter-card bg-[#978578] p-4 rounded-lg flex flex-col items-center'
          >
            <div className='cards flex gap-2 mb-4'>
              {battleAccount.player1Solamons.map(
                (card: CardData, cardIndex: number) => (
                  <div key={cardIndex}>
                    <Card key={index} species={card.species} />
                  </div>
                )
              )}
            </div>
            {isMyBattle(battleAccount) ? (
              <Button disabled>my squad</Button>
            ) : (
              <Button
                onClick={() => {
                  router.push(
                    `/prepare-battle?battleId=${battleAccount.battleId}`
                  )
                }}
              >
                <div className='flex items-center gap-1'>Choose Fighter</div>
              </Button>
            )}
          </div>
        ))}
      </div>
      <SharedModal />
    </div>
  )
}

export default ChooseFighterPage
