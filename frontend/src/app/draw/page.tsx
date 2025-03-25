'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Modal from '../components/Modal'

const DrawGame = dynamic(() => import('./components/DrawGame'), { ssr: false })

export default function DrawPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <div className='container mx-auto py-8'>
      <div className='text-center'>
        <button
          onClick={openModal}
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        >
          Open
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title='Card Draw'>
        <DrawGame onClose={closeModal} />
      </Modal>
    </div>
  )
}
