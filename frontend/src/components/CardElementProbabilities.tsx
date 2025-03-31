import React from 'react'
import Typography from './Typography'
import { getElementEmoji } from '@/data/card'
import { Element } from '@/lib/solana-helper'

interface ElementProbability {
  element: Element
  probability: number
}

interface ElementProbabilitiesProps {
  data: ElementProbability[]
}

const CardElementProbabilities: React.FC<ElementProbabilitiesProps> = ({
  data,
}) => {
  return (
    <div className='flex items-center gap-2 bg-[rgba(19,19,19,0.8)] px-2 py-1 rounded-md absolute bottom-1 left-1/2 transform -translate-x-1/2'>
      {data.map(({ element, probability }, index) => (
        <div key={index} className='flex items-center'>
          <Typography variant='caption-1'>
            {getElementEmoji(element)}
          </Typography>
          <Typography variant='caption-1'>{`${probability}%`}</Typography>
        </div>
      ))}
    </div>
  )
}

export default CardElementProbabilities
