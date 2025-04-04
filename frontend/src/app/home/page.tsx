'use client'

import { useConnection } from '@solana/wallet-adapter-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { getProgram } from '@/lib/helper'
import { ROUTES } from '@/lib/routes'
import {
  BattleAccount,
  battleStatusToString,
  burnSolamonTx,
  cancelBattleTx,
  CardData,
  getBattleAccountsByUser,
  getUserAccount,
} from '@/lib/solana-helper'

import CardList from '@/components/CardList'
import CardStack from '@/components/CardStack'
import CardDetailsModal from '@/components/modals/CardDetailsModal'
import ResultModal from '@/components/modals/ResultModal'
import StoryModal from '@/components/modals/StoryModal'
import Nav from '@/components/Nav'
import SharedModal from '@/components/SharedModal'
import Balance from '@/components/Balance'
import Typography from '@/components/Typography'

import { NEW_CARD_SOL_PRICE } from '@/constant/env'
import { useBalance } from '@/contexts/BalanceContext'
import { useLoading } from '@/contexts/LoadingContext'
import { useModal } from '@/contexts/ModalContext'

import Button from '../../components/Button'

const HomePage = () => {
  const router = useRouter()

  const { openModal, closeModal } = useModal()
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)
  const [selectedBattle, setSelectedBattle] = useState<BattleAccount | null>(
    null
  )
  const { fetchBalance } = useBalance()
  const [myCards, setMyCards] = useState<CardData[]>([])
  const [myBattles, setMyBattles] = useState<BattleAccount[]>([])
  const { showLoading, hideLoading } = useLoading()
  const { connection } = useConnection()
  const program = getProgram(connection)
  const { publicKey, sendTransaction } = useWallet()

  useEffect(() => {
    fetchMyCards()
    fetchMyBattles()
  }, [])

  const fetchMyCards = async () => {
    if (!publicKey) {
      console.error('No player found')
      return
    }
    const myAccount = await getUserAccount(program, publicKey)
    setMyCards(myAccount.solamons)
  }

  const fetchMyBattles = async () => {
    if (!publicKey) {
      console.error('No player found')
      return
    }
    const myBattles = await getBattleAccountsByUser(program, publicKey)
    setMyBattles([
      ...myBattles.player1BattleAccounts,
      ...myBattles.player2BattleAccounts,
    ])
  }

  const handleCancelBattle = async (battleId: number) => {
    if (!publicKey) {
      console.error('No player found')
      return
    }
    showLoading('Cancelling battle...')
    const tx = await cancelBattleTx(program, publicKey, battleId)
    try {
      const txHash = await sendTransaction(tx, connection)
      await connection.confirmTransaction(txHash)
    } catch (error) {
      console.error(error)
    }
    fetchBalance()
    fetchMyBattles()
    hideLoading()
  }

  const handleRedeemCard = async (card: CardData) => {
    if (!publicKey) {
      console.error('No player found')
      return
    }
    showLoading('Redeeming card...')
    const tx = await burnSolamonTx(connection, program, publicKey, card.id)
    const txHash = await sendTransaction(tx, connection)
    await connection.confirmTransaction(txHash)
    fetchBalance()
    fetchMyCards()
    hideLoading()
  }

  return (
    <div className='home-page bg-black text-white min-h-screen p-4'>
      <Nav />
      <div className='action-buttons flex flex-col items-center sm:flex-row justify-center gap-4 mb-16'>
        <Button onClick={() => openModal('purchaseCard')}>
          <div className='flex items-center gap-1'>
            + New Card
            <Balance balance={NEW_CARD_SOL_PRICE} />
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
            {myBattles.length === 0 ? (
              <div className='col-span-2 md:col-span-3 lg:col-span-4 flex flex-col justify-center items-center p-8 text-center'>
                <Typography variant='body-1' color='inverse' outline={false}>
                  No battle history yet.
                  <br />
                  Start one by opening a battle or choosing a rival from the
                  queue.
                </Typography>
                <div className='flex justify-center mt-4 gap-4'>
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
              </div>
            ) : (
              myBattles.map(({ account: battleAccount }, index) => {
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
                            publicKey == battleAccount.player1.toBase58()
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
              })
            )}
          </div>
        </div>
      </section>

      <section className='my-card-section max-w-[1000px] mx-auto'>
        <div className='bg-[#978578] p-4 rounded-lg'>
          <CardList cards={myCards} onRedeemCard={handleRedeemCard} />
        </div>
      </section>

      {/* Modals */}
      <CardDetailsModal selectedCard={selectedCard} />
      <ResultModal
        selectedBattle={selectedBattle}
        showReplay={true}
        onClaim={fetchMyBattles}
      />
      <StoryModal selectedBattle={selectedBattle} />
      <SharedModal />
    </div>
  )
}

export default HomePage
