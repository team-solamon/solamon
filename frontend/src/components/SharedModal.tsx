'use client'
import { useConnection } from '@solana/wallet-adapter-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { getProgram } from '@/lib/helper'
import { ROUTES } from '@/lib/routes'
import {
  CardData,
  getUserAccount,
  showSpawnResult,
  spawnSolamonsTx,
} from '@/lib/solana-helper'

import { useBalance } from '@/contexts/BalanceContext'
import { useLoading } from '@/contexts/LoadingContext'
import { useModal } from '@/contexts/ModalContext'

import CardGuideModal from './modals/CardGuideModal'
import NewCardModal from './modals/NewCardModal'
import PurchaseCardModal from './modals/PurchaseCardModal'
import TutorialModal from './modals/TutorialModal'
import ViewAllCardsModal from './modals/ViewAllCardsModal'

const SharedModal = () => {
  const router = useRouter()

  const { showLoading, hideLoading } = useLoading()
  const { openModal, closeModal, closeModelAll } = useModal()
  const [myCards, setMyCards] = useState<CardData[]>([])
  const { fetchBalance } = useBalance()
  const [spawnResult, setSpawnResult] = useState<CardData[]>([])
  const { connection } = useConnection()
  const program = getProgram(connection)
  const { publicKey, sendTransaction } = useWallet()

  const handlePurchase = async (amount: number) => {
    try {
      if (!publicKey) {
        console.error('No player found')
        return
      }
      showLoading('Spawning solamons...')
      const tx = await spawnSolamonsTx(connection, program, publicKey, amount)
      const txSig = await sendTransaction(tx, connection)
      await connection.confirmTransaction(txSig)
      const spawnResult = await showSpawnResult(connection, txSig)
      setSpawnResult(spawnResult)
      closeModal('purchaseCard')
      openModal('newCard')
    } catch (error) {
      console.error(error)
    }
    fetchBalance()
    hideLoading()
  }

  const fetchMyCards = async () => {
    if (!publicKey) {
      console.error('No player found')
      return
    }
    const myAccount = await getUserAccount(program, publicKey)
    setMyCards(myAccount.solamons)
  }

  const handleViewAllCards = () => {
    closeModelAll()
    openModal('viewAllCards')
  }

  const handleNewCardFromModal = () => {
    closeModelAll()
    openModal('purchaseCard')
  }

  const handleOpenBattleFromModal = () => {
    closeModelAll()
    router.push(ROUTES.OPEN_BATTLE)
  }

  return (
    <div>
      <TutorialModal onNewCard={handleNewCardFromModal} />
      <CardGuideModal
        onNewCard={handleNewCardFromModal}
        onOpenBattle={handleOpenBattleFromModal}
      />

      <PurchaseCardModal onPurchase={handlePurchase} />
      <NewCardModal
        drawableCards={spawnResult}
        onViewAll={handleViewAllCards}
        onClose={fetchMyCards}
      />
      <ViewAllCardsModal
        currentCards={myCards}
        drawableCards={spawnResult}
        onClose={fetchMyCards}
        onOpenBattle={handleOpenBattleFromModal}
      />
    </div>
  )
}

export default SharedModal
