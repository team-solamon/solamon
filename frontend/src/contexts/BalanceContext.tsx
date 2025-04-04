'use client'

import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import React, { createContext, useContext, useEffect,useState } from 'react'

import { getConnection, getKeypairFromLocalStorage } from '@/lib/helper'

interface BalanceContextType {
  balance: number | null
  fetchBalance: () => Promise<void>
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined)

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [balance, setBalance] = useState<number | null>(null)

  const fetchBalance = async () => {
    const connection = getConnection()
    const keypair = getKeypairFromLocalStorage()
    if (!keypair?.publicKey) return
    const balanceInLamports = await connection.getBalance(keypair.publicKey)
    setBalance(balanceInLamports / LAMPORTS_PER_SOL)
  }

  useEffect(() => {
    fetchBalance()
  }, [])

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
