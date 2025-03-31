'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CardStack from '@/components/CardStack'
import Nav from '@/components/Nav'
import Button from '../../components/Button'
import { ModalProvider, useModal } from '@/contexts/ModalContext'
import { ROUTES } from '@/lib/routes'

import TutorialModal from '@/components/modals/TutorialModal'
import PurchaseCardModal from '@/components/modals/PurchaseCardModal'
import NewCardModal from '@/components/modals/NewCardModal'
import ViewAllCardsModal from '@/components/modals/ViewAllCardsModal'
import CardDetailsModal from '@/components/modals/CardDetailsModal'
import ResultModal from '@/components/modals/ResultModal'
import {
  CardData,
  elementToString,
  getBattleAccountsByUser,
  getUserAccount,
  showSpawnResult,
  spawnSolamonsTx,
  BattleAccount,
  battleStatusToString,
  cancelBattleAndUnwrapSolTx,
  getConfigAccount,
} from '@/lib/solana-helper'
import {
  getConnection,
  getKeypairFromLocalStorage,
  getProgram,
} from '@/lib/helper'
import { useLoading } from '@/contexts/LoadingContext'
import Typography from '@/components/Typography'
import CardList from '@/components/CardList'
import { sendAndConfirmTransaction } from '@solana/web3.js'
import SolanaBalance from '@/components/SolanaBalance'

const HomePageContent = () => {
  const router = useRouter()

  const { openModal, closeModal } = useModal()
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)
  const [selectedBattle, setSelectedBattle] = useState<BattleAccount | null>(
    null
  )
  const [spawnResult, setSpawnResult] = useState<CardData[]>([])
  const [myCards, setMyCards] = useState<CardData[]>([])
  const [myBattles, setMyBattles] = useState<BattleAccount[]>([])
  const { showLoading, hideLoading } = useLoading()
  const connection = getConnection()
  const program = getProgram()
  const player = getKeypairFromLocalStorage()

  useEffect(() => {
    fetchMyCards()
    fetchMyBattles()
  }, [])

  const fetchMyCards = async () => {
    if (!player) {
      console.error('No player found')
      return
    }
    const myAccount = await getUserAccount(program, player.publicKey)
    setMyCards(myAccount.solamons)
  }

  const fetchMyBattles = async () => {
    if (!player) {
      console.error('No player found')
      return
    }
    const myBattles = await getBattleAccountsByUser(program, player.publicKey)
    setMyBattles([
      ...myBattles.player1BattleAccounts,
      ...myBattles.player2BattleAccounts,
    ])
  }

  const handleNewCardFromTutorial = () => {
    closeModal('tutorial')
    openModal('purchaseCard')
  }

  const handleOpenBattleFromTutorial = () => {
    closeModal('tutorial')
    router.push(ROUTES.OPEN_BATTLE)
  }

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

  const handleCancelBattle = async (battleId: number) => {
    const config = await getConfigAccount(program)

    if (!player) {
      console.error('No player found')
      return
    }
    showLoading('Cancelling battle...')
    const tx = await cancelBattleAndUnwrapSolTx(
      connection,
      program,
      player.publicKey,
      battleId
    )
    try {
      await sendAndConfirmTransaction(getConnection(), tx, [player])
    } catch (error) {
      console.error(error)
    }

    fetchMyBattles()
    hideLoading()
  }

  const handleViewAllCards = () => {
    closeModal('newCard')
    openModal('viewAllCards')
  }

  return (
    <div className='home-page bg-black text-white min-h-screen p-4'>
      <Nav />
      <div className='action-buttons flex flex-col items-center sm:flex-row justify-center gap-4 mb-16'>
        <Button onClick={() => openModal('purchaseCard')}>
          <div className='flex items-center gap-1'>
            + New Card
            <SolanaBalance balance={0.1} />
          </div>
        </Button>
        <Button
          onClick={() => router.push(ROUTES.OPEN_BATTLE)}
          disabled={myCards.length < 3}
        >
          Open Battle
        </Button>
        <Button onClick={() => router.push(ROUTES.CHOOSE_FIGHTER)}>
          Choose Fighter
        </Button>
      </div>

      <section className='battle-section mb-8 max-w-[1000px] mx-auto'>
        <div className='bg-[#978578] p-4 rounded-lg'>
          <Typography variant='title-2'>Battle</Typography>
          <div className='battle-cards grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {myBattles.map(({ account: battleAccount }, index) => {
              return (
                <div
                  key={index}
                  className='card bg-[rgba(202,193,185,1)] p-4 rounded-lg max-w-[250px] w-full'
                >
                  <div className='flex justify-around'>
                    <div>
                      <h4 className='text-center text-sm text-gray-400 mb-2'>
                        My Cards
                      </h4>
                      <CardStack
                        cards={
                          player?.publicKey == battleAccount.player1.toBase58()
                            ? battleAccount.player1Solamons
                            : battleAccount.player2Solamons
                        }
                        className='mx-auto'
                      />
                    </div>
                  </div>

                  {battleStatusToString(battleAccount.battleStatus) ===
                  'pending' ? (
                    <>
                      <div className='flex justify-center'>
                        <Typography
                          variant='body-2'
                          outline={false}
                          className='rounded-xl bg-[rgba(151,133,120,1)] w-full text-center mb-1 h-[30px]'
                        >
                          Pending
                        </Typography>
                      </div>
                      <div
                        onClick={() =>
                          handleCancelBattle(battleAccount.battleId)
                        }
                      >
                        <Typography
                          variant='body-3'
                          color='default'
                          outline={false}
                          className='cursor-pointer w-full text-center mb-1'
                        >
                          Cancel
                        </Typography>
                      </div>
                    </>
                  ) : battleStatusToString(battleAccount.battleStatus) ===
                    'canceled' ? (
                    <div className='flex justify-center'>
                      <Typography
                        variant='body-3'
                        color='default'
                        outline={false}
                        className='w-full text-center mb-1'
                      >
                        Canceled
                      </Typography>
                    </div>
                  ) : (
                    <div className='flex justify-center'>
                      <Button
                        size='S'
                        onClick={() => {
                          setSelectedBattle(battleAccount)
                          openModal('result')
                        }}
                      >
                        Result
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className='my-card-section max-w-[1000px] mx-auto'>
        <div className='bg-[#978578] p-4 rounded-lg'>
          <CardList cards={myCards} />
        </div>
      </section>

      {/* Modals */}
      <TutorialModal
        onNewCard={handleNewCardFromTutorial}
        onOpenBattle={handleOpenBattleFromTutorial}
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
      />
      <CardDetailsModal selectedCard={selectedCard} />
      <ResultModal selectedBattle={selectedBattle} onClaim={fetchMyBattles} />
    </div>
  )
}

const HomePage = () => {
  return (
    <ModalProvider>
      <HomePageContent />
    </ModalProvider>
  )
}

export default HomePage
