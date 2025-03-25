'use client'

import React, { useState } from 'react'
import Button from '../../components/Button'
import CardImage from '../../components/CardImage'

import dynamic from 'next/dynamic'
import Modal from '../../components/Modal'
import { DrawableCards } from '@/game/data/draw'

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

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

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
        <Button onClick={openModal}>
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
              <CardImage id='fire-card' />
              <Button>배틀 결과 보기</Button>
            </div>
          </div>
        </div>
      </section>

      <section className='my-card-section'>
        <div className='bg-[#978578] p-4 rounded-lg'>
          <h2 className='text-2xl font-semibold text-yellow-400 mb-4'>
            My Card | 10
          </h2>
          <div className='card-stats flex gap-4 text-lg mb-4'>
            <span>🔥 2</span>
            <span>💧 8</span>
            <span>🌱 2</span>
            <span>⚒️ 1</span>
          </div>
          <div className='card-list grid grid-cols-4 gap-4'>
            <div className='card bg-gray-700 p-4 rounded-lg'>
              <CardImage id='water' />
              <Button>Stats</Button>
            </div>
            <div className='card bg-gray-700 p-4 rounded-lg'>
              <CardImage id='earth' />
              <Button>Stats</Button>
            </div>
            <div className='card bg-gray-700 p-4 rounded-lg'>
              <CardImage id='metal' />
              <Button>Stats</Button>
            </div>
            <div className='card bg-gray-700 p-4 rounded-lg'>
              <CardImage id='wood' />
              <Button>Stats</Button>
            </div>
          </div>
        </div>
      </section>
      <Modal isOpen={isModalOpen} onClose={closeModal} title='+ New Card'>
        <DrawGame onClose={closeModal} drawableCards={drawableCards} />
      </Modal>
    </div>
  )
}

export default HomePage
