'use client'

import { LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { getConnection,getKeypairFromLocalStorage } from '@/lib/helper'
import { getProgram } from '@/lib/helper'
import { ROUTES } from '@/lib/routes'
import {
  CardData,
  getUserAccount,
  wrapSolAndOpenBattleTx,
} from '@/lib/solana-helper'

import CardList from '@/components/CardList'
import Nav from '@/components/Nav'
import PickedCards from '@/components/PickedCards'
import SharedModal from '@/components/SharedModal'
import Typography from '@/components/Typography'

import { useBalance } from '@/contexts/BalanceContext'

const OpenBattlePage = () => {
  const router = useRouter()
  const [pickedCards, setPickedCards] = useState<CardData[]>([])
  const [myCards, setMyCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(false)
  const connection = getConnection()
  const program = getProgram()
  const player = getKeypairFromLocalStorage()
  const { fetchBalance } = useBalance()

  useEffect(() => {
    fetchMyCards()
  }, [])

  const fetchMyCards = async () => {
    if (!player) {
      console.error('No player found')
      return
    }
    const myAccount = await getUserAccount(program, player.publicKey)
    setMyCards(myAccount.solamons)

    if (myAccount.solamons.length < 3) {
      router.push(ROUTES.HOME)
    }
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

  const handleOpenBattle = async () => {
    if (pickedCards.length < 3) {
      console.log('Please pick 3 cards')
      return
    }

    if (!player) {
      console.error('No player found')
      return
    }

    setLoading(true)

    // @TODO: temporary
    const BATLLE_STAKE = 0.1 * LAMPORTS_PER_SOL

    const tx = await wrapSolAndOpenBattleTx(
      connection,
      program,
      player.publicKey,
      BATLLE_STAKE,
      pickedCards.map((card) => card.id)
    )

    const sig = await sendAndConfirmTransaction(getConnection(), tx, [player])

    setPickedCards([])
    fetchMyCards()
    fetchBalance()
    setLoading(false)
  }

  console.log({ myCards })
  return (
    <div className='prepare-battle-page bg-black text-white min-h-screen p-4'>
      <Nav />
      <button
        className='text-yellow-400 text-2xl mb-4'
        onClick={() => router.back()}
      >
        &lt;
      </button>
      <Typography variant='title-1' className='text-center mb-4'>
        Open Battle
      </Typography>

      <PickedCards
        pickedCards={pickedCards}
        onCardRemove={handleCardRemove}
        buttonLabel='Open Battle'
        onButtonClick={handleOpenBattle}
        loading={loading}
        buttonDisabled={pickedCards.length < 3}
      />

      <CardList
        cards={myCards}
        pickedCards={pickedCards}
        showInBattle={true}
        onCardPick={handleCardPick}
      />
      <SharedModal />
    </div>
  )
}

export default OpenBattlePage
