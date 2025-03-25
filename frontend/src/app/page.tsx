'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'
import Button from '@/components/Button'

export default function HomePage() {
  const router = useRouter()

  const handleCreateAccount = () => {
    router.push('/home')
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
        <div className='absolute bottom-10 left-1/2 transform -translate-x-1/2'>
          <Button onClick={handleCreateAccount}>Create account</Button>
        </div>
      </div>
    </main>
  )
}
