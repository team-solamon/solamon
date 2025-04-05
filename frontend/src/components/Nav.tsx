'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

import { trimAddress } from '@/lib/helper'
import { ROUTES } from '@/lib/routes'
import { getExplorerUrl } from '@/lib/url-helper'

import { useBalance } from '@/contexts/BalanceContext'
import { useLoading } from '@/contexts/LoadingContext'
import { useModal } from '@/contexts/ModalContext'

import Balance from './Balance'
import Typography from './Typography'

const YellowButton: React.FC<{
  onClick: () => void
  children: React.ReactNode
}> = ({ onClick, children }) => {
  return (
    <div
      className='ml-4 text-[rgba(255,212,0,1)] cursor-pointer border border-[rgba(255,212,0,1)] rounded-lg w-[110px] h-[32px] flex items-center justify-center'
      onClick={onClick}
    >
      {children}
    </div>
  )
}

const Nav: React.FC = () => {
  const { openModal } = useModal()
  const router = useRouter()
  const { connected, publicKey } = useWallet()
  const { showLoading, hideLoading } = useLoading()
  const { balance, zBTCBalance, fetchBalance } = useBalance()
  const { connection } = useConnection()
  const { disconnect } = useWallet()

  const handleDisconnect = () => {
    disconnect()
  }

  // Show tutorial modal for the first time
  useEffect(() => {
    if (!localStorage.getItem('tutorialShown')) {
      openModal('tutorial')
      localStorage.setItem('tutorialShown', 'true')
    }
  }, [])

  useEffect(() => {
    console.log({ connected })
    if (!connected) {
      // alert('Please connect your wallet first')
      router.push(ROUTES.ROOT)
    }
  }, [connected])

  return (
    <header className='header flex flex-col lg:flex-row justify-between items-center mb-6 gap-4'>
      <div className='order-2 lg:order-1 flex space-x-4'>
        <YellowButton
          onClick={() => {
            openModal('tutorial')
          }}
        >
          <Typography variant='body-3'>❔ Tutorial</Typography>
        </YellowButton>
        <YellowButton
          onClick={() => {
            openModal('guide')
          }}
        >
          <Typography variant='body-3'>🃏 Card Guide</Typography>
        </YellowButton>
      </div>
      <div
        className='order-1 lg:order-2 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 cursor-pointer'
        onClick={() => {
          router.push(ROUTES.HOME)
        }}
      >
        <Typography variant='display-title-1' color='inverse'>
          SOLAMON
        </Typography>
      </div>
      <div className='wallet-info text-right flex items-end order-3 lg:order-3'>
        <div className='flex items-center mr-4'>
          <Typography variant='body-2' color='secondary'>
            <a
              href={`${getExplorerUrl(publicKey?.toBase58() || '')}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              {trimAddress(publicKey?.toBase58())}
            </a>
          </Typography>
          <img
            src='/images/img_copy.png'
            alt='Copy address'
            className='ml-1 cursor-pointer'
            onClick={() => {
              if (publicKey) {
                navigator.clipboard.writeText(publicKey.toBase58())
                alert('Wallet address copied to clipboard!')
              }
            }}
          />
        </div>
        <div className='flex items-center space-x-2'>
          <Balance balance={balance || 0} icon='sol' />
          <Balance balance={zBTCBalance || 0} icon='zbtc' />
        </div>
        <YellowButton onClick={handleDisconnect}>
          <Typography variant='body-3'>disconnect</Typography>
        </YellowButton>
      </div>
    </header>
  )
}

export default Nav
