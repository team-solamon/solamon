'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { getProgram } from '@/lib/helper'
import { ROUTES } from '@/lib/routes'
import { CardData, getUserAccount, openBattleTx } from '@/lib/solana-helper'

import CardList from '@/components/CardList'
import Nav from '@/components/Nav'
import PickedCards from '@/components/PickedCards'
import SharedModal from '@/components/SharedModal'
import Typography from '@/components/Typography'

import { useBalance } from '@/contexts/BalanceContext'
import { BATLLE_STAKE } from '@/constant/env'
import Button from '@/components/Button'
import Balance from '@/components/Balance'

const OpenBattlePage = () => {
  const router = useRouter()
  const [pickedCards, setPickedCards] = useState<CardData[]>([])
  const [myCards, setMyCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(false)
  const { connection } = useConnection()
  const program = getProgram(connection)
  const { publicKey, sendTransaction } = useWallet()
  const { fetchBalance, zBTCBalance } = useBalance()

  useEffect(() => {
    fetchMyCards()
  }, [])

  const fetchMyCards = async () => {
    if (!publicKey) {
      console.error('No player found')
      return
    }
    const myAccount = await getUserAccount(program, publicKey)
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

    if (!publicKey) {
      console.error('No player found')
      return
    }

    if (!zBTCBalance || zBTCBalance < BATLLE_STAKE) {
      alert('Insufficient ZBTC balance')
      return
    }

    setLoading(true)

    const tx = await openBattleTx(
      program,
      publicKey,
      BATLLE_STAKE,
      pickedCards.map((card) => card.id)
    )

    const txHash = await sendTransaction(tx, connection)
    await connection.confirmTransaction(txHash)

    setPickedCards([])
    fetchMyCards()
    fetchBalance()
    setLoading(false)
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
      <Typography variant='title-1' className='text-center mb-4'>
        Open Battle
      </Typography>

      <PickedCards
        pickedCards={pickedCards}
        onCardRemove={handleCardRemove}
        button={
          <Button
            disabled={
              pickedCards.length < 3 ||
              !zBTCBalance ||
              zBTCBalance < BATLLE_STAKE
            }
            onClick={handleOpenBattle}
            loading={loading}
          >
            <div className='flex items-center gap-2'>
              Open Battle
              <Balance balance={BATLLE_STAKE} icon='zbtc' />
            </div>
          </Button>
        }
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
