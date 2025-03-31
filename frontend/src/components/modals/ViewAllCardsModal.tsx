'use client'

import React from 'react'
import Modal from '../Modal'
import Card from '../Card'
import { useModal } from '@/contexts/ModalContext'
import { CardData } from '@/lib/solana-helper'

interface ViewAllCardsModalProps {
  drawableCards: CardData[]
}

const ViewAllCardsModal: React.FC<ViewAllCardsModalProps> = ({
  drawableCards,
}) => {
  const { modals, closeModal } = useModal()

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
    </Modal>
  )
}

export default ViewAllCardsModal
