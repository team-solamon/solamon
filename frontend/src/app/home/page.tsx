'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CardStack from '@/components/CardStack'
import Nav from '@/components/Nav'
import Button from '../../components/Button'
import { ModalProvider, useModal } from '@/contexts/ModalContext'
import { ROUTES } from '@/lib/routes'

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
} from '@/lib/solana-helper'
import {
  getConnection,
  getKeypairFromLocalStorage,
  getProgram,
} from '@/lib/helper'
import { useLoading } from '@/contexts/LoadingContext'
import Typography from '@/components/Typography'
import CardList from '@/components/CardList'

const cardStackData: BattleStatus[] = [
  {
    status: 'pending',
    myCards: [
      {
        name: 'FIRE',
        element: { fire: {} },
        attack: 5,
        health: 3,
        species: 1,
      },
      {
        name: 'WATER',
        element: { water: {} },
        attack: 3,
        health: 6,
        species: 2,
      },
      {
        name: 'EARTH',
        element: { earth: {} },
        attack: 4,
        health: 5,
        species: 3,
      },
    ],
  },
  {
    status: 'result',
    isPlayerWinner: true,
    myCards: [
      {
        name: 'METAL',
        element: { metal: {} },
        attack: 6,
        health: 2,
        species: 4,
      },
      { name: 'WOOD', element: { wood: {} }, attack: 4, health: 4, species: 5 },
      { name: 'FIRE', element: { fire: {} }, attack: 5, health: 3, species: 6 },
    ],
    opponentCards: [
      {
        name: 'WATER',
        element: { water: {} },
        attack: 3,
        health: 6,
        species: 7,
      },
      {
        name: 'EARTH',
        element: { earth: {} },
        attack: 4,
        health: 5,
        species: 8,
      },
      {
        name: 'METAL',
        element: { metal: {} },
        attack: 6,
        health: 2,
        species: 9,
      },
    ],
  },
  {
    status: 'result',
    isPlayerWinner: false,
    myCards: [
      {
        name: 'METAL',
        element: { metal: {} },
        attack: 6,
        health: 2,
        species: 10,
      },
      {
        name: 'WOOD',
        element: { wood: {} },
        attack: 4,
        health: 4,
        species: 11,
      },
      {
        name: 'FIRE',
        element: { fire: {} },
        attack: 5,
        health: 3,
        species: 12,
      },
    ],
    opponentCards: [
      {
        name: 'WATER',
        element: { water: {} },
        attack: 3,
        health: 6,
        species: 13,
      },
      {
        name: 'EARTH',
        element: { earth: {} },
        attack: 4,
        health: 5,
        species: 14,
      },
      {
        name: 'METAL',
        element: { metal: {} },
        attack: 6,
        health: 2,
        species: 15,
      },
    ],
  },
]

const HomePageContent = () => {
  const router = useRouter()

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

  return (
    <div className='home-page bg-black text-white min-h-screen p-4'>
      <Nav />
      <div className='action-buttons flex justify-center gap-4 mb-8'>
        <Button onClick={() => openModal('purchaseCard')}>
          + New Card <span className='text-blue-400'>0.1</span>
        </Button>
        <Button onClick={() => router.push(ROUTES.OPEN_BATTLE)}>Open Match</Button>
        <Button onClick={() => router.push(ROUTES.CHOOSE_FIGHTER)}>
          Choose Fighter
        </Button>
      </div>

      <section className='battle-section mb-8'>
        <div className='bg-[#978578] p-4 rounded-lg'>
          <Typography variant='title-2' color='inverse'>
            Battle
          </Typography>
          <div className='battle-cards grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {cardStackData.map((battle, index) => (
              <div
                key={index}
                className='card bg-[rgba(202,193,185,1)] p-4 rounded-lg max-w-[250px] w-full'
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
          <CardList cards={myCards} />
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
