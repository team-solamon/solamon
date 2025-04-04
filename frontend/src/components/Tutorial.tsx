import React, { useEffect, useMemo } from 'react'

import { CardData, stringToElement } from '@/lib/solana-helper'

import { BattleReplay } from '@/data/replay'

import { CardBattleScene } from '@/app/game/scenes/CardBattleScene'
import { EventBridge } from '@/app/game/utils/EventBridge'
import { FIGHT_SOL_PRICE, WINNER_SOL_REWARD } from '@/constant/env'

import Button from './Button'
import PhaserGame from './PhaserGame'
import Typography from './Typography'

const playerCardData: CardData[] = [
  {
    name: 'WATER',
    attack: 4,
    health: 10,
    element: stringToElement('water'),
    species: 0,
  },
  {
    name: 'FIRE',
    attack: 8,
    health: 6,
    element: stringToElement('fire'),
    species: 1,
  },
  {
    name: 'METAL',
    attack: 6,
    health: 12,
    element: stringToElement('metal'),
    species: 2,
  },
]

const opponentCardData: CardData[] = [
  {
    name: 'EARTH',
    attack: 4,
    health: 8,
    element: stringToElement('earth'),
    species: 3,
  },
  {
    name: 'WOOD',
    attack: 7,
    health: 7,
    element: stringToElement('wood'),
    species: 4,
  },
  {
    name: 'METAL',
    attack: 9,
    health: 9,
    element: stringToElement('metal'),
    species: 5,
  },
]

const sampleBattleReplay: BattleReplay = {
  id: 'battle-001',
  playerCards: playerCardData,
  opponentCards: opponentCardData,
  actions: [
    { isPlayer: true, atkIdx: 0, defIdx: 0, damage: 4, attackType: 'NONE' },
    { isPlayer: false, atkIdx: 0, defIdx: 0, damage: 4, attackType: 'NONE' },
    { isPlayer: true, atkIdx: 0, defIdx: 0, damage: 4, attackType: 'NONE' },
    { isPlayer: true, atkIdx: 0, defIdx: 1, damage: 4, attackType: 'NONE' },
    { isPlayer: false, atkIdx: 1, defIdx: 0, damage: 7, attackType: 'NONE' },
    { isPlayer: true, atkIdx: 1, defIdx: 1, damage: 8, attackType: 'NONE' },
    { isPlayer: true, atkIdx: 1, defIdx: 2, damage: 8, attackType: 'NONE' },
    { isPlayer: false, atkIdx: 2, defIdx: 1, damage: 9, attackType: 'NONE' },
    { isPlayer: true, atkIdx: 2, defIdx: 2, damage: 6, attackType: 'NONE' },
  ],
}

interface TutorialProps {
  onNewCard: () => void
}

