'use client'

import React from 'react'
import Modal from '../Modal'
import Card from '../Card'
import { useModal } from '@/contexts/ModalContext'
import { CardData, elementToString } from '@/lib/solana-helper'

interface CardDetailsModalProps {
  selectedCard: CardData | null
}

const CardDetailsModal: React.FC<CardDetailsModalProps> = ({
  selectedCard,
}) => {
  const { modals, closeModal } = useModal()

  return (
    <Modal
      isOpen={modals['cardDetails']}
      onClose={() => closeModal('cardDetails')}
      title='Card Details'
      maxWidth='400px'
    >
      {selectedCard && (
        <div className='card-details text-center'>
          <h3 className='text-2xl font-bold mb-4'>{selectedCard.name}</h3>
          <div className='flex justify-center mb-4'>
            <Card card={selectedCard} />
          </div>
          <p>Element: {elementToString(selectedCard.element)}</p>
          <p>Attack: {selectedCard.attack}</p>
          <p>Health: {selectedCard.health}</p>
        </div>
      )}
    </Modal>
  )
}

export default CardDetailsModal
