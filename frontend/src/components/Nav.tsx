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
import { getExplorerUrl } from '@/lib/url-helper'
import { useLoading } from '@/contexts/LoadingContext'

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

  const [balance, setBalance] = useState<number | null>(null)
  const keypair = getKeypairFromLocalStorage()
  const { showLoading, hideLoading } = useLoading()

  const handleRequestAirdrop = async () => {
    if (!keypair?.publicKey) return
    const connection = getConnection()
    // Request airdrop
    try {
      showLoading('Requesting airdrop...')
      const airdropSignature = await connection.requestAirdrop(
        keypair.publicKey,
        1e9 // 1 SOL in lamports
      )
      await connection.confirmTransaction(airdropSignature)
    } catch (error) {
      alert(error)
      console.error('Airdrop failed', error)
    }
    hideLoading()
  }

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
    <header className='header flex flex-col lg:flex-row justify-between items-center mb-6 gap-4'>
      <div className='order-2 lg:order-1'>
        <YellowButton
          onClick={() => {
            openModal('tutorial')
          }}
        >
          <Typography variant='body-3'>❔ Tutorial</Typography>
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
        <Typography variant='body-2' color='secondary' className='mr-4'>
          <a
            href={`${getExplorerUrl(keypair?.publicKey.toBase58() || '')}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            {trimAddress(keypair?.publicKey.toBase58())}
          </a>
        </Typography>
        <SolanaBalance balance={balance || 0} />
        <YellowButton onClick={handleRequestAirdrop}>
          <Typography variant='body-3'>claim dev SOL</Typography>
        </YellowButton>
      </div>
    </header>
  )
}

export default Nav
