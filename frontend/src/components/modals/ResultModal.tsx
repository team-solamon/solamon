'use client'

import React from 'react'
import Modal from '../Modal'
import GameResult from '../GameResult'
import { useModal } from '@/contexts/ModalContext'
import { BattleStatus } from '@/data/battle'

interface ResultModalProps {
  selectedBattle: BattleStatus | null
}

const ResultModal: React.FC<ResultModalProps> = ({ selectedBattle }) => {
  const { modals, closeModal } = useModal()

  return (
    <>
      {selectedBattle && selectedBattle.status === 'result' && (
        <Modal
          isOpen={modals['result']}
          onClose={() => closeModal('result')}
          title={selectedBattle.isPlayerWinner ? 'Win' : 'Lose'}
          maxWidth='600px'
        >
          <GameResult
            battleStatus={selectedBattle}
            isPlayerWinner={selectedBattle.isPlayerWinner}
            reward={selectedBattle.isPlayerWinner ? 0.1 : undefined}
          />
        </Modal>
      )}
    </>
  )
}

export default ResultModal
