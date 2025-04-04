'use client'

import React from 'react'

import {
  getKeypairFromLocalStorage,
  getWinnerFromBattleAccount,
} from '@/lib/helper'
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
  const player = getKeypairFromLocalStorage()
  const winner = getWinnerFromBattleAccount(selectedBattle)
  const isPlayerWinner = winner === player?.publicKey?.toBase58()

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
