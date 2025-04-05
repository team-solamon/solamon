'use client'

import dynamic from 'next/dynamic'
import React from 'react'

import { useModal } from '@/contexts/ModalContext'

import Modal from '../Modal'

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
      maxWidth='800px'
      maxHeight='1000px'
    >
      <Tutorial onNewCard={onNewCard} />
    </Modal>
  )
}

export default TutorialModal
