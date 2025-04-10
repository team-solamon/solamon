'use client'

import dynamic from 'next/dynamic'
import React from 'react'

import { CardData } from '@/lib/solana-helper'

import { useModal } from '@/contexts/ModalContext'

import Button from '../Button'
import Modal from '../Modal'
import Typography from '../Typography'

const DrawGame = dynamic(() => import('@/app/draw/components/DrawGame'), {
  ssr: false,
})

interface NewCardModalProps {
  drawableCards: CardData[]
  onViewAll: () => void
  onClose: () => void
}

const NewCardModal: React.FC<NewCardModalProps> = ({
  drawableCards,
  onViewAll,
  onClose,
}) => {
  const { modals, closeModal } = useModal()

  return (
    <Modal
      isOpen={modals['newCard']}
      onClose={() => {
        onClose()
        closeModal('newCard')
      }}
      title='Stake and Draw Card'
    >
      <div className='flex flex-col px-4'>
        <DrawGame drawableCards={drawableCards} />
        <div className='flex justify-center mt-4'>
          {drawableCards.length >= 2 && (
            <Button onClick={onViewAll}>Open All</Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default NewCardModal
