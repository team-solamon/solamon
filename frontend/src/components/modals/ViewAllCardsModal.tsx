'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

import { CardData } from '@/lib/solana-helper'

import { useModal } from '@/contexts/ModalContext'

import Button from '../Button'
import Card from '../Card'
import Modal from '../Modal'

interface ViewAllCardsModalProps {
  currentCards: CardData[]
  drawableCards: CardData[]
  onClose: () => void
  onOpenBattle: () => void
}

const ViewAllCardsModal: React.FC<ViewAllCardsModalProps> = ({
  currentCards,
  drawableCards,
  onClose,
  onOpenBattle,
}) => {
  const { modals, closeModal } = useModal()
  const router = useRouter()

  return (
    <Modal
      isOpen={modals['viewAllCards']}
      onClose={() => {
        closeModal('viewAllCards')
        onClose()
      }}
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
          onClick={onOpenBattle}
          disabled={currentCards.length + drawableCards.length < 3}
        >
          Open Battle
        </Button>
      </div>
    </Modal>
  )
}

export default ViewAllCardsModal
