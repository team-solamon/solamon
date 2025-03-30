import React, { useEffect, useMemo } from 'react'
import Button from './Button'
import Card from './Card'
import { BattleReplay } from '@/data/replay'
import PhaserGame from './PhaserGame'
import { CardBattleScene } from '@/app/game/scenes/CardBattleScene'
import { EventBridge } from '@/app/game/utils/EventBridge'
import { CardData, stringToElement } from '@/lib/solana-helper'
import Typography from './Typography'

const cards: CardData[] = [
  { name: 'FIRE', element: { fire: {} }, attack: 5, health: 3, species: 0 },
  { name: 'FIRE', element: { fire: {} }, attack: 5, health: 3, species: 1 },
  { name: 'WATER', element: { water: {} }, attack: 3, health: 6, species: 2 },
  { name: 'EARTH', element: { earth: {} }, attack: 4, health: 5, species: 3 },
  { name: 'METAL', element: { metal: {} }, attack: 6, health: 2, species: 4 },
  { name: 'WOOD', element: { wood: {} }, attack: 4, health: 4, species: 5 },
  { name: 'WATER', element: { water: {} }, attack: 3, health: 6, species: 6 },
  { name: 'EARTH', element: { earth: {} }, attack: 4, health: 5, species: 7 },
  { name: 'METAL', element: { metal: {} }, attack: 6, health: 2, species: 8 },
  { name: 'WOOD', element: { wood: {} }, attack: 4, health: 4, species: 9 },
]

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
    { isPlayer: true, atkIdx: 0, defIdx: 0, damage: 4, attackType: 'CRITICAL' },
    { isPlayer: false, atkIdx: 0, defIdx: 0, damage: 4, attackType: 'HALVED' },
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
      <div className='text-black overflow-y-auto max-h-[60vh] pr-2'>
        {phaserGame}
        <div className='mt-4 space-y-8'>
          <div className='text-center'>
            <Typography variant='body-2' className='font-bold text-lg'>
              🕹️ How to Battle
            </Typography>
          </div>
          <ol className='list-decimal list-inside space-y-6 text-base'>
            <li>
              <strong>🔹 Cards make the battle.</strong>
              <ul className='list-disc list-inside ml-6 space-y-2'>
                <li>ATK / HP → visible to both players</li>
                <li>
                  Element (Water, Fire, Wood, Metal, Earth) → only you know the
                  exact stat; your opponent just sees the type.
                </li>
              </ul>
            </li>
            <li>
              🔹 Got 3+ cards? You're ready.
              <ul className='list-disc list-inside ml-6 space-y-2'>
                <li>
                  Tap <strong>“Open Match”</strong> to start a battle and wait
                  for challengers.
                </li>
                <li>
                  Or tap <strong>“Choose Fighter”</strong> to pick an opponent
                  from the queue and strike first.
                </li>
              </ul>
            </li>
            <li>
              🔹 Pick your squad (3 cards).
              <ul className='list-disc list-inside ml-6 space-y-2'>
                <li>Open Match: Pay 0.1 SOL → wait for a challenger.</li>
                <li>
                  Choose Fighter: Pay 0.1 SOL → battle starts instantly (extra
                  cost for first move advantage).
                </li>
              </ul>
            </li>
            <li>
              🔹 Winner gets 0.15 SOL.
              <ul className='list-disc list-inside ml-6 space-y-2'>
                <li>Fight smart. Read the elements. Outsmart your rival.</li>
              </ul>
            </li>
          </ol>
          <div className='mt-6'>
            <p className='text-sm font-medium text-black'>
              Tip! Each mode has its edge.
            </p>
            <ul className='list-disc list-inside text-sm text-black space-y-1'>
              <li>Open Match gives you the first move.</li>
              <li>
                Choose Fighter lets you see your opponent's squad before you
                fight.
              </li>
            </ul>
          </div>
        </div>
        <div className='mt-8 space-y-4'>
          <div className='text-center'>
            <Typography variant='body-2' className='font-bold text-lg'>
              🃏 Card Guide
            </Typography>
          </div>
          <div>
            <p className='text-sm text-black'>
              One random element per card. See odds before you draw.
            </p>
          </div>
        </div>
        <div className='grid grid-cols-5 gap-4 p-2'>
          {cards.map((card, index) => (
            <div
              key={index}
              className='card bg-gray-700 p-2 rounded-lg flex-shrink-0'
            >
              <Card card={card} className='mx-auto' />
            </div>
          ))}
        </div>
      </div>
      <div className='mt-4 flex justify-around sticky bottom-0 bg-[#978578] py-3'>
        <Button onClick={onNewCard}>New Card</Button>
        <Button>Open Battle</Button>
      </div>
    </div>
  )
}

export default Tutorial
