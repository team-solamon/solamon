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
      title='Result'
      maxWidth='600px'
    >
      <div className='flex justify-center overflow-x-auto gap-4 p-2'>
        {drawableCards.map((card, index) => (
          <div
            key={index}
            className='card bg-gray-700 p-2 rounded-lg flex-shrink-0 w-24'
          >
            <Card card={card} className='mx-auto' />
          </div>
        ))}
      </div>
    </Modal>
  )
}

export default ViewAllCardsModal
