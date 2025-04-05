'use client'

import React from 'react'
import Typography from './Typography'
import { getExplorerUrl, trimAddress } from '@/lib/helper'

interface WalletAddressProps {
  publicKey: any
}

const WalletAddress: React.FC<WalletAddressProps> = ({ publicKey }) => {
  return (
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
  )
}

export default WalletAddress
