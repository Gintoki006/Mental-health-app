import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { chatService } from '../services/chatService'
import { useSocket } from '../context/SocketContext'
import toast from 'react-hot-toast'

const Chatbot = () => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [moodAnalysis, setMoodAnalysis] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const messagesEndRef = useRef(null)
  const { socket } = useSocket()

  useEffect(() => {
    loadChatHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = async () => {
    try {
      const response = await chatService.getChatHistory('bot-chat', 50)
      const sortedMessages = (response.messages || []).sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      )
      setMessages(sortedMessages)
    } catch (error) {
      console.error('Error loading chat history:', error)
      toast.error('Failed to load chat history')
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || loading) return

    const timestamp = new Date().toISOString()

    const userMessage = {
      id: Date.now(),
      message: inputMessage,
      isBot: false,
      timestamp,
      userId: 'current-user'
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setLoading(true)

    try {
      const response = await chatService.sendChatMessage(inputMessage, 'bot-chat')

      const botMessage = {
        id: Date.now() + 1,
        message: response.botMessage.message,
        isBot: true,
        timestamp: response.botMessage.createdAt || new Date().toISOString(),
        userId: 'bot',
        moodAnalysis: response.moodAnalysis,
        suggestions: response.suggestions
      }

      setMessages(prev => {
        const updated = [...prev, botMessage]
        return updated.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      })

      setMoodAnalysis(response.moodAnalysis)
      setSuggestions(response.suggestions || [])

      // Handle emergency trigger
      if (response.botMessage.botResponse?.emergencyTriggered) {
        toast.error('Emergency alert triggered! Please seek immediate help.', {
          duration: 10000,
          style: { background: '#ef4444', color: '#fff' }
        })
      }

    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')

      const errorMessage = {
        id: Date.now() + 1,
        message: "I'm sorry, I'm having trouble processing your message right now. Please try again.",
        isBot: true,
        timestamp: new Date().toISOString(),
        userId: 'bot'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getMoodColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-950'
      case 'negative': return 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950'
      default: return 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800'
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Mental Health Companion</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">I'm here to listen and support you</p>
          </div>
        </div>
      </div>

      {/* Mood Analysis */}
      {moodAnalysis && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Mood Analysis</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Sentiment: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(moodAnalysis.sentiment)}`}>
                  {moodAnalysis.sentiment}
                </span>
                {moodAnalysis.confidence && (
                  <span className="ml-2">
                    Confidence: {Math.round(moodAnalysis.confidence * 100)}%
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to your mental health companion!</h3>
            <p className="text-gray-500">
              I'm here to listen, support, and help you through whatever you're experiencing.
            </p>
          </div>
        ) : (
          messages.map(message => (
            <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`flex max-w-xs lg:max-w-md ${message.isBot ? 'message-bot' : 'message-user'}`}>
                <div className={`flex-shrink-0 ${message.isBot ? 'order-1' : 'order-2'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    message.isBot ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {message.isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                </div>
                <div className={`ml-3 mr-3 ${message.isBot ? 'order-2' : 'order-1'}`}>
                  <div className={`px-4 py-2 rounded-lg ${
                    message.isBot ? 'bg-white border border-gray-200 text-gray-900' : 'bg-primary-600 text-white'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatTime(message.timestamp)}</p>
                </div>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="flex max-w-xs lg:max-w-md">
              <div className="flex-shrink-0 order-1">
                <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
              </div>
              <div className="ml-3 order-2">
                <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chatbot
