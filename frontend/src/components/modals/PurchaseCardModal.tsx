'use client'

import React from 'react'
import Modal from '../Modal'
import Button from '../Button'
import { useModal } from '@/contexts/ModalContext'

interface PurchaseCardModalProps {
  onPurchase: () => void
}

const PurchaseCardModal: React.FC<PurchaseCardModalProps> = ({
  onPurchase,
}) => {
  const { modals, closeModal } = useModal()

  return (
    <Modal
      isOpen={modals['purchaseCard']}
      onClose={() => closeModal('purchaseCard')}
      title='Purchase Card'
      maxWidth='400px'
    >
      <div className='purchase-modal text-center flex flex-col items-center'>
        <img
          src='/images/game/cardpack.png'
          alt='Card Pack'
          className='w-32 h-auto mb-4'
        />
        <div className='flex justify-center gap-4'>
          <Button onClick={onPurchase}>+ New Card (0.1)</Button>
        </div>
      </div>
    </Modal>
  )
}

export default PurchaseCardModal
