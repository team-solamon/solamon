import React from 'react'
import { useRouter } from 'next/navigation'
import CardStack from './CardStack'
import Button from './Button'
import { ROUTES } from '@/lib/routes'
import { BattleAccount, claimBattleAndUnwrapSolTx } from '@/lib/solana-helper'
import {
  getConnection,
  getKeypairFromLocalStorage,
  getProgram,
} from '@/lib/helper'
import { getWinnerFromBattleAccount } from '@/lib/helper'
import Typography from './Typography'
import { sendAndConfirmTransaction } from '@solana/web3.js'
import { useLoading } from '@/contexts/LoadingContext'
import { useBalance } from '@/contexts/BalanceContext'

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
  const router = useRouter()
  const player = getKeypairFromLocalStorage()
  const winner = getWinnerFromBattleAccount(battleAccount)
  const isPlayerWinner = winner === player?.publicKey?.toBase58()
  const claimable =
    isPlayerWinner && battleAccount.claimTimestamp.toNumber() == 0
  const { showLoading, hideLoading } = useLoading()
  const { fetchBalance } = useBalance()

  const handleClaim = async () => {
    if (!player) return

    showLoading('Claiming reward...')
    try {
      const tx = await claimBattleAndUnwrapSolTx(
        getConnection(),
        getProgram(),
        player.publicKey,
        battleAccount.battleId
      )
      await sendAndConfirmTransaction(getConnection(), tx, [player])
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
