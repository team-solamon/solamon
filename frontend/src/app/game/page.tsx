'use client'

import dynamic from 'next/dynamic'

// Dynamically import the Game component with SSR disabled
const Game = dynamic(() => import('./components/Game'), { ssr: false })

export default function GamePage() {
  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold text-center mb-6 text-white'>
        Card Battle Arena
      </h1>
      <Game />
    </div>
  )
}
