import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const SocketContext = createContext()

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const { user, token } = useAuth()

  useEffect(() => {
    if (user && token) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          token
        }
      })

      newSocket.on('connect', () => {
        console.log('Connected to server')
        setConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server')
        setConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error)
        toast.error('Connection to server failed')
      })

      newSocket.on('receive-message', (data) => {
        // Handle incoming messages
        console.log('Received message:', data)
      })

      newSocket.on('emergency-alert', (data) => {
        // Handle emergency alerts
        console.log('Emergency alert:', data)
        toast.error('Emergency alert received!', {
          duration: 10000,
          style: {
            background: '#ef4444',
            color: '#fff',
          }
        })
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    } else {
      if (socket) {
        socket.close()
        setSocket(null)
        setConnected(false)
      }
    }
  }, [user, token])

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('join-room', roomId)
    }
  }

  const leaveRoom = (roomId) => {
    if (socket) {
      socket.emit('leave-room', roomId)
    }
  }

  const sendMessage = (data) => {
    if (socket) {
      socket.emit('send-message', data)
    }
  }

  const sendOffer = (data) => {
    if (socket) {
      socket.emit('offer', data)
    }
  }

  const sendAnswer = (data) => {
    if (socket) {
      socket.emit('answer', data)
    }
  }

  const sendIceCandidate = (data) => {
    if (socket) {
      socket.emit('ice-candidate', data)
    }
  }

  const value = {
    socket,
    connected,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendOffer,
    sendAnswer,
    sendIceCandidate
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
