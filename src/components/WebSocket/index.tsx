import React, { createContext, useEffect, useState } from 'react'
import { WebSocketClass } from '@/utils/web-socket'
import { xToken } from '@/utils/config'

export const WebSocketContext = createContext<{
  ws: WebSocketClass | undefined
}>({ ws: undefined })

export interface WebSocketProps {
  children: React.ReactNode
}

export const WebSocketProvider:React.FC<WebSocketProps> = ({ children }) => {
  const [ws, setws] = useState<WebSocketClass>()

  useEffect(() => {
    const wss = new WebSocketClass({
      timeout: 2 * 1000,
      reconnection: true,
      reconnectionDelay: 1 * 1000,
      reconnectionDelayMax: 1000,
      reconnectionAttempts: 60,
      path: '/api/v1/ws/',
      query: {
        'x-token': xToken,
      },
    })

    setws(wss)

    return () => {
      wss?.close()
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ ws }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export default WebSocketProvider
