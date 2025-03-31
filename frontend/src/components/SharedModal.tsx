'use client'
import { useLoading } from '@/contexts/LoadingContext'
import NewCardModal from './modals/NewCardModal'
import PurchaseCardModal from './modals/PurchaseCardModal'
import ViewAllCardsModal from './modals/ViewAllCardsModal'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import {
  CardData,
  getUserAccount,
  showSpawnResult,
  spawnSolamonsTx,
} from '@/lib/solana-helper'
import {
  getConnection,
  getKeypairFromLocalStorage,
  getProgram,
} from '@/lib/helper'
import { useModal } from '@/contexts/ModalContext'
import TutorialModal from './modals/TutorialModal'
import CardGuideModal from './modals/CardGuideModal'
import { ROUTES } from '@/lib/routes'

const SharedModal = () => {
  const router = useRouter()

  const { showLoading, hideLoading } = useLoading()
  const { openModal, closeModal, closeModelAll } = useModal()
  const [myCards, setMyCards] = useState<CardData[]>([])

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
