'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CardData,
  getUserAccount,
  wrapSolAndOpenBattleTx,
} from '@/lib/solana-helper'
import Nav from '@/components/Nav'
import PickedCards from '@/components/PickedCards'
import CardList from '@/components/CardList'
import { getKeypairFromLocalStorage, getConnection } from '@/lib/helper'
import { getProgram } from '@/lib/helper'
import Typography from '@/components/Typography'
import { LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js'

const OpenBattlePage = () => {
  const router = useRouter()
  const [pickedCards, setPickedCards] = useState<CardData[]>([])
  const [myCards, setMyCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(false)
  const connection = getConnection()
  const program = getProgram()
  const player = getKeypairFromLocalStorage()

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
    const BATLLE_STAKE = 0.01 * LAMPORTS_PER_SOL

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
    </div>
  )
}

export default OpenBattlePage
