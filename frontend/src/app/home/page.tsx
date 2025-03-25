'use client'

import React, { useState } from 'react'
import Button from '../../components/Button'
import CardImage from '../../components/CardImage'

import dynamic from 'next/dynamic'
import Modal from '../../components/Modal'
import { DrawableCards } from '@/game/data/draw'
import { CardData, CardElement, getElementEmoji } from '@/game/data/card'
import { useRouter } from 'next/navigation'

const DrawGame = dynamic(() => import('../draw/components/DrawGame'), {
  ssr: false,
})

const drawableCards: DrawableCards = {
  cards: [
    { name: 'FIRE', element: 'FIRE', attack: 5, health: 3 },
    { name: 'WATER', element: 'WATER', attack: 3, health: 6 },
    { name: 'EARTH', element: 'EARTH', attack: 4, health: 5 },
    { name: 'METAL', element: 'METAL', attack: 6, health: 2 },
    { name: 'WOOD', element: 'WOOD', attack: 4, health: 4 },
  ],
}

const myCards: CardData[] = [
  { name: 'FIRE', element: 'FIRE', attack: 5, health: 3 },
  { name: 'FIRE', element: 'FIRE', attack: 5, health: 3 },
  { name: 'FIRE', element: 'FIRE', attack: 5, health: 3 },
  { name: 'WATER', element: 'WATER', attack: 3, health: 6 },
  { name: 'EARTH', element: 'EARTH', attack: 4, health: 5 },
  { name: 'METAL', element: 'METAL', attack: 6, health: 2 },
  { name: 'WOOD', element: 'WOOD', attack: 4, health: 4 },
]

const HomePage = () => {
  const router = useRouter()

  const [modals, setModals] = useState<{ [key: string]: boolean }>({})
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)

  const openModal = (modalKey: string, card?: CardData) => {
    setModals((prev) => ({ ...prev, [modalKey]: true }))
    if (card) setSelectedCard(card)
  }

  const closeModal = (modalKey: string) => {
    setModals((prev) => ({ ...prev, [modalKey]: false }))
    if (modalKey === 'cardDetails') setSelectedCard(null)
  }

  const handlePurchase = () => {
    closeModal('purchaseCard')
    openModal('newCard')
  }

  const getElementCounts = () => {
    const counts: { [key: string]: number } = {
      FIRE: 0,
      WATER: 0,
      EARTH: 0,
      METAL: 0,
      WOOD: 0,
    }

    myCards.forEach((card) => {
      if (counts[card.element] !== undefined) {
        counts[card.element]++
      }
    })

    return counts
  }

  const elementCounts = getElementCounts()

  return (
    <div className='home-page bg-black text-white min-h-screen p-4'>
      <header className='header flex justify-between items-center mb-6'>
        <h1 className='text-4xl font-bold'>SOLAMON</h1>
        <div className='wallet-info text-right'>
          <span className='block text-sm text-gray-400'>0x637b...1c8a</span>
          <span className='block text-lg text-blue-400'>3.6416</span>
        </div>
      </header>

      <div className='action-buttons flex justify-center gap-4 mb-8'>
        <Button onClick={() => openModal('purchaseCard')}>
          + New Card <span className='text-blue-400'>0.1</span>
        </Button>
        <Button>Open Match</Button>
        <Button>Choose Fighter</Button>
      </div>

      <section className='battle-section mb-8'>
        <div className='bg-[#978578] p-4 rounded-lg'>
          <h2 className='text-2xl font-semibold text-yellow-400 mb-4'>
            Battle
          </h2>
          <div className='battle-cards flex gap-4'>
            <div className='card bg-gray-700 p-4 rounded-lg'>
              <Button onClick={() => router.push('/game')}>
                배틀 결과 보기
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className='my-card-section'>
        <div className='bg-[#978578] p-4 rounded-lg'>
          <h2 className='text-2xl font-semibold text-yellow-400 mb-4'>
            My Card | {myCards.length}
          </h2>
          <div className='card-stats flex gap-4 text-lg mb-4'>
            {Object.entries(elementCounts).map(
              ([element, count]) =>
                count > 0 && (
                  <span key={element}>
                    {getElementEmoji(element as CardElement)} {count}
                  </span>
                )
            )}
          </div>
          <div className='card-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4'>
            {myCards.map((card, index) => (
              <div
                key={index}
                className='card bg-gray-700 p-4 rounded-lg flex flex-col items-center'
              >
                <CardImage card={card} className='mx-auto' />
                <Button onClick={() => openModal('cardDetails', card)}>
                  Stats
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Modal
        isOpen={modals['purchaseCard']}
        onClose={() => closeModal('purchaseCard')}
        title='Purchase Card'
      >
        <div className='purchase-modal text-center flex flex-col items-center'>
          <img
            src='/images/game/cardpack.png'
            alt='Card Pack'
            className='w-32 h-auto mb-4'
          />
          <div className='flex justify-center gap-4'>
            <Button onClick={handlePurchase}>+ New Card (0.1)</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modals['newCard']}
        onClose={() => closeModal('newCard')}
        title='+ New Card'
      >
        <DrawGame drawableCards={drawableCards} />
      </Modal>

      <Modal
        isOpen={modals['cardDetails']}
        onClose={() => closeModal('cardDetails')}
        title='Card Details'
      >
        {selectedCard && (
          <div className='card-details text-center'>
            <h3 className='text-2xl font-bold mb-4'>{selectedCard.name}</h3>
            <div className='flex justify-center mb-4'>
              <CardImage card={selectedCard} />
            </div>
            <p>Element: {selectedCard.element}</p>
            <p>Attack: {selectedCard.attack}</p>
            <p>Health: {selectedCard.health}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default HomePage
