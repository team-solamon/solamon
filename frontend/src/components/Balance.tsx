import React from 'react'
import Typography, {
  TypographyColor,
  TypographyProps,
  TypographyVariant,
} from './Typography'

interface BalanceProps {
  balance?: number | string
  className?: string
  icon?: 'sol' | 'zbtc'
  variant?: TypographyVariant
  color?: TypographyColor
}

const ICON_PATHS = {
  sol: '/icon/ic_solana_fixedColor_fill.svg',
  zbtc: '/icon/zbtc.png',
}

const CURRENCY_SUFFIXES = {
  sol: '',
  zbtc: 'sats',
}

const Balance: React.FC<BalanceProps> = ({
  balance = '0',
  className = '',
  icon = 'sol',
  variant = 'body-2',
  color = 'accent',
}) => {
  const iconSrc = ICON_PATHS[icon]
  const suffix = CURRENCY_SUFFIXES[icon]

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <img src={iconSrc} alt={icon} className='w-4 h-4' />
      <Typography variant={variant} color={color}>
        {balance ? parseFloat(balance.toString().slice(0, 6)).toString() : '0'}
        {suffix ? ` ${suffix}` : ''}
      </Typography>
    </div>
  )
}

export default Balance
