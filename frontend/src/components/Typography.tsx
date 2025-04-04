import React from 'react'

import { cn } from '@/lib/utils'

type TypographyProps = {
  variant:
    | 'display-title-1'
    | 'title-1'
    | 'title-2'
    | 'body-1'
    | 'body-2'
    | 'body-3'
    | 'caption-1'
    | 'caption-2'
    | 'caption-3'
    | 'caption-4'
  color?: 'default' | 'primary' | 'secondary' | 'accent' | 'inverse'
  outline?: boolean
  children: React.ReactNode
  className?: string
}

const Typography = ({
  variant,
  children,
  color = 'primary',
  outline = true,
  className,
}: TypographyProps) => {
  const isBold = variant === 'title-1' || variant === 'title-2'

  const fontFamily =
    variant === 'display-title-1'
      ? 'Pixeloid Sans Bold'
      : variant === 'title-1' || variant === 'title-2'
      ? 'Pixeloid Sans'
      : 'Jersey'

  const textColor = {
    default: 'rgba(19,19,19,1)',
    primary: 'rgba(255,212,0,1)',
    secondary: 'rgba(166,170,177,1)',
    accent: 'rgba(0,255,234,1)',
    inverse: 'rgba(252,252,252,1)',
  }

  const textShadow = isBold
    ? '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000'
    : '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'

  const fontSize = {
    'display-title-1': '48px',
    'title-1': '32px',
    'title-2': '24px',
    'body-1': '24px',
    'body-2': '20px',
    'body-3': '16px',
    'caption-1': '12px',
    'caption-2': '10px',
    'caption-3': '8px',
    'caption-4': '6px',
  }

  const lineHeight = {
    'display-title-1': '120%',
    'title-1': '120%',
    'title-2': '120%',
    'body-1': '150%',
    'body-2': '150%',
    'body-3': '150%',
    'caption-1': '150%',
    'caption-2': '150%',
    'caption-3': '150%',
    'caption-4': '150%',
  }

  return (
    <div
      className={cn(className)}
      style={{
        fontFamily: fontFamily,
        color: textColor[color],
        textShadow: outline ? textShadow : 'none',
        fontSize: fontSize[variant],
        lineHeight: lineHeight[variant],
      }}
    >
      {children}
    </div>
  )
}

export default Typography
