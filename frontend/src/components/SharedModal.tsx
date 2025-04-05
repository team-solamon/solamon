'use client'
import { useConnection } from '@solana/wallet-adapter-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import {
  deserializeInstruction,
  getAddressLookupTableAccounts,
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
import { JITO_SOL_MINT, NEW_CARD_SOL_PRICE, WSOL_MINT } from '@/constant/env'
import axios from 'axios'
import {
  AddressLookupTableAccount,
  LAMPORTS_PER_SOL,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'

interface SharedModalProps {
  onPurchase?: () => void
  onCloseNewCard?: () => void
  onCloseViewAllCards?: () => void
}

const SharedModal: React.FC<SharedModalProps> = ({
  onPurchase,
  onCloseNewCard,
  onCloseViewAllCards,
}) => {
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

      const response = await axios.get(
        `https://api.jup.ag/swap/v1/quote?inputMint=${WSOL_MINT.toBase58()}&outputMint=${JITO_SOL_MINT.toBase58()}&amount=${
          NEW_CARD_SOL_PRICE * LAMPORTS_PER_SOL * amount
        }&swapMode=ExactIn&maxAccounts=50`
      )

      const jitoSolPerCard = new BN(response.data.otherAmountThreshold).div(
        new BN(amount)
      )

      const { data: instructions } = await axios.post(
        'https://api.jup.ag/swap/v1/swap-instructions',
        JSON.stringify({
          quoteResponse: response.data,
          userPublicKey: publicKey.toString(),
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const {
        tokenLedgerInstruction, // If you are using `useTokenLedger = true`.
        computeBudgetInstructions, // The necessary instructions to setup the compute budget.
        setupInstructions, // Setup missing ATA for the users.
        swapInstruction: swapInstructionPayload, // The actual swap instruction.
        cleanupInstruction, // Unwrap the SOL if `wrapAndUnwrapSol = true`.
        addressLookupTableAddresses, // The lookup table addresses that you can use if you are using versioned transaction.
      } = instructions

      const addressLookupTableAccounts: AddressLookupTableAccount[] = []

      addressLookupTableAccounts.push(
        ...(await getAddressLookupTableAccounts(
          connection,
          addressLookupTableAddresses
        ))
      )
      const blockhash = (await connection.getLatestBlockhash()).blockhash

      const tx = await spawnSolamonsTx(
        program,
        publicKey,
        amount,
        jitoSolPerCard
      )

      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions: [
          ...setupInstructions.map(deserializeInstruction),
          deserializeInstruction(swapInstructionPayload),
          ...tx.instructions,
        ],
      }).compileToV0Message(addressLookupTableAccounts)

      const transaction = new VersionedTransaction(messageV0)
      const txSig = await sendTransaction(transaction, connection)

      await connection.confirmTransaction(txSig)

      const spawnResult = await showSpawnResult(connection, txSig)
      setSpawnResult(spawnResult)
      closeModal('purchaseCard')
      openModal('newCard')
      if (onPurchase) {
        onPurchase()
      }
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
    if (onPurchase) {
      onPurchase()
    }
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
        onClose={() => {
          fetchMyCards()
          if (onCloseNewCard) {
            onCloseNewCard()
          }
        }}
      />
      <ViewAllCardsModal
        currentCards={myCards}
        drawableCards={spawnResult}
        onClose={() => {
          fetchMyCards()
          if (onCloseViewAllCards) {
            onCloseViewAllCards()
          }
        }}
        onOpenBattle={handleOpenBattleFromModal}
      />
    </div>
  )
}

export default SharedModal
