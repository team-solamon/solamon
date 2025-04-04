'use client'

import { ReactNode, useMemo } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui'
import {
  clusterApiUrl,
  Transaction,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js'
import '@solana/wallet-adapter-react-ui/styles.css'

const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  const endpoint = clusterApiUrl('devnet')
  const wallets = useMemo(() => [], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default WalletContextProvider