const Tutorial: React.FC<TutorialProps> = ({ onNewCard }) => {
  const handleGameReady = () => {
    EventBridge.mute = true
    EventBridge.loadReplay(sampleBattleReplay)
  }

  const phaserGame = useMemo(
    () => (
      <PhaserGame scenes={[CardBattleScene]} onGameReady={handleGameReady} />
    ),
    []
  )

  useEffect(() => {
    return () => {
      EventBridge.reset()
    }
  }, [])

  return (
    <div className='flex flex-col h-full'>
      <div className='text-black overflow-y-auto max-h-[50vh] pr-2'>
        <div className='w-full h-[100%] flex flex-col justify-center items-center'>
          <div className='w-[80%] h-[80%]'>{phaserGame}</div>
        </div>
        <div className='mt-4 space-y-8'>
          <div className='text-center'>
            <Typography variant='body-2' className='font-bold text-lg'>
              🕹️ How to Battle
            </Typography>
          </div>
          <div className='space-y-6'>
            <div className='flex'>
              <div className='flex-1'>
                <Typography variant='body-2' color='inverse' outline={false}>
                  1. Cards make the battle.
                </Typography>
                <div className='ml-6 space-y-2 mt-2'>
                  <div className='flex'>
                    <Typography
                      variant='body-2'
                      color='inverse'
                      outline={false}
                    >
                      * ATK / HP → visible to both players
                    </Typography>
                  </div>
                  <div className='flex'>
                    <Typography
                      variant='body-2'
                      color='inverse'
                      outline={false}
                    >
                      * Element (💧Water, 🔥Fire, 🌳Wood, ⚙️Metal, 🌍Earth) →
                      only you know the exact element; your opponent has to
                      guess the type.
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex'>
              <div className='flex-1'>
                <Typography variant='body-2' color='inverse' outline={false}>
                  2. Got 3+ cards? You're ready.
                </Typography>
                <div className='ml-6 space-y-2 mt-2'>
                  <div className='flex'>
                    <Typography
                      variant='body-2'
                      color='inverse'
                      outline={false}
                    >
                      * Tap "Open Match" to start a battle and wait for
                      challengers.
                    </Typography>
                  </div>
                  <div className='flex'>
                    <Typography
                      variant='body-2'
                      color='inverse'
                      outline={false}
                    >
                      * Or tap "Choose Fighter" to pick an opponent from the
                      queue and strike first.
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex'>
              <div className='flex-1'>
                <Typography variant='body-2' color='inverse' outline={false}>
                  3. Pick your squad (3 cards).
                </Typography>
                <div className='ml-6 space-y-2 mt-2'>
                  <div className='flex'>
                    <Typography
                      variant='body-2'
                      color='inverse'
                      outline={false}
                    >
                      * Open Match: Pay {FIGHT_SOL_PRICE} SOL → wait for a
                      challenger.
                    </Typography>
                  </div>
                  <div className='flex'>
                    <Typography
                      variant='body-2'
                      color='inverse'
                      outline={false}
                    >
                      * Choose Fighter: Pay {FIGHT_SOL_PRICE} SOL → battle
                      starts instantly (extra cost for first move advantage).
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex'>
              <div className='flex-1'>
                <Typography variant='body-2' color='inverse' outline={false}>
                  4. Winner gets {WINNER_SOL_REWARD} SOL.
                </Typography>
                <div className='ml-6 space-y-2 mt-2'>
                  <div className='flex'>
                    <Typography
                      variant='body-2'
                      color='inverse'
                      outline={false}
                    >
                      * Fight smart. Read the elements. Outsmart your rival.
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='flex'>
            <div className='flex-1'>
              <Typography variant='body-2' color='inverse' outline={false}>
                5. Five Elements (Wu Xing) sytem
              </Typography>
              <div className='ml-6 space-y-2 mt-2'>
                <div className='flex'>
                  <Typography variant='body-2' color='inverse' outline={false}>
                    * CRITICAL: Double damage when:
                  </Typography>
                </div>
                <div className='ml-8 space-y-1'>
                  <Typography variant='body-2' color='inverse' outline={false}>
                    - 🌳Wood → 🌍Earth
                  </Typography>
                  <Typography variant='body-2' color='inverse' outline={false}>
                    - 🔥Fire → ⚙️Metal
                  </Typography>
                  <Typography variant='body-2' color='inverse' outline={false}>
                    - ⚙️Metal → 🌳Wood
                  </Typography>
                  <Typography variant='body-2' color='inverse' outline={false}>
                    - 💧Water → 🔥Fire
                  </Typography>
                  <Typography variant='body-2' color='inverse' outline={false}>
                    - 🌍Earth → 💧Water
                  </Typography>
                </div>
                <div className='flex mt-2'>
                  <Typography variant='body-2' color='inverse' outline={false}>
                    * HALVED: Half damage when:
                  </Typography>
                </div>
                <div className='ml-8 space-y-1'>
                  <Typography variant='body-2' color='inverse' outline={false}>
                    - 🌳Wood → 🔥Fire
                  </Typography>
                  <Typography variant='body-2' color='inverse' outline={false}>
                    - 🔥Fire → 🌍Earth
                  </Typography>
                  <Typography variant='body-2' color='inverse' outline={false}>
                    - 🌍Earth → ⚙️Metal
                  </Typography>
                  <Typography variant='body-2' color='inverse' outline={false}>
                    - ⚙️Metal → 💧Water
                  </Typography>
                  <Typography variant='body-2' color='inverse' outline={false}>
                    - 💧Water → 🌳Wood
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-6 bg-[#CAC1B9] rounded-md p-4'>
            <Typography
              variant='body-2'
              color='default'
              outline={false}
              className='text-sm font-medium'
            >
              Tip! Each mode has its edge.
            </Typography>
            <div className='ml-4 space-y-1 mt-1'>
              <div className='flex'>
                <Typography
                  variant='body-2'
                  color='default'
                  outline={false}
                  className='text-sm'
                >
                  * Open Match gives you the first move.
                </Typography>
              </div>
              <div className='flex'>
                <Typography
                  variant='body-2'
                  color='default'
                  outline={false}
                  className='text-sm'
                >
                  * Choose Fighter lets you see your opponent's squad before you
                  fight.
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='mt-4 flex justify-around sticky bottom-0 bg-[#978578] py-3'>
        <Button onClick={onNewCard}>New Card</Button>
      </div>
    </div>
  )
}

export default Tutorial
