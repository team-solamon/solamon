'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'

export default function HomePage() {
  const router = useRouter()

  const handleCreateAccount = () => {
    router.push('/create-account')
  }

  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-black'>
      <h1 className='text-4xl font-bold text-white mb-8'>SOLAMON</h1>
      <div className='relative'>
        <img
          src='/images/intro.png'
          alt='Intro'
          className='w-full max-w-2xl rounded-lg'
        />
        <button
          onClick={handleCreateAccount}
          className='absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black font-bold py-2 px-6 rounded-lg border-2 border-gray-800 hover:bg-yellow-600'
        >
          Create account
        </button>
      </div>
    </main>
  )
}
