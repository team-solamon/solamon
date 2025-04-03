'use client'

import React, { useEffect, useState } from 'react'
import Modal from '../Modal'
import { useModal } from '@/contexts/ModalContext'
import {
  BattleAccount,
  ParsedBattleAction,
  getBattleAccount,
  getBattleAccountPDA,
  getBattleActions,
} from '@/lib/solana-helper'
import {
  getConnection,
  getKeypairFromLocalStorage,
  getProgram,
  getWinnerFromBattleAccount,
} from '@/lib/helper'

interface StoryModalProps {
  selectedBattle: BattleAccount
}

const StoryModal: React.FC<StoryModalProps> = ({ selectedBattle }) => {
  const { modals, closeModal } = useModal()

  const player = getKeypairFromLocalStorage()
  const connection = getConnection()
  const program = getProgram()
  const [battleAccount, setBattleAccount] = useState<BattleAccount | null>(null)
  const [battleActions, setBattleActions] = useState<ParsedBattleAction[]>([])

  useEffect(() => {
    if (!selectedBattle) return

    setBattleAccount(selectedBattle)
    fetchBattleActions(selectedBattle.battleId)
  }, [selectedBattle])

  const fetchBattleActions = async (battleId: string) => {
    const battleActions = await getBattleActions(
      connection,
      getBattleAccountPDA(program, parseInt(battleId))
    )
    if (battleActions) {
      setBattleActions(battleActions)
    }
  }

  useEffect(() => {
    if (!player) {
      return
    }

    const isPlayer1 =
      battleAccount?.player1.toString() === player.publicKey.toString()

    if (battleAccount && battleActions) {
      const story = battleActions.map((action) => {
        const attacker =
          action.player === battleAccount.player1.toString()
            ? battleAccount.player1Name || 'Player 1'
            : battleAccount.player2Name || 'Player 2'
        const defender =
          action.player === battleAccount.player1.toString()
            ? battleAccount.player2Name || 'Player 2'
            : battleAccount.player1Name || 'Player 1'

        return `${attacker} used ${action.event} on ${defender}, dealing ${action.damage} damage!`
      })

      const winner = getWinnerFromBattleAccount(battleAccount)
      const winnerName =
        winner === battleAccount.player1.toString()
          ? battleAccount.player1Name || 'Player 1'
          : battleAccount.player2Name || 'Player 2'

      story.push(`${winnerName} is the winner of the battle!`)

      console.log('Battle Story:', story.join('\n'))
    }
  }, [battleAccount, battleActions])

  return (
    <>
      {
        <Modal
          isOpen={modals['story']}
          onClose={() => closeModal('story')}
          title={'Story'}
          maxWidth='600px'
        >
          test
        </Modal>
      }
    </>
  )
}

export default StoryModal
