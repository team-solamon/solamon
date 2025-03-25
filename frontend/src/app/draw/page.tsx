'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Modal from '../../components/Modal'
import { DrawableCards } from '@/game/data/draw'

const DrawGame = dynamic(() => import('./components/DrawGame'), { ssr: false })

const drawableCards: DrawableCards = {
  cards: [
    { name: 'FIRE', element: 'FIRE', attack: 5, health: 3 },
    { name: 'WATER', element: 'WATER', attack: 3, health: 6 },
    { name: 'EARTH', element: 'EARTH', attack: 4, health: 5 },
    { name: 'METAL', element: 'METAL', attack: 6, health: 2 },
    { name: 'WOOD', element: 'WOOD', attack: 4, health: 4 },
  ],
}

export default function DrawPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <div className='container mx-auto py-8'>
      <div className='text-center'>
        <button
          onClick={openModal}
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        >
          Open
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title='+ New Card'>
        <DrawGame onClose={closeModal} drawableCards={drawableCards} />
      </Modal>
    </div>
  )
}
