'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Nav from '@/components/Nav'
import PickedCards from '@/components/PickedCards'
import CardList from '@/components/CardList'
import Card from '@/components/Card'
import {
  BattleAccount,
  CardData,
  getBattleAccount,
  getUserAccount,
  wrapSolAndJoinBattleTx,
} from '@/lib/solana-helper'
import {
  getConnection,
  getKeypairFromLocalStorage,
  getProgram,
} from '@/lib/helper'
import { Keypair, sendAndConfirmTransaction } from '@solana/web3.js'
import { useLoading } from '@/contexts/LoadingContext'

const PrepareBattlePage = () => {
  const searchParams = useSearchParams()
  const battleId = searchParams.get('battleId')
  const router = useRouter()
  const program = getProgram()
  const connection = getConnection()
  const player = getKeypairFromLocalStorage()
  const [myCards, setMyCards] = useState<CardData[]>([])
  const [pickedCards, setPickedCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(false)
  const [battleAccount, setBattleAccount] = useState<BattleAccount | null>(null)
  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    console.log({ battleId })
    if (!battleId) {
      router.push('/choose-fighter')
      return
    }
    if (!player) {
      router.push('/')
      return
    }
    fetchBattleAccount(battleId)
    fetchMyCards(player)
  }, [battleId])

  const fetchBattleAccount = async (battleId: string) => {
    const battleAccount = await getBattleAccount(program, parseInt(battleId))
    setBattleAccount(battleAccount)
  }

  const fetchMyCards = async (player: Keypair) => {
    const myAccount = await getUserAccount(program, player.publicKey)
    setMyCards(myAccount.solamons)
  }

  const handleCardPick = (card: CardData) => {
    if (pickedCards.includes(card)) {
      setPickedCards(pickedCards.filter((c) => c !== card))
    } else if (pickedCards.length < 3) {
      setPickedCards([...pickedCards, card])
    }
  }

  const handleCardRemove = (card: CardData) => {
    setPickedCards(pickedCards.filter((c) => c !== card))
  }

  const handleFight = async () => {
    if (pickedCards.length < 3) {
      console.log('Please pick 3 cards')
      return
    }
    if (!player) {
      console.log('Please connect your wallet')
      return
    }
    if (!battleId) {
      console.log('Battle ID is not found')
      return
    }

    showLoading('Joining battle...')
    try {
      console.log('Starting battle with cards:', pickedCards)
      const tx = await wrapSolAndJoinBattleTx(
        connection,
        program,
        player.publicKey,
        parseInt(battleId),
        pickedCards.map((card) => card.id)
      )
      await sendAndConfirmTransaction(connection, tx, [player])
      router.push(`/game?battleId=${battleId}`)
    } catch (error) {
      alert('Battle error: ' + error)
    }
    hideLoading()
  }

  return (
    <div className='prepare-battle-page bg-black text-white min-h-screen p-4'>
      <Nav />
      <button
        className='text-yellow-400 text-2xl mb-4'
        onClick={() => router.back()}
      >
        &lt;
      </button>
      <h1 className='text-2xl font-semibold text-yellow-400 mb-4 text-center'>
        Pick Squad
      </h1>

      <div className='enemy-cards bg-gray-800 p-4 rounded-lg mb-4'>
        <h2 className='text-yellow-400 text-xl mb-2'>Enemy Card</h2>
        <div className='flex space-x-4'>
          {battleAccount?.player1Solamons.map(
            (card: CardData, index: number) => (
              <Card key={index} card={card} />
            )
          )}
        </div>
      </div>

      <PickedCards
        pickedCards={pickedCards}
        onCardRemove={handleCardRemove}
        buttonLabel='Fight!'
        onButtonClick={handleFight}
        loading={loading}
        buttonDisabled={pickedCards.length < 3}
      />

      <CardList
        cards={myCards}
        pickedCards={pickedCards}
        showInBattle={true}
        onCardPick={handleCardPick}
      />
    </div>
  )
}

export default PrepareBattlePage
