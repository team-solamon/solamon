'use client'

import React from 'react'

import Modal from '../Modal'
import { useModal } from '@/contexts/ModalContext'
import Button from '../Button'
import { stringToElement } from '@/lib/solana-helper'
import Card from '../Card'
import CardElementProbabilities from '../CardElementProbabilities'
import { CARD_SPECIES_PROBABILITIES } from '@/constant/env'

interface TutorialModalProps {
  onNewCard: () => void
  onOpenBattle: () => void
}

const CardGuideModal: React.FC<TutorialModalProps> = ({
  onNewCard,
  onOpenBattle,
}) => {
  const { modals, closeModal } = useModal()

  return (
    <Modal
      isOpen={modals['guide']}
      onClose={() => closeModal('guide')}
      title='🃏 Card Guide!'
      maxWidth='1000px'
    >
      <div className='flex flex-col h-full'>
        <div className='grid grid-cols-5 gap-4 p-2'>
          {CARD_SPECIES_PROBABILITIES.map((card, index) => (
            <div
              key={index}
              className='card bg-gray-700 p-2 rounded-lg flex-shrink-0 relative'
            >
              <Card species={card.species} className='mx-auto' />
              <CardElementProbabilities data={card.probabilities} />
            </div>
          ))}
        </div>
        <div className='mt-4 flex justify-around sticky bottom-0 bg-[#978578] py-3'>
          <Button onClick={onNewCard}>New Card</Button>
          <Button onClick={onOpenBattle}>Open Battle</Button>
        </div>
      </div>
    </Modal>
  )
}

export default CardGuideModal
