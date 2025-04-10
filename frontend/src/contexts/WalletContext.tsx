'use client'

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import { ReactNode, useMemo } from 'react'

import '@solana/wallet-adapter-react-ui/styles.css'

const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  const endpoint =
    'https://newest-practical-snowflake.solana-mainnet.quiknode.pro/b03f0eacffc5f1860d23a09201ab2003fb94df1b/'
  const wallets = useMemo(() => [], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default WalletContextProvider
