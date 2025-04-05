'use client'

import React, { useEffect, useState } from 'react'
import Modal from '../Modal'

import { useModal } from '@/contexts/ModalContext'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { getAllUserAccounts, UserAccount } from '@/lib/solana-helper'
import { getProgram } from '@/lib/helper'
import Typography from '../Typography'
import WalletAddress from '../WalletAddress'
import Balance from '../Balance'

const LeaderboardModal: React.FC = () => {
  const { modals, closeModal } = useModal()
  const { publicKey } = useWallet()
  const { connection } = useConnection()

  const program = getProgram(connection)

  const [allUserAccount, setAllUserAccount] = useState<UserAccount | null>(null)

  useEffect(() => {
    fetchAllUserAccounts()
  }, [])

  const fetchAllUserAccounts = async () => {
    if (!publicKey) {
      console.error('No player found')
      return
    }
    const allUserAccount = await getAllUserAccounts(program)

    setAllUserAccount(allUserAccount)
    console.log('allUserAccount', allUserAccount)
    console.log('publicKey', publicKey.toBase58())

    allUserAccount.sort((a, b) => {
      return b.account.points - a.account.points
    })
    setAllUserAccount(allUserAccount)
  }

  return (
    <>
      <Modal
        isOpen={modals['leaderboard']}
        onClose={() => closeModal('leaderboard')}
        title={'Leaderboard'}
        maxWidth='800px'
        maxHeight='80vh'
      >
        <div className='h-[60vh] overflow-y-auto pr-2'>
          {/* total prize */}
          <div className='flex items-center justify-center mb-4 gap-2'>
            <Typography variant='body-2' color='primary'>
              Total prize:
            </Typography>
            <Balance balance={123200} icon='zbtc' variant='body-2' />
          </div>
          {allUserAccount ? (
            <div className='space-y-4'>
              {allUserAccount.map((account: any, index: number) => (
                <div
                  key={index}
                  className='card bg-[rgba(202,193,185,1)] p-4 rounded-lg w-full'
                >
                  <div className='flex items-center mr-4'>
                    {/* ranking */}
                    <div className='flex items-center justify-center mr-10'>
                      <Typography variant='body-2' color='accent'>
                        {index + 1}
                      </Typography>
                    </div>
                    <WalletAddress publicKey={account.account.user} />
                    {publicKey &&
                      account.account.user.toString() ===
                        publicKey.toString() && (
                        <span className='bg-green-500 text-white px-2 py-1 rounded-md text-sm mr-2'>
                          You
                        </span>
                      )}
                  </div>
                  <div className='grid grid-cols-3 gap-2 mt-2 ml-12'>
                    <Typography variant='body-2' color='primary' outline={true}>
                      Points: {account.account.points}
                    </Typography>
                    <Typography variant='body-2' color='primary' outline={true}>
                      Battles: {account.account.battleCount.toString()}
                    </Typography>
                    <Typography variant='body-2' color='primary' outline={true}>
                      Solamons: {account.account.solamons.length}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-center py-8'>Loading leaderboard data...</p>
          )}
        </div>
      </Modal>
    </>
  )
}

export default LeaderboardModal
