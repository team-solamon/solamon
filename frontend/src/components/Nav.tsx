import React, { useEffect, useState } from 'react'
import { getConnection, getKeypairFromLocalStorage } from '@/lib/helper'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useModal } from '@/contexts/ModalContext'

const Nav: React.FC = () => {
  const { openModal } = useModal()

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
        onClick={() => {
          openModal('tutorial')
        }}
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
