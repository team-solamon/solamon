'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import React from 'react'

import { getWinnerFromBattleAccount } from '@/lib/helper'
import { BattleAccount } from '@/lib/solana-helper'

import { useModal } from '@/contexts/ModalContext'

import GameResult from '../GameResult'
import Modal from '../Modal'

interface ResultModalProps {
  selectedBattle: BattleAccount
  showReplay: boolean
  onClaim: () => void
}

const ResultModal: React.FC<ResultModalProps> = ({
  selectedBattle,
  showReplay,
  onClaim,
}) => {
  const { modals, closeModal } = useModal()
  const { publicKey } = useWallet()
  const winner = getWinnerFromBattleAccount(selectedBattle)
  const isPlayerWinner = winner === publicKey?.toBase58()

  return (
    <>
      <Modal
        isOpen={modals['result']}
        onClose={() => closeModal('result')}
        title={isPlayerWinner ? 'Win' : 'Lose'}
        maxWidth='600px'
      >
        <GameResult
          onClose={() => closeModal('result')}
          onClaim={onClaim}
          showReplay={showReplay}
          battleAccount={selectedBattle}
        />
      </Modal>
    </>
  )
}

export default ResultModal
