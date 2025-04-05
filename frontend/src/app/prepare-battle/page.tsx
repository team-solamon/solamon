'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { getProgram, trimAddress } from '@/lib/helper'
import { ROUTES } from '@/lib/routes'
import {
  BattleAccount,
  CardData,
  getBattleAccount,
  getUserAccount,
  joinBattleTx,
} from '@/lib/solana-helper'

import Card from '@/components/Card'
import CardList from '@/components/CardList'
import CardStats from '@/components/CardStats'
import Nav from '@/components/Nav'
import PickedCards from '@/components/PickedCards'
import SharedModal from '@/components/SharedModal'
import Typography from '@/components/Typography'
import Button from '@/components/Button'

import { useBalance } from '@/contexts/BalanceContext'
import { useLoading } from '@/contexts/LoadingContext'
import { BATLLE_STAKE } from '@/constant/env'
const PrepareBattlePage = () => {
  const searchParams = useSearchParams()
  const battleId = searchParams.get('battleId')
  const router = useRouter()
  const { connection } = useConnection()
  const program = getProgram(connection)
  const { publicKey, sendTransaction } = useWallet()
  const [myCards, setMyCards] = useState<CardData[]>([])
  const [pickedCards, setPickedCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(false)
  const [battleAccount, setBattleAccount] = useState<BattleAccount | null>(null)
  const { showLoading, hideLoading } = useLoading()
  const { fetchBalance, zBTCBalance } = useBalance()

  useEffect(() => {
    console.log({ battleId })
    if (!battleId) {
      router.push('/choose-fighter')
      return
    }
    if (!publicKey) {
      router.push('/')
      return
    }
    fetchBattleAccount(battleId)
    fetchMyCards(publicKey)
  }, [battleId])

  const fetchBattleAccount = async (battleId: string) => {
    const battleAccount = await getBattleAccount(program, parseInt(battleId))
    setBattleAccount(battleAccount)
  }

  const fetchMyCards = async (publicKey: PublicKey) => {
    const myAccount = await getUserAccount(program, publicKey)
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
    if (!publicKey) {
      console.log('Please connect your wallet')
      return
    }
    if (!battleId) {
      console.log('Battle ID is not found')
      return
    }

    if (!zBTCBalance || zBTCBalance < BATLLE_STAKE) {
      alert('Insufficient ZBTC balance')
      return
    }

    showLoading('Joining battle...')
    setLoading(true)
    try {
      console.log('Starting battle with cards:', pickedCards)
      const tx = await joinBattleTx(
        program,
        publicKey,
        parseInt(battleId),
        pickedCards.map((card) => card.id)
      )
      const txHash = await sendTransaction(tx, connection)
      await connection.confirmTransaction(txHash)
      fetchBalance()
      router.push(`${ROUTES.GAME}?battleId=${battleId}`)
    } catch (error) {
      alert('Battle error: ' + error)
    }
    setLoading(false)
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
      <Typography variant='body-1' className='text-center mb-4'>
        Pick your card
      </Typography>

      <div className='enemy-cards bg-[rgba(127,14,16,1)] p-4 rounded-lg mb-4 max-w-fit mx-auto'>
        <Typography variant='caption-1'>
          {trimAddress(battleAccount?.player1.toString())}
        </Typography>
        <div className='flex space-x-4'>
          {battleAccount?.player1Solamons.map(
            (card: CardData, index: number) => (
              <div key={index} className='relative flex justify-center'>
                <Card key={index} species={card.species} className='mx-auto' />
                <CardStats attack={card.attack} health={card.health} />
              </div>
            )
          )}
        </div>
      </div>

      <PickedCards
        pickedCards={pickedCards}
        onCardRemove={handleCardRemove}
        button={
          <Button
            disabled={pickedCards.length < 3}
            onClick={handleFight}
            loading={loading}
          >
            Fight!
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

export default PrepareBattlePage
