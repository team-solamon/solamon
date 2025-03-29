import React, { useEffect, useState } from 'react'
import { getConnection, getKeypairFromLocalStorage } from '@/lib/helper'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

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
      <span
        onClick={onOpenTutorial}
        className='text-solamon-green cursor-pointer font-semibold'
      >
        Tutorial
      </span>
      <h1 className='text-4xl font-bold'>SOLAMON</h1>
      <div className='wallet-info text-right'>
        <span className='block text-sm text-solamon-green'>
          {keypair?.publicKey.toBase58()}
        </span>
        <span className='block text-lg text-solamon-green'>
          {balance ? balance : '0.00'}
        </span>
      </div>
    </header>
  )
}

export default Nav
