export const isProd = process.env.NODE_ENV === 'production'
export const isLocal = process.env.NODE_ENV === 'development'

export const showLogger = isLocal
  ? true
  : process.env.NEXT_PUBLIC_SHOW_LOGGER === 'true'

export const NEW_CARD_SOL_PRICE = 0.1
export const FIGHT_SOL_PRICE = 0.1

export const WINNER_SOL_REWARD = 0.2
