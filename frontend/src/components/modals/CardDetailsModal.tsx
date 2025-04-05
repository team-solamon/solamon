'use client'

import React from 'react'

import { CardData } from '@/lib/solana-helper'

import { useModal } from '@/contexts/ModalContext'

import Card from '../Card'
import Modal from '../Modal'
import CardStats from '../CardStats'
import Typography from '../Typography'
import YellowButton from '../YellowButton'
import { UNSTAKING_SOL_PRICE } from '@/constant/env'
import Balance from '../Balance'

interface CardDetailsModalProps {
  selectedCard: CardData | null
  onUnstake: () => void
}

const CardDetailsModal: React.FC<CardDetailsModalProps> = ({
  selectedCard,
  onUnstake,
}) => {
  const { modals, closeModal } = useModal()

  return (
    <Modal
      isOpen={modals['cardDetails']}
      onClose={() => closeModal('cardDetails')}
      title='Details'
      maxWidth='400px'
    >
      {selectedCard && (
        <div className='card-details text-center'>
          <h3 className='text-2xl font-bold mb-4'>{selectedCard.name}</h3>
          <div className='relative w-full h-full flex flex-col items-center justify-center'>
            <Card
              species={selectedCard.species}
              element={selectedCard.element}
            />
            <CardStats
              attack={selectedCard.attack}
              health={selectedCard.health}
            />
          </div>
          <div className='flex justify-center w-full mt-4'>
            <YellowButton onClick={onUnstake} width='150px' height='40px'>
              <div className='flex items-center gap-2'>
                <Balance
                  balance={UNSTAKING_SOL_PRICE}
                  variant='body-3'
                  color='primary'
                />
                <Typography variant='body-3'>unstaking</Typography>
              </div>
            </YellowButton>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default CardDetailsModal
