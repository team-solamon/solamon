'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Modal from '../Modal'
import Card from '../Card'
import { useModal } from '@/contexts/ModalContext'
import { CardData } from '@/lib/solana-helper'
import { ROUTES } from '@/lib/routes'
import Button from '../Button'

interface ViewAllCardsModalProps {
  currentCards: CardData[]
  drawableCards: CardData[]
}

const ViewAllCardsModal: React.FC<ViewAllCardsModalProps> = ({
  currentCards,
  drawableCards,
}) => {
  const { modals, closeModal } = useModal()
  const router = useRouter()

  return (
    <Modal
      isOpen={modals['viewAllCards']}
      onClose={() => closeModal('viewAllCards')}
      title='+ New Cards'
      maxWidth='600px'
    >
      <div className='flex flex-wrap justify-center gap-4 p-2'>
        {drawableCards.map((card, index) => (
          <div
            key={index}
            className='card bg-gray-700 p-2 rounded-lg flex-shrink-0 w-24'
            style={{ width: 'calc(20% - 16px)' }}
          >
            <Card
              species={card.species}
              element={card.element}
              className='mx-auto'
            />
          </div>
        ))}
      </div>
      <div className='flex justify-center mt-4'>
        <Button
          onClick={() => router.push(ROUTES.OPEN_BATTLE)}
          disabled={currentCards.length + drawableCards.length < 3}
        >
          Open Battle
        </Button>
      </div>
    </Modal>
  )
}

export default ViewAllCardsModal
