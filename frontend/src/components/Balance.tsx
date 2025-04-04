import React from 'react'
import Typography from './Typography'

interface BalanceProps {
  balance?: number | string
  className?: string
  icon?: 'sol' | 'zbtc'
}

const Balance: React.FC<BalanceProps> = ({
  balance = '0',
  className = '',
  icon = 'sol',
}) => {
  const iconSrc =
    icon === 'sol' ? '/icon/ic_solana_fixedColor_fill.svg' : '/icon/zbtc.png'
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <img src={iconSrc} alt={icon} className='w-4 h-4' />
      <Typography variant='body-2' color='accent'>
        {balance ? balance.toString().slice(0, 6) : '0'}
      </Typography>
    </div>
  )
}

export default Balance
