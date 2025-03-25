import React from 'react'
import Button from '../../components/Button'

const HomePage = () => {
  return (
    <div className='home-page bg-black text-white min-h-screen p-4'>
      <header className='header flex justify-between items-center mb-6'>
        <h1 className='text-4xl font-bold'>SOLAMON</h1>
        <div className='wallet-info text-right'>
          <span className='block text-sm text-gray-400'>0x637b...1c8a</span>
          <span className='block text-lg text-blue-400'>3.6416</span>
        </div>
      </header>

      <div className='action-buttons flex justify-center gap-4 mb-8'>
        <Button>
          + New Card <span className='text-blue-400'>0.1</span>
        </Button>
        <Button>Open Match</Button>
        <Button>Choose Fighter</Button>
      </div>

      <section className='battle-section mb-8'>
        <div className='bg-[#978578] p-4 rounded-lg'>
          <h2 className='text-2xl font-semibold text-yellow-400 mb-4'>
            Battle
          </h2>
          <div className='battle-cards flex gap-4'>
            <div className='card bg-gray-700 p-4 rounded-lg'>
              <div className='w-32 h-40 bg-gray-500 rounded-lg mb-2'></div>
              <Button>배틀 결과 보기</Button>
            </div>
          </div>
        </div>
      </section>

      <section className='my-card-section'>
        <div className='bg-[#978578] p-4 rounded-lg'>
          <h2 className='text-2xl font-semibold text-yellow-400 mb-4'>
            My Card | 10
          </h2>
          <div className='card-stats flex gap-4 text-lg mb-4'>
            <span>🔥 2</span>
            <span>💧 8</span>
            <span>🌱 2</span>
            <span>⚒️ 1</span>
          </div>
          <div className='card-list grid grid-cols-4 gap-4'>
            <div className='card bg-gray-700 p-4 rounded-lg'>
              <div className='w-32 h-40 bg-gray-500 rounded-lg mb-2'></div>
              <Button>Stats</Button>
            </div>
            <div className='card bg-gray-700 p-4 rounded-lg'>
              <div className='w-32 h-40 bg-gray-500 rounded-lg mb-2'></div>
              <Button>Stats</Button>
            </div>
            <div className='card bg-gray-700 p-4 rounded-lg'>
              <div className='w-32 h-40 bg-gray-500 rounded-lg mb-2'></div>
              <Button>Stats</Button>
            </div>
            <div className='card bg-gray-700 p-4 rounded-lg'>
              <div className='w-32 h-40 bg-gray-500 rounded-lg mb-2'></div>
              <Button>Stats</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
