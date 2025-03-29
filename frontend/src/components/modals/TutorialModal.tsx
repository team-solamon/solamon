'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import Modal from '../Modal'
import { useModal } from '@/contexts/ModalContext'

const Tutorial = dynamic(() => import('../Tutorial'), {
  ssr: false,
})

interface TutorialModalProps {
  onNewCard: () => void
}

const TutorialModal: React.FC<TutorialModalProps> = ({ onNewCard }) => {
  const { modals, closeModal } = useModal()

  return (
    <Modal
      isOpen={modals['tutorial']}
      onClose={() => closeModal('tutorial')}
      title='Tutorial'
      maxWidth='600px'
    >
      <Tutorial onNewCard={onNewCard} />
    </Modal>
  )
}

export default TutorialModal
