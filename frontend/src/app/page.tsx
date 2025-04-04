'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useState, useEffect } from 'react'
import { useLoading } from '@/contexts/LoadingContext'

import {
  setKeypairToLocalStorage,
  getKeypairFromLocalStorage,
  getConnection,
  trimAddress,
} from '@/lib/helper'

import Button from '@/components/Button'
import { ROUTES } from '@/lib/routes'
import Typography from '@/components/Typography'
import { getExplorerUrl } from '@/lib/url-helper'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'

export default function HomePage() {
  const { publicKey, sendTransaction } = useWallet()

  console.log({ publicKey })

  useEffect(() => {
    if (publicKey) {
      router.push(ROUTES.HOME)
    }
    console.log({ publicKey })
  }, [publicKey])

  const router = useRouter()
  const { showLoading, hideLoading } = useLoading()

  const [isLoading, setIsLoading] = useState(false)

  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-black'>
      <h1 className='text-4xl font-bold text-white mb-8'>SOLAMON</h1>
      <div className='relative'>
        <img
          src='/images/intro.png'
          alt='Intro'
          className='w-full max-w-2xl rounded-lg'
        />
        <div className='absolute top-1/3 md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
          <img
            src='/images/img_ellipse.png'
            className='w-64 h-64'
            style={{
              animation: 'fadeInOut 5s infinite',
            }}
          />
          <img
            src='/images/img_intro_knife.png'
            className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16'
          />
        </div>
        <div className='absolute bottom-10 left-1/2 transform -translate-x-1/2'>
          <WalletMultiButton />
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeInOut {
          0%,
          100% {
            opacity: 1;
          }
          70% {
            opacity: 0.7;
          }
        }
      `}</style>
    </main>
  )
}
