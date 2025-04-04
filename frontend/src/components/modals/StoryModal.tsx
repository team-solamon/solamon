'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { createClient } from '@supabase/supabase-js'
import React, { useEffect, useState } from 'react'

import { getProgram, getWinnerFromBattleAccount } from '@/lib/helper'
import {
  BattleAccount,
  getBattleAccountPDA,
  getBattleActions,
  ParsedBattleAction,
} from '@/lib/solana-helper'

import { useModal } from '@/contexts/ModalContext'

import Modal from '../Modal'
import Typography from '../Typography'

interface StoryModalProps {
  selectedBattle: BattleAccount
}

const StoryModal: React.FC<StoryModalProps> = ({ selectedBattle }) => {
  const { modals, closeModal } = useModal()

  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const program = getProgram(connection)
  const [battleAccount, setBattleAccount] = useState<BattleAccount | null>(null)
  const [battleActions, setBattleActions] = useState<ParsedBattleAction[]>([])
  const [storyText, setStoryText] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  useEffect(() => {
    if (!selectedBattle) return

    setStoryText('')
    setImageUrl('')

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

  const callGenerateStoryFunction = async (
    battleId: string,
    battleLog: string
  ) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing')
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/generate-story`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({ battleId, battleLog }),
        }
      )

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error calling generate-story function:', error)
      throw error
    }
  }

  useEffect(() => {
    if (!publicKey) {
      return
    }

    if (battleAccount && battleActions) {
      const battleLogLines = battleActions.map((action) => {
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

      setLoading(true)

      const winner = getWinnerFromBattleAccount(battleAccount)
      const winnerName =
        winner === battleAccount.player1.toString()
          ? battleAccount.player1Name || 'Player 1'
          : battleAccount.player2Name || 'Player 2'

      battleLogLines.push(`${winnerName} is the winner of the battle!`)

      const battleLog = battleLogLines.join('\n')

      callGenerateStoryFunction(selectedBattle.battleId, battleLog)
        .then((response) => {
          setStoryText(response.story)
          setImageUrl(response.imageUrl)
        })
        .catch((error) => {
          console.error('Story generation error:', error)
          setStoryText(
            "We couldn't create your battle story at this time. Please try again later."
          )
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [battleAccount, battleActions])

  return (
    <>
      <Modal
        isOpen={modals['story']}
        onClose={() => closeModal('story')}
        title='Battle Story'
        maxWidth='800px'
        maxHeight='800px'
      >
        {loading ? (
          <div className='flex justify-center items-center p-4'>
            <div className='flex flex-col items-center'>
              <svg
                className='animate-spin h-8 w-8 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                ></path>
              </svg>
              <p className='mt-2 text-gray-600'></p>

              <Typography variant='body-2' color='inverse' outline={false}>
                {
                  [
                    'Your battle is being forged...',
                    'A clash of legends awaits...',
                    'The story writes itself...',
                    'The fight stirs in the shadows...',
                  ][Math.floor(Math.random() * 4)]
                }
              </Typography>
            </div>
          </div>
        ) : (
          <div className='p-4 space-y-4 max-h-[600px] overflow-y-auto'>
            {imageUrl && (
              <div className='w-full flex justify-center'>
                <img
                  src={imageUrl}
                  className='rounded-lg max-h-[400px] object-cover'
                />
              </div>
            )}
            <div className='whitespace-pre-line'>
              <Typography variant='body-2' color='inverse' outline={false}>
                {storyText}
              </Typography>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

export default StoryModal
