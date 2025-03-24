import React, { useEffect, useRef } from 'react'

const GameLogs = ({ logs }: { logs: string[] }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div
      ref={containerRef}
      className='game-logs mt-4 p-4 bg-white border-4 border-gray-800 rounded-none text-gray-800 h-48 overflow-y-auto relative'
      style={{
        boxShadow: '0 0 0 4px #d0d0d0, 0 6px 0 4px #888888',
        fontFamily: '"Press Start 2P", monospace',
      }}
    >
      <h3 className='text-xl font-bold mb-2 text-white px-2 py-1 bg-blue-700 inline-block border-2 border-gray-800'>
        Battle Logs
      </h3>
      <div className='logs-container flex flex-col-reverse'>
        <div ref={containerRef} />
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
      <div className='absolute bottom-2 right-2 text-blue-700'>▼</div>
      <div className='pixel-scanline absolute top-0 left-0 w-full h-full pointer-events-none'></div>

      <style jsx>{`
        .pixel-scanline::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.03),
            rgba(0, 0, 0, 0.03) 1px,
            transparent 1px,
            transparent 2px
          );
          pointer-events: none;
          z-index: 10;
        }
      `}</style>
    </div>
  )
}

export default GameLogs
