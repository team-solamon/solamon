import React from 'react'
import CardStack from './CardStack'
import { BattleStatus } from '@/data/battle'

interface GameResultProps {
  battleStatus: BattleStatus
  isPlayerWinner: boolean
  reward?: number
}

const GameResult: React.FC<GameResultProps> = ({
  battleStatus,
  isPlayerWinner,
  reward,
}) => {
  const { myCards, opponentCards } = battleStatus

  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='flex items-center justify-center gap-4'>
        <div
          className={`${
            isPlayerWinner ? 'scale-110' : 'scale-90 opacity-70'
          } transition-transform`}
        >
          <CardStack cards={myCards} />
        </div>
        <div
          className={`${
            !isPlayerWinner ? 'scale-110' : 'scale-90 opacity-70'
          } transition-transform`}
        >
          <CardStack cards={opponentCards || []} />
        </div>
      </div>
      <div className='mt-4 text-center'>
        <button className='text-yellow-500 underline'>
          Battle replay &gt;
        </button>
        {reward !== undefined && (
          <div className='mt-2 flex items-center justify-center gap-2'>
            <span className='text-lg font-bold'>{reward}</span>
            <span className='text-sm'>SOL</span>
            <button className='px-4 py-2 bg-yellow-500 text-white rounded'>
              Claim
            </button>
          </div>
        )}
      </div>
      <button className='mt-4 px-6 py-2 bg-gray-300 rounded'>Close</button>
    </div>
  )
}

export default GameResult
