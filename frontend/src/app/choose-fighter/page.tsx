'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Nav from '@/components/Nav'
import { CardData, getPendingBattleAccounts } from '@/lib/solana-helper'
import { BattleAccount } from '@/lib/solana-helper'
import { getKeypairFromLocalStorage, getProgram } from '@/lib/helper'
import SolanaBalance from '@/components/SolanaBalance'
import { FIGHT_SOL_PRICE } from '@/constant/env'
import SharedModal from '@/components/SharedModal'

const ChooseFighterPage = () => {
  const router = useRouter()
  const [pendingBattleAccounts, setPendingBattleAccounts] = useState<
    BattleAccount[]
  >([])
  const program = getProgram()
  useEffect(() => {
    fetchPendingBattleAccounts()
  }, [])
  const fetchPendingBattleAccounts = async () => {
    const battleAccounts = await getPendingBattleAccounts(program)
    setPendingBattleAccounts(battleAccounts)
  }
  const player = getKeypairFromLocalStorage()
  const isMyBattle = (battleAccount: BattleAccount) => {
    return battleAccount.player1.equals(player?.publicKey)
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
                    <Card
                      key={index}
                      species={card.species}
                      element={card.element}
                    />
                    {/** use <CardElementProbabilities/> */}
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
                <div className='flex items-center gap-1'>
                  Choose Fighter
                  <SolanaBalance balance={FIGHT_SOL_PRICE} />
                </div>
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
