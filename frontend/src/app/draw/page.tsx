'use client'

import dynamic from 'next/dynamic'

const DrawGame = dynamic(() => import('./components/DrawGame'), { ssr: false })

export default function DrawPage() {
  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold text-center mb-6 text-white'>
        Card Draw Room
      </h1>
      <DrawGame />
    </div>
  )
}
