'use client'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import {
  getConnection,
  getKeypairFromLocalStorage,
  getProgram,
} from '@/lib/helper'
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
  const connection = getConnection()
  const program = getProgram()
  const player = getKeypairFromLocalStorage()

  const handlePurchase = async (amount: number) => {
    if (!player) {
      console.error('No player found')
      return
    }
    showLoading('Spawning solamons...')
    const tx = await spawnSolamonsTx(
      connection,
      program,
      player.publicKey,
      amount
    )
    const txSig = await connection.sendTransaction(tx, [player])
    await connection.confirmTransaction(txSig)
    const spawnResult = await showSpawnResult(connection, txSig)
    setSpawnResult(spawnResult)
    hideLoading()
    fetchBalance()
    closeModal('purchaseCard')
    openModal('newCard')
  }

  const fetchMyCards = async () => {
    if (!player) {
      console.error('No player found')
      return
    }
    const myAccount = await getUserAccount(program, player.publicKey)
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
