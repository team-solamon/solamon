'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useState } from 'react'
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
          <Button onClick={handleCreateAccount} disabled={isLoading}>
            {isLoading ? 'Creating...' : pk ? 'Enter' : 'Create account'}
          </Button>
          <div className='flex justify-center items-center min-h-[1.5rem]'>
            <Typography variant='body-1' color='default' outline={false}>
              {pk ? (
                <a
                  href={`${getExplorerUrl(pk.publicKey.toBase58())}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {trimAddress(pk.publicKey.toBase58())}
                </a>
              ) : (
                '\u00A0'
              )}
            </Typography>
          </div>
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
