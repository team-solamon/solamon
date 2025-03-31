'use client'

import React, { useState } from 'react'
import Modal from '../Modal'
import Button from '../Button'
import { useModal } from '@/contexts/ModalContext'
import Typography from '../Typography'
import SolanaBalance from '../SolanaBalance'
import { NEW_CARD_SOL_PRICE } from '@/constant/env'

interface PurchaseCardModalProps {
  onPurchase: (amount: number) => void
}

const PurchaseCardModal: React.FC<PurchaseCardModalProps> = ({
  onPurchase,
}) => {
  const { modals, closeModal } = useModal()
  const [cardAmount, setCardAmount] = useState<number>(0)

  return (
    <Modal
      isOpen={modals['purchaseCard']}
      onClose={() => closeModal('purchaseCard')}
      title='+ New Card'
      maxWidth='400px'
    >
      <div className='purchase-modal text-center flex flex-col items-center'>
        <div className='mb-4 w-full'>
          <Typography variant='body-1'>
            <select
              id='cardAmount'
              value={cardAmount}
              onChange={(e) => setCardAmount(Number(e.target.value))}
              className='mt-1 block w-full pl-3 pr-10 py-2 text-base rounded-md'
              style={{
                backgroundColor: 'rgba(82, 71, 63, 1)',
                /* Custom arrow styling */
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='rgba(255, 212, 0, 1)' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.7rem top 50%',
                backgroundSize: '1.5em 1.5em',
              }}
            >
              <option value={0} selected>
                How many cards?
              </option>
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </Typography>
        </div>

        <div className='flex justify-center gap-4'>
          <Button
            onClick={() => onPurchase(cardAmount)}
            disabled={cardAmount === 0}
          >
            <div className='flex items-center gap-1'>
              + New Card
              <SolanaBalance balance={cardAmount * NEW_CARD_SOL_PRICE} />
            </div>
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default PurchaseCardModal
