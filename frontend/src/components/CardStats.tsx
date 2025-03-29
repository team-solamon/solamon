import React from 'react'
import Typography from './Typography'

interface CardStatsProps {
  attack: number
  health: number
}

const CardStats: React.FC<CardStatsProps> = ({ attack, health }) => {
  return (
    <div className='flex items-end gap-8 bg-[rgba(19,19,19,0.7)] p-2 rounded-2xl absolute bottom-8'>
      <Typography variant='caption-1'>{`⚔️ ${attack}`}</Typography>
      <Typography variant='caption-1'>{`♥️️ ${health}`}</Typography>
    </div>
  )
}

export default CardStats
