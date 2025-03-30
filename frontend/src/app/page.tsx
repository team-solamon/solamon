'use client'

import { clusterApiUrl, Connection, Keypair } from '@solana/web3.js'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useState } from 'react'
import { useLoading } from '@/contexts/LoadingContext'

import {
  getFromLocalStorage,
  setKeypairToLocalStorage,
  getKeypairFromLocalStorage,
  getConnection,
} from '@/lib/helper'

import Button from '@/components/Button'
import { ROUTES } from '@/lib/routes'

export default function HomePage() {
  const router = useRouter()
  const { showLoading, hideLoading } = useLoading()

  const [isLoading, setIsLoading] = useState(false)
  const pk = getKeypairFromLocalStorage()
  const handleCreateAccount = async () => {
    if (!pk) {
      showLoading('Creating account...')
      // generate random account
      setKeypairToLocalStorage()

      const keypair = getKeypairFromLocalStorage()
      // Create a connection to the Solana devnet
      const connection = getConnection()

      if (!keypair) {
        console.error('Failed to create keypair')
        hideLoading()
        return
      }

      // Request airdrop
      try {
        const airdropSignature = await connection.requestAirdrop(
          keypair.publicKey,
          1e9 // 1 SOL in lamports
        )
        await connection.confirmTransaction(airdropSignature)
      } catch (error) {
        console.error('Airdrop failed', error)
      }
      hideLoading()
    }
    router.push(ROUTES.HOME)
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
          <Button onClick={handleCreateAccount} disabled={isLoading}>
            {isLoading ? 'Creating...' : pk ? 'Start' : 'Create account'}
          </Button>
        </div>
      </div>
    </main>
  )
}
