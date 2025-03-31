'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import Modal from '../Modal'
import { useModal } from '@/contexts/ModalContext'

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
      title='🃏 Card Guide!!!'
      maxWidth='600px'
    >
      <div className='flex flex-col items-center justify-center'>
        🃏 Card Guide!!! contents
      </div>
    </Modal>
  )
}

export default CardGuideModal
