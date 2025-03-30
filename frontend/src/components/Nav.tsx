import React, { useEffect, useState } from 'react'
import {
  getConnection,
  getKeypairFromLocalStorage,
  trimAddress,
} from '@/lib/helper'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useModal } from '@/contexts/ModalContext'
import Typography from './Typography'
import SolanaBalance from './SolanaBalance'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

const Nav: React.FC = () => {
  const { openModal } = useModal()
  const router = useRouter()

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
      <div
        className='absolute left-1/2 transform -translate-x-1/2 cursor-pointer'
        onClick={() => {
          router.push(ROUTES.HOME)
        }}
      >
        <Typography variant='display-title-1' color='inverse'>
          SOLAMON
        </Typography>
      </div>
      <div className='wallet-info text-right flex items-end '>
        <Typography variant='body-2' color='secondary' className='mr-4'>
          {trimAddress(keypair?.publicKey.toBase58())}
        </Typography>
        <SolanaBalance balance={balance || 0} />
        <div
          className='ml-4 text-[rgba(255,212,0,1)] cursor-pointer border border-[rgba(255,212,0,1)] rounded-lg w-[110px] h-[32px] flex items-center justify-center'
          onClick={() => {}}
        >
          <Typography variant='body-3'>claim dev SOL</Typography>
        </div>
      </div>
    </header>
  )
}

export default Nav
