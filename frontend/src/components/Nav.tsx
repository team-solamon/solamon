import React, { useEffect, useState } from 'react'
import Button from './Button'
import { getConnection, getKeypairFromLocalStorage } from '@/lib/helper'
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'

interface NavProps {
  onNewCard: () => void
  onOpenTutorial: () => void
}

const Nav: React.FC<NavProps> = ({ onNewCard, onOpenTutorial }) => {
  const [balance, setBalance] = useState<number | null>(null)
  const keypair = getKeypairFromLocalStorage()

  useEffect(() => {
    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    const connection = getConnection()
    if (!keypair?.publicKey) return
    const balance = await connection.getBalance(keypair.publicKey)
    setBalance(balance / LAMPORTS_PER_SOL)
  }

  return (
    <header className='header flex justify-between items-center mb-6'>
      <Button onClick={onOpenTutorial}>Tutorial</Button>
      <h1 className='text-4xl font-bold'>SOLAMON</h1>
      <div className='wallet-info text-right'>
        <span className='block text-sm text-gray-400'>
          {keypair?.publicKey.toBase58()}
        </span>
        <span className='block text-lg text-blue-400'>
          {balance ? balance : '0.00'}
        </span>
      </div>
    </header>
  )
}

export default Nav
