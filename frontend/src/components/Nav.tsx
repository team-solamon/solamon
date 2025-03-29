import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Button from './Button'
import Modal from './Modal'
import { getConnection, getKeypairFromLocalStorage } from '@/lib/helper'
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'

const Tutorial = dynamic(() => import('./Tutorial'), { ssr: false })

const Nav: React.FC = () => {
  const [balance, setBalance] = useState<number | null>(null)
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)
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

  const openTutorial = () => setIsTutorialOpen(true)
  const closeTutorial = () => setIsTutorialOpen(false)

  return (
    <>
      <header className='header flex justify-between items-center mb-6'>
        <Button onClick={openTutorial}>Tutorial</Button>
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

      <Modal
        isOpen={isTutorialOpen}
        onClose={closeTutorial}
        title='Tutorial'
        maxWidth='600px'
      >
        <Tutorial />
      </Modal>
    </>
  )
}

export default Nav
