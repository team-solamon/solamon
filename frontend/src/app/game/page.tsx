'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

import { ROUTES } from '@/lib/routes'

// Dynamically import the Game component with SSR disabled
const Game = dynamic(() => import('./components/Game'), { ssr: false })

export default function GamePage() {
  const router = useRouter()
  return (
    <div className='container mx-auto py-8'>
      <button
        className='text-yellow-400 text-2xl mb-4'
        onClick={() => router.push(ROUTES.HOME)}
      >
        &lt;
      </button>
      <h1 className='text-2xl font-semibold text-yellow-400 mb-4 text-center'>
        Battle Arena
      </h1>
      <Game />
    </div>
  )
}
