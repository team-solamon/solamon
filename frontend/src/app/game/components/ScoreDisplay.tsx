import React from 'react'

const ScoreDisplay = ({
  playerScore,
  opponentScore,
}: {
  playerScore: number
  opponentScore: number
}) => {
  return (
    <div
      className='score-display my-4 p-3 bg-white border-4 border-gray-800 rounded-none relative'
      style={{
        boxShadow: '0 0 0 4px #d0d0d0, 0 6px 0 4px #888888',
        fontFamily: '"Press Start 2P", monospace',
      }}
    >
      <div className='flex justify-between items-center'>
        <div className='player-score p-2 bg-blue-100 border-2 border-gray-800 rounded-sm'>
          <div className='text-sm text-blue-700'>PLAYER</div>
          <div className='flex items-center mt-1'>
            <div className='h-2 w-2 bg-green-600 mr-2'></div>
            <span className='text-lg text-gray-800'>HP: {playerScore}</span>
          </div>
        </div>

        <div className='versus px-4 py-2 bg-white text-blue-700 font-bold rounded-full border-2 border-gray-800'>
          VS
        </div>

        <div className='opponent-score p-2 bg-gray-100 border-2 border-gray-800 rounded-sm'>
          <div className='text-sm text-gray-700'>ENEMY</div>
          <div className='flex items-center mt-1'>
            <div className='h-2 w-2 bg-red-600 mr-2'></div>
            <span className='text-lg text-gray-800'>HP: {opponentScore}</span>
          </div>
        </div>
      </div>

      <div className='pixel-scanline absolute top-0 left-0 w-full h-full pointer-events-none'></div>

      <style jsx>{`
        .pixel-scanline::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.03),
            rgba(0, 0, 0, 0.03) 1px,
            transparent 1px,
            transparent 2px
          );
          pointer-events: none;
          z-index: 10;
        }
      `}</style>
    </div>
  )
}

export default ScoreDisplay
