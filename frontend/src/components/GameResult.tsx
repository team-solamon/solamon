import React from 'react'
import { useRouter } from 'next/navigation'
import CardStack from './CardStack'
import { BattleStatus } from '@/data/battle'
import Button from './Button'
import { ROUTES } from '@/lib/routes'

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
  const router = useRouter()

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
        <button
          className='text-yellow-500 underline'
          onClick={() => {
            router.push(ROUTES.GAME)
          }}
        >
          Battle replay &gt;
        </button>
        {reward !== undefined ? (
          <div className='mt-2 flex flex-col items-center justify-center gap-2'>
            <div className='flex items-center gap-2'>
              <span className='text-lg font-bold'>{reward}</span>
              <span className='text-sm'>SOL</span>
            </div>
            <Button>Claim</Button>
          </div>
        ) : (
          <div className='mt-2'>
            <Button>Close</Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameResult
