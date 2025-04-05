import { stringToElement } from '@/lib/solana-helper'
import { PublicKey } from '@solana/web3.js'

export const isProd = process.env.NODE_ENV === 'production'
export const isLocal = process.env.NODE_ENV === 'development'

export const showLogger = isLocal
  ? true
  : process.env.NEXT_PUBLIC_SHOW_LOGGER === 'true'

export const NEW_CARD_SOL_PRICE = 0.05
export const UNSTAKING_SOL_PRICE = 0.05
export const FIGHT_SOL_PRICE = 100

export const WINNER_SOL_REWARD = 200

export const WSOL_MINT = new PublicKey(
  'So11111111111111111111111111111111111111112'
)

export const zBTC_MINT = new PublicKey(
  'zBTCug3er3tLyffELcvDNrKkCymbPWysGcWihESYfLg'
)

export const JITO_SOL_MINT = new PublicKey(
  'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'
)

export const BATLLE_STAKE = 100 // 100 zBTC(Satoshi)

interface CardWithProbabilities {
  species: number
  probabilities: { element: Element; probability: number }[]
}

export const CARD_SPECIES_PROBABILITIES: CardWithProbabilities[] = [
  {
    species: 0,
    probabilities: [
      { element: stringToElement('fire'), probability: 80 },
      { element: stringToElement('water'), probability: 10 },
      { element: stringToElement('wood'), probability: 10 },
    ],
  },
  {
    species: 1,
    probabilities: [
      { element: stringToElement('fire'), probability: 80 },
      { element: stringToElement('earth'), probability: 10 },
      { element: stringToElement('metal'), probability: 10 },
    ],
  },
  {
    species: 2,
    probabilities: [
      { element: stringToElement('water'), probability: 80 },
      { element: stringToElement('fire'), probability: 10 },
      { element: stringToElement('metal'), probability: 10 },
    ],
  },
  {
    species: 3,
    probabilities: [
      { element: stringToElement('water'), probability: 80 },
      { element: stringToElement('wood'), probability: 10 },
      { element: stringToElement('earth'), probability: 10 },
    ],
  },
  {
    species: 4,
    probabilities: [
      { element: stringToElement('wood'), probability: 80 },
      { element: stringToElement('water'), probability: 10 },
      { element: stringToElement('fire'), probability: 10 },
    ],
  },
  {
    species: 5,
    probabilities: [
      { element: stringToElement('wood'), probability: 80 },
      { element: stringToElement('earth'), probability: 10 },
      { element: stringToElement('metal'), probability: 10 },
    ],
  },
  {
    species: 6,
    probabilities: [
      { element: stringToElement('earth'), probability: 80 },
      { element: stringToElement('fire'), probability: 10 },
      { element: stringToElement('metal'), probability: 10 },
    ],
  },
  {
    species: 7,
    probabilities: [
      { element: stringToElement('earth'), probability: 80 },
      { element: stringToElement('water'), probability: 10 },
      { element: stringToElement('wood'), probability: 10 },
    ],
  },
  {
    species: 8,
    probabilities: [
      { element: stringToElement('metal'), probability: 80 },
      { element: stringToElement('fire'), probability: 10 },
      { element: stringToElement('earth'), probability: 10 },
    ],
  },
  {
    species: 9,
    probabilities: [
      { element: stringToElement('metal'), probability: 80 },
      { element: stringToElement('water'), probability: 10 },
      { element: stringToElement('wood'), probability: 10 },
    ],
  },
]
