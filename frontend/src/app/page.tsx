'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useState } from 'react'
import '@/lib/env'

export default function HomePage() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const router = useRouter()

  const handleSelect = (index: number, path: string) => {
    setSelectedOption(index)
    // Navigate directly to the selected page
    router.push(path)
  }

  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-gray-100'>
      <div
        className='game-container p-6 bg-white border-4 border-gray-800 rounded-none text-gray-800 w-full max-w-md mx-auto relative'
        style={{
          boxShadow: '0 0 0 4px #d0d0d0, 0 6px 0 4px #888888',
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        <h1 className='text-xl font-bold mb-6 text-center text-white bg-blue-700 py-2 px-4 border-2 border-gray-800'>
          CARD GAME
        </h1>

        <div className='menu-options space-y-4'>
          <MenuOption
            number={1}
            text='DRAW CARDS'
            isSelected={selectedOption === 1}
            onClick={() => handleSelect(1, '/draw')}
          />
          <MenuOption
            number={2}
            text='BATTLE'
            isSelected={selectedOption === 2}
            onClick={() => handleSelect(2, '/game')}
          />
          <MenuOption
            number={3}
            text='VIEW MY CARDS'
            isSelected={selectedOption === 3}
            onClick={() => handleSelect(3, '/cards')}
          />
        </div>

        <div className='pixel-scanline absolute top-0 left-0 w-full h-full pointer-events-none'></div>
      </div>

      <style jsx>{`
        .pixel-scanline::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.03),
            rgba(0, 0, 0, 0.03) 1px,
            transparent 1px,
            transparent 2px
          );
          pointer-events: none;
          z-index: 10;
        }
      `}</style>
    </main>
  )
}

type MenuOptionProps = {
  number: number
  text: string
  isSelected: boolean
  onClick: () => void
}

const MenuOption = ({ number, text, isSelected, onClick }: MenuOptionProps) => {
  return (
    <div
      className={`menu-option p-3 border-2 border-gray-800 cursor-pointer transition-all flex items-center ${
        isSelected
          ? 'bg-blue-100 border-blue-700'
          : 'bg-gray-100 hover:bg-gray-200'
      }`}
      onClick={onClick}
    >
      <div
        className={`w-8 h-8 flex items-center justify-center mr-4 ${
          isSelected ? 'bg-blue-700 text-white' : 'bg-gray-700 text-white'
        }`}
      >
        {number}
      </div>
      <span className='text-sm'>{text}</span>
      <span
        className={`ml-auto ${isSelected ? 'text-green-600' : 'text-gray-400'}`}
      >
        ▶
      </span>
    </div>
  )
}
