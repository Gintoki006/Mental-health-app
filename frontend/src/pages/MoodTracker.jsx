import React, { useState, useEffect } from 'react'
import { Heart, Calendar, TrendingUp, Plus } from 'lucide-react'
import { moodService } from '../services/moodService'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const MoodTracker = () => {
  const [moodEntries, setMoodEntries] = useState([])
  const [moodStats, setMoodStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    score: 5,
    mood: 'moderate',
    emotions: [],
    triggers: [],
    activities: [],
    sleep: { hours: 8, quality: 'good' },
    notes: ''
  })

  useEffect(() => {
    fetchMoodData()
  }, [])

  const fetchMoodData = async () => {
    try {
      const [entriesResponse, statsResponse] = await Promise.all([
        moodService.getMoodEntries({ limit: 30 }),
        moodService.getMoodStats(30)
      ])
      
      setMoodEntries(entriesResponse.moodEntries || [])
      setMoodStats(statsResponse)
    } catch (error) {
      console.error('Error fetching mood data:', error)
      toast.error('Failed to load mood data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await moodService.createMoodEntry(formData)
      toast.success('Mood entry added successfully!')
      setShowAddForm(false)
      setFormData({
        score: 5,
        mood: 'moderate',
        emotions: [],
        triggers: [],
        activities: [],
        sleep: { hours: 8, quality: 'good' },
        notes: ''
      })
      fetchMoodData()
    } catch (error) {
      console.error('Error creating mood entry:', error)
      toast.error('Failed to add mood entry')
    }
  }

  const getMoodColor = (score) => {
    if (score <= 2) return 'text-red-600 bg-red-100'
    if (score <= 4) return 'text-orange-600 bg-orange-100'
    if (score <= 6) return 'text-yellow-600 bg-yellow-100'
    if (score <= 8) return 'text-green-600 bg-green-100'
    return 'text-emerald-600 bg-emerald-100'
  }

  const getMoodText = (score) => {
    if (score <= 2) return 'Very Low'
    if (score <= 4) return 'Low'
    if (score <= 6) return 'Moderate'
    if (score <= 8) return 'Good'
    return 'Excellent'
  }

  const chartData = moodEntries.map(entry => ({
    date: new Date(entry.date).toLocaleDateString(),
    score: entry.score,
    mood: entry.mood
  })).reverse()

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" className="flex justify-center items-center h-64" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mood Tracker</h1>
          <p className="text-gray-600 mt-2">Track your emotional well-being over time</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </button>
      </div>

      {/* Stats Cards */}
      {moodStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Mood</p>
                <p className={`text-2xl font-semibold ${getMoodColor(moodStats.averageMood?.averageScore || 5)}`}>
                  {moodStats.averageMood?.averageScore?.toFixed(1) || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">
                  {getMoodText(moodStats.averageMood?.averageScore || 5)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Entries</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {moodStats.averageMood?.count || 0}
                </p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Trend</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {moodStats.moodTrend?.length > 1 ? 
                    (moodStats.moodTrend[moodStats.moodTrend.length - 1].score > moodStats.moodTrend[0].score ? '↗️' : '↘️') : 
                    '➡️'
                  }
                </p>
                <p className="text-xs text-gray-500">Recent direction</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mood Chart */}
      {chartData.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mood Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 10]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Entries */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h2>
        {moodEntries.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mood entries yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your mood to see insights and patterns.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              Add Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {moodEntries.slice(0, 10).map((entry) => (
              <div key={entry._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-4 ${getMoodColor(entry.score).replace('text-', 'bg-').replace('bg-red-600', 'bg-red-500').replace('bg-orange-600', 'bg-orange-500').replace('bg-yellow-600', 'bg-yellow-500').replace('bg-green-600', 'bg-green-500').replace('bg-emerald-600', 'bg-emerald-500')}`}></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">{entry.mood}</p>
                    {entry.notes && (
                      <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${getMoodColor(entry.score)}`}>
                    {entry.score}/10
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Mood Entry</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How are you feeling? (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Low (1)</span>
                  <span className={`font-semibold ${getMoodColor(formData.score)}`}>
                    {formData.score} - {getMoodText(formData.score)}
                  </span>
                  <span>Excellent (10)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="How are you feeling? What's on your mind?"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn btn-primary"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MoodTracker
