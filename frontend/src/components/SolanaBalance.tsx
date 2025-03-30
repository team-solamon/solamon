import React from 'react'
import Typography from './Typography'

interface SolanaBalanceProps {
  balance?: number | string
  className?: string
}

const SolanaBalance: React.FC<SolanaBalanceProps> = ({
  balance = '0.00',
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <img
        src='/icon/ic_solana_fixedColor_fill.svg'
        alt='sol'
        className='w-4 h-4'
      />
      <Typography variant='body-2' color='accent'>
        {balance ? balance.toString().slice(0, 6) : '0.00'}
      </Typography>
    </div>
  )
}

export default SolanaBalance
