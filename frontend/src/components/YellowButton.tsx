const YellowButton: React.FC<{
  onClick: () => void
  children: React.ReactNode
  width?: string
  height?: string
}> = ({ onClick, children, width = '110px', height = '32px' }) => {
  return (
    <div
      className='ml-4 text-[rgba(255,212,0,1)] cursor-pointer border border-[rgba(255,212,0,1)] rounded-lg flex items-center justify-center'
      style={{ width, height }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default YellowButton
