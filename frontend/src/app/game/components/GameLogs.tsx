import React, { useEffect, useRef } from 'react'

import Typography from '@/components/Typography'

const GameLogs = ({
  logs,
}: {
  logs: { message: string; color: string }[]
}) => {
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
            <span
              className='mr-2'
              style={{ color: log.color }}
            >
              ▶
            </span>
            <span className='text-sm'>{log.message}</span>
          </div>
        ))}
      </div>
      <div className='absolute bottom-2 right-2 text-gray-600'>▼</div>
    </div>
  )
}

export default GameLogs
