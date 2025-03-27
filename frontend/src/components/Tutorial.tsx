import React from 'react'
import Button from './Button'

const Tutorial = () => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
      <div className='bg-[#978578] p-4 rounded-lg w-[90%] max-w-lg h-[80%] flex flex-col'>
        <div className='text-white overflow-y-auto flex-grow'>
          <div className='text-center mb-4'>
            <h2 className='text-2xl font-bold'>How to Battle</h2>
          </div>
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
            <p className='text-sm text-gray-400'>
              Tip! Each mode has its edge.
            </p>
            <ul className='list-disc list-inside text-sm text-gray-400'>
              <li>Open Match gives you the first move.</li>
              <li>
                Choose Fighter lets you see your opponent's squad before you
                fight.
              </li>
            </ul>
          </div>
          <div className='text-center mt-4'>
            <p className='text-sm text-gray-400'>
              Tip! Each mode has its edge.
            </p>
            <ul className='list-disc list-inside text-sm text-gray-400'>
              <li>Open Match gives you the first move.</li>
              <li>
                Choose Fighter lets you see your opponent's squad before you
                fight.
              </li>
            </ul>
          </div>
        </div>
        <div className='button-container bg-[#978578] p-4 flex justify-around'>
          <Button>New Card</Button>
          <Button>Open Battle</Button>
        </div>
      </div>
    </div>
  )
}

export default Tutorial
