'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import Modal from '../Modal'
import Button from '../Button'
import { useModal } from '@/contexts/ModalContext'
import { CardData } from '@/lib/solana-helper'

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
      title='+ New Card'
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
