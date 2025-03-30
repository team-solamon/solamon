'use client'

import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { CardData, stringToElement } from '@/lib/solana-helper'
import { useRouter } from 'next/navigation'

const DrawGame = dynamic(() => import('@/app/draw/components/DrawGame'), {
  ssr: false,
})

const drawableCards: CardData[] = [
  {
    id: 1,
    species: 1,
    element: stringToElement('fire'),
    attack: 20,
    health: 20,
    isAvailable: true,
  },
  {
    id: 2,
    species: 2,
    element: stringToElement('water'),
    attack: 30,
    health: 10,
    isAvailable: true,
  },
  {
    id: 3,
    species: 3,
    element: stringToElement('earth'),
    attack: 10,
    health: 30,
    isAvailable: true,
  },
]

const DrawPage: React.FC = () => {
  const router = useRouter()

  useEffect(() => {
    const env = process.env.NEXT_PUBLIC_ENV

    if (!env || env !== 'dev') {
      router.push('/')
    }
  }, [router])

  return <DrawGame drawableCards={drawableCards} />
}

export default DrawPage
