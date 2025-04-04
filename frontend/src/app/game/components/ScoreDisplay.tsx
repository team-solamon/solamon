import React from 'react'

import Typography from '@/components/Typography'

const ScoreCard = ({
  label,
  score,
  isEnemy = false,
}: {
  label: string
  score: number
  isEnemy?: boolean
}) => {
  return (
    <div className='p-3 bg-[rgba(202,193,185,1)] rounded-lg max-[475px]:w-full'>
      <div className='text-sm font-semibold'>{label}</div>
      <div className='flex items-center mt-1'>
        <div
          className={`h-2 w-2 ${
            isEnemy ? 'bg-red-600' : 'bg-green-600'
          } mr-2 rounded-full`}
        ></div>
        <span className='text-lg font-medium'>HP: {score}</span>
      </div>
    </div>
  )
}

const ScoreDisplay = ({
  playerScore,
  opponentScore,
}: {
  playerScore: number
  opponentScore: number
}) => {
  return (
    <div className='score-display my-4 p-4 bg-[#978578] rounded-lg'>
      <Typography variant='title-2'>Battle Score</Typography>
      <div className='flex flex-row max-[475px]:flex-col justify-between items-center gap-3 mt-2'>
        <ScoreCard label='PLAYER' score={playerScore} />

        <div className='versus px-4 py-2 bg-[rgba(202,193,185,1)] text-gray-800 font-bold rounded-lg'>
          VS
        </div>

        <ScoreCard label='ENEMY' score={opponentScore} isEnemy={true} />
      </div>
    </div>
  )
}

export default ScoreDisplay
