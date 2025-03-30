import React, { useEffect, useRef } from 'react'
import Typography from '@/components/Typography'

const GameLogs = ({ logs }: { logs: string[] }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className='game-logs mt-4 p-4 bg-[#978578] rounded-lg relative'>
      <Typography variant='title-2'>Battle Logs</Typography>
      <div
        ref={containerRef}
        className='logs-container mt-2 p-3 bg-[rgba(202,193,185,1)] rounded-lg h-48 overflow-y-auto'
      >
        {logs.map((log, index) => (
          <div
            key={index}
            className='log-entry py-1 border-b border-gray-300 flex'
          >
            <span className='text-green-600 mr-2'>▶</span>
            <span className='text-sm'>{log}</span>
          </div>
        ))}
      </div>
      <div className='absolute bottom-2 right-2 text-gray-600'>▼</div>
    </div>
  )
}

export default GameLogs
