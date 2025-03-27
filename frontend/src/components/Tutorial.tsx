import React from 'react'
import Button from './Button'
import Modal from './Modal'
import { CardData } from '@/data/card'

const cards: CardData[] = [
  { name: 'FIRE', element: 'FIRE', attack: 5, health: 3 },
  { name: 'FIRE', element: 'FIRE', attack: 5, health: 3 },
  { name: 'FIRE', element: 'FIRE', attack: 5, health: 3 },
  { name: 'WATER', element: 'WATER', attack: 3, health: 6 },
  { name: 'EARTH', element: 'EARTH', attack: 4, health: 5 },
  { name: 'METAL', element: 'METAL', attack: 6, health: 2 },
  { name: 'WOOD', element: 'WOOD', attack: 4, health: 4 },
  { name: 'WATER', element: 'WATER', attack: 3, health: 6 },
  { name: 'EARTH', element: 'EARTH', attack: 4, health: 5 },
  { name: 'METAL', element: 'METAL', attack: 6, health: 2 },
  { name: 'WOOD', element: 'WOOD', attack: 4, health: 4 },
]

const Tutorial: React.FC = () => {
  return (
    <div className='flex flex-col h-full'>
      <div className='text-white overflow-y-auto max-h-[60vh] pr-2'>
        <ol className='list-decimal list-inside space-y-4'>
          <li>
            <strong>Cards make the battle.</strong>
            <ul className='list-disc list-inside ml-4'>
              <li>ATK / HP → visible to both players</li>
              <li>
                Element (Water, Fire, Wood, Metal, Earth) → only you know the
                exact stat; your opponent just sees the type.
              </li>
            </ul>
          </li>
          <li>
            Got 3+ cards? You're ready.
            <ul className='list-disc list-inside ml-4'>
              <li>
                Tap <strong>“Open Match”</strong> to start a battle and wait for
                challengers.
              </li>
              <li>
                Or tap <strong>“Choose Fighter”</strong> to pick an opponent
                from the queue and strike first.
              </li>
            </ul>
          </li>
          <li>
            Pick your squad (3 cards).
            <ul className='list-disc list-inside ml-4'>
              <li>Open Match: Pay 0.1 SOL → wait for a challenger.</li>
              <li>
                Choose Fighter: Pay 0.1 SOL → battle starts instantly (extra
                cost for first move advantage).
              </li>
            </ul>
          </li>
          <li>
            Winner gets 0.15 SOL.
            <ul className='list-disc list-inside ml-4'>
              <li>Fight smart. Read the elements. Outsmart your rival.</li>
            </ul>
          </li>
        </ol>
        <div className='text-center mt-4'>
          <p className='text-sm text-gray-400'>Tip! Each mode has its edge.</p>
          <ul className='list-disc list-inside text-sm text-gray-400'>
            <li>Open Match gives you the first move.</li>
            <li>
              Choose Fighter lets you see your opponent's squad before you
              fight.
            </li>
          </ul>
        </div>
        <div className='text-center mt-4'>
          <p className='text-sm text-gray-400'>Tip! Each mode has its edge.</p>
          <ul className='list-disc list-inside text-sm text-gray-400'>
            <li>Open Match gives you the first move.</li>
            <li>
              Choose Fighter lets you see your opponent's squad before you
              fight.
            </li>
          </ul>
        </div>
        <div className='text-center mt-4'>
          <p className='text-sm text-gray-400'>Tip! Each mode has its edge.</p>
          <ul className='list-disc list-inside text-sm text-gray-400'>
            <li>Open Match gives you the first move.</li>
            <li>
              Choose Fighter lets you see your opponent's squad before you
              fight.
            </li>
          </ul>
        </div>
        <div className='text-center mt-4'>
          <p className='text-sm text-gray-400'>Tip! Each mode has its edge.</p>
          <ul className='list-disc list-inside text-sm text-gray-400'>
            <li>Open Match gives you the first move.</li>
            <li>
              Choose Fighter lets you see your opponent's squad before you
              fight.
            </li>
          </ul>
        </div>
      </div>
      <div className='mt-4 flex justify-around sticky bottom-0 bg-[#978578] py-3'>
        <Button>New Card</Button>
        <Button>Open Battle</Button>
      </div>
    </div>
  )
}

export default Tutorial
