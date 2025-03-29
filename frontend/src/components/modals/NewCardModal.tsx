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
      <DrawGame drawableCards={drawableCards} />
      <Button onClick={onViewAll}>Open All</Button>
    </Modal>
  )
}

export default NewCardModal
