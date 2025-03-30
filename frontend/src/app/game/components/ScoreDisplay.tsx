import React from 'react'
import Typography from '@/components/Typography'

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
      <div className='flex justify-between items-center mt-2'>
        <div className='player-score p-3 bg-[rgba(202,193,185,1)] rounded-lg'>
          <div className='text-sm font-semibold'>PLAYER</div>
          <div className='flex items-center mt-1'>
            <div className='h-2 w-2 bg-green-600 mr-2 rounded-full'></div>
            <span className='text-lg font-medium'>HP: {playerScore}</span>
          </div>
        </div>

        <div className='versus px-4 py-2 bg-[rgba(202,193,185,1)] text-gray-800 font-bold rounded-lg'>
          VS
        </div>

        <div className='opponent-score p-3 bg-[rgba(202,193,185,1)] rounded-lg'>
          <div className='text-sm font-semibold'>ENEMY</div>
          <div className='flex items-center mt-1'>
            <div className='h-2 w-2 bg-red-600 mr-2 rounded-full'></div>
            <span className='text-lg font-medium'>HP: {opponentScore}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScoreDisplay
