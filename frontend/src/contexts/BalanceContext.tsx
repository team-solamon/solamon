'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import React, { createContext, useContext, useEffect, useState } from 'react'

interface BalanceContextType {
  balance: number | null
  fetchBalance: () => Promise<void>
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined)

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [balance, setBalance] = useState<number | null>(null)
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  const fetchBalance = async () => {
    if (!publicKey) return
    const balanceInLamports = await connection.getBalance(
      publicKey || new PublicKey('')
    )
    setBalance(balanceInLamports / LAMPORTS_PER_SOL)
  }

  useEffect(() => {
    if (publicKey) {
      fetchBalance()
    }
  }, [publicKey])

  return (
    <BalanceContext.Provider value={{ balance, fetchBalance }}>
      {children}
    </BalanceContext.Provider>
  )
}

export const useBalance = (): BalanceContextType => {
  const context = useContext(BalanceContext)
  if (context === undefined) {
    throw new Error('useBalance must be used within a BalanceProvider')
  }
  return context
}
