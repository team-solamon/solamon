import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import React from 'react'

import { getProgram } from '@/lib/helper'
import { getWinnerFromBattleAccount } from '@/lib/helper'
import { ROUTES } from '@/lib/routes'
import { BattleAccount, claimBattleTx } from '@/lib/solana-helper'

import { useBalance } from '@/contexts/BalanceContext'
import { useLoading } from '@/contexts/LoadingContext'
import { useModal } from '@/contexts/ModalContext'

import Button from './Button'
import CardStack from './CardStack'
import Typography from './Typography'

interface GameResultProps {
  battleAccount: BattleAccount
  showReplay: boolean
  onClaim: () => void
  onClose: () => void
}

const GameResult: React.FC<GameResultProps> = ({
  battleAccount,
  showReplay,
  onClaim,
  onClose,
}) => {
  const { openModal } = useModal()
  const router = useRouter()
  const { publicKey, sendTransaction } = useWallet()
  const winner = getWinnerFromBattleAccount(battleAccount)
  const isPlayerWinner = winner === publicKey?.toBase58()
  const claimable =
    isPlayerWinner && battleAccount.claimTimestamp.toNumber() == 0
  const { showLoading, hideLoading } = useLoading()
  const { fetchBalance } = useBalance()
  const { connection } = useConnection()
  const program = getProgram(connection)

  const handleClaim = async () => {
    if (!publicKey) return

    showLoading('Claiming reward...')
    try {
      const tx = await claimBattleTx(program, publicKey, battleAccount.battleId)

      const txHash = await sendTransaction(tx, connection)
      await connection.confirmTransaction(txHash)
    } catch (error) {
      alert('Claim error: ' + error)
    }
    hideLoading()
    fetchBalance()
    onClaim()
    onClose()
  }

  if (!battleAccount) return null

  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='flex items-center justify-center gap-4'>
        <div
          className={`${
            isPlayerWinner ? 'scale-110' : 'scale-90 opacity-70'
          } transition-transform`}
        >
          <CardStack cards={battleAccount.player1Solamons} />
        </div>
        <div
          className={`${
            !isPlayerWinner ? 'scale-110' : 'scale-90 opacity-70'
          } transition-transform`}
        >
          <CardStack cards={battleAccount.player2Solamons} />
        </div>
      </div>
      <div className='mt-4 flex flex-col items-center'>
        <div className='flex gap-2'>
          {showReplay && (
            <Button
              size='S'
              onClick={() => {
                onClose()
                router.push(`${ROUTES.GAME}?battleId=${battleAccount.battleId}`)
              }}
            >
              {'replay >'}
            </Button>
          )}
          <Button
            size='S'
            onClick={() => {
              onClose()
              openModal('story')
            }}
          >
            {'story >'}
          </Button>
        </div>

        {claimable ? (
          <div className='mt-2 flex flex-col items-center justify-center gap-2'>
            <Button onClick={handleClaim}>Claim Reward 0.2 SOL</Button>
          </div>
        ) : isPlayerWinner ? (
          <div className='mt-2'>
            <Typography variant='body-3' color='default' outline={false}>
              You claimed at{' '}
              {new Date(
                battleAccount.claimTimestamp.toNumber() * 1000
              ).toLocaleString()}
            </Typography>
          </div>
        ) : (
          <div className='mt-2'>
            <Button
              onClick={() => {
                onClose()
              }}
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameResult
