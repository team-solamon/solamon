'use client'

import React, { useEffect, useState } from 'react'
import { getElementEmoji } from '@/data/card'
import CardStack from '@/components/CardStack'
import Nav from '@/components/Nav'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { ModalProvider, useModal } from '@/contexts/ModalContext'

import TutorialModal from '@/components/modals/TutorialModal'
import PurchaseCardModal from '@/components/modals/PurchaseCardModal'
import NewCardModal from '@/components/modals/NewCardModal'
import ViewAllCardsModal from '@/components/modals/ViewAllCardsModal'
import CardDetailsModal from '@/components/modals/CardDetailsModal'
import ResultModal from '@/components/modals/ResultModal'
import { BattleStatus } from '@/data/battle'
import {
  CardData,
  elementToString,
  getUserAccount,
  showSpawnResult,
  spawnSolamonsTx,
  stringToElement,
} from '@/lib/solana-helper'
import {
  getConnection,
  getKeypairFromLocalStorage,
  getProgram,
} from '@/lib/helper'
import { useLoading } from '@/contexts/LoadingContext'
import Typography from '@/components/Typography'

const cardStackData: BattleStatus[] = [
  {
    status: 'pending',
    myCards: [
      { name: 'FIRE', element: { fire: {} }, attack: 5, health: 3 },
      { name: 'WATER', element: { water: {} }, attack: 3, health: 6 },
      { name: 'EARTH', element: { earth: {} }, attack: 4, health: 5 },
    ],
  },
  {
    status: 'result',
    isPlayerWinner: true,
    myCards: [
      { name: 'METAL', element: { metal: {} }, attack: 6, health: 2 },
      { name: 'WOOD', element: { wood: {} }, attack: 4, health: 4 },
      { name: 'FIRE', element: { fire: {} }, attack: 5, health: 3 },
    ],
    opponentCards: [
      { name: 'WATER', element: { water: {} }, attack: 3, health: 6 },
      { name: 'EARTH', element: { earth: {} }, attack: 4, health: 5 },
      { name: 'METAL', element: { metal: {} }, attack: 6, health: 2 },
    ],
  },
  {
    status: 'result',
    isPlayerWinner: false,
    myCards: [
      { name: 'METAL', element: { metal: {} }, attack: 6, health: 2 },
      { name: 'WOOD', element: { wood: {} }, attack: 4, health: 4 },
      { name: 'FIRE', element: { fire: {} }, attack: 5, health: 3 },
    ],
    opponentCards: [
      { name: 'WATER', element: { water: {} }, attack: 3, health: 6 },
      { name: 'EARTH', element: { earth: {} }, attack: 4, health: 5 },
      { name: 'METAL', element: { metal: {} }, attack: 6, health: 2 },
    ],
  },
]

const HomePageContent = () => {
  const { openModal, closeModal } = useModal()
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)
  const [selectedBattle, setSelectedBattle] = useState<BattleStatus | null>(
    null
  )
  const [spawnResult, setSpawnResult] = useState<CardData[]>([])
  const [myCards, setMyCards] = useState<CardData[]>([])
  const { showLoading, hideLoading } = useLoading()
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

  const handleNewCardFromTutorial = () => {
    closeModal('tutorial')
    openModal('purchaseCard')
  }

  const handlePurchase = async (amount: number) => {
    showLoading('Spawning solamons...')

    if (!player) {
      console.error('No player found')
      return
    }
    const tx = await spawnSolamonsTx(
      connection,
      program,
      player.publicKey,
      amount
    )
    const txSig = await connection.sendTransaction(tx, [player])
    await connection.confirmTransaction(txSig)
    const spawnResult = await showSpawnResult(connection, txSig)
    setSpawnResult(spawnResult)
    hideLoading()
    closeModal('purchaseCard')
    openModal('newCard')
  }

  const handleViewAllCards = () => {
    closeModal('newCard')
    openModal('viewAllCards')
  }

  const getElementCounts = () => {
    const counts: { [key: string]: number } = {
      fire: 0,
      water: 0,
      earth: 0,
      metal: 0,
      wood: 0,
    }

    myCards.forEach((card) => {
      if (counts[elementToString(card.element)] !== undefined) {
        counts[elementToString(card.element)]++
      }
    })

    return counts
  }

  const elementCounts = getElementCounts()

  return (
    <div className='home-page bg-black text-white min-h-screen p-4'>
      <Nav />
      <div className='action-buttons flex justify-center gap-4 mb-8'>
        <Button onClick={() => openModal('purchaseCard')}>
          + New Card <span className='text-blue-400'>0.1</span>
        </Button>
        <Button>Open Match</Button>
        <Button>Choose Fighter</Button>
      </div>

      <section className='battle-section mb-8'>
        <div className='bg-[#978578] p-4 rounded-lg'>
          <Typography variant='title-2' color='inverse'>
            Battle
          </Typography>
          <div className='battle-cards flex gap-4'>
            {cardStackData.map((battle, index) => (
              <div
                key={index}
                className='card bg-[rgba(202,193,185,1)] p-4 rounded-lg'
              >
                <div className='flex justify-around'>
                  <div>
                    <h4 className='text-center text-sm text-gray-400 mb-2'>
                      My Cards
                    </h4>
                    <CardStack cards={battle.myCards} className='mx-auto' />
                  </div>
                </div>
                {battle.status === 'result' ? (
                  <Button
                    onClick={() => {
                      setSelectedBattle(battle)
                      openModal('result')
                    }}
                  >
                    {battle.status}
                  </Button>
                ) : (
                  <Button>{battle.status}</Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='my-card-section'>
        <div className='bg-[#978578] p-4 rounded-lg'>
          <Typography variant='title-2'>My Card | {myCards.length}</Typography>
          <div className='card-stats flex gap-4 text-lg mb-4'>
            {Object.entries(elementCounts).map(
              ([element, count]) =>
                count > 0 && (
                  <span key={element}>
                    {getElementEmoji(stringToElement(element))} {count}
                  </span>
                )
            )}
          </div>
          <div className='card-list grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4'>
            {myCards.map((card, index) => (
              <div
                key={index}
                className='card bg-[rgba(202,193,185,1)]  p-2 rounded-lg flex flex-col items-center relative'
              >
                <Card card={card} className='mx-auto' />
                <div className='flex items-end gap-8 bg-[rgba(19,19,19,0.7)] p-2 rounded-2xl absolute bottom-8 '>
                  <Typography variant='caption-1'>
                    {`⚔️ ${card.attack}`}
                  </Typography>
                  <Typography variant='caption-1'>
                    {`♥️️ ${card.health}`}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      <TutorialModal onNewCard={handleNewCardFromTutorial} />
      <PurchaseCardModal onPurchase={handlePurchase} />
      <NewCardModal
        drawableCards={spawnResult}
        onViewAll={handleViewAllCards}
        onClose={fetchMyCards}
      />
      <ViewAllCardsModal drawableCards={spawnResult} />
      <CardDetailsModal selectedCard={selectedCard} />
      <ResultModal selectedBattle={selectedBattle} />
    </div>
  )
}

const HomePage = () => {
  return (
    <ModalProvider>
      <HomePageContent />
    </ModalProvider>
  )
}

export default HomePage
