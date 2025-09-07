import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Calendar,
  Activity,
  Users,
  AlertTriangle,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { moodService } from '../services/moodService'
import { recommendationService } from '../services/recommendationService'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const Dashboard = () => {
  const { user } = useAuth()
  const [moodStats, setMoodStats] = useState(null)
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, recommendationsResponse] = await Promise.all([
          moodService.getMoodStats(7),
          recommendationService.getRecommendations()
        ])
        
        setMoodStats(statsResponse)
        setRecommendations(recommendationsResponse)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" className="flex justify-center items-center h-64" />
      </div>
    )
  }

  const quickActions = [
    {
      title: 'Track Your Mood',
      description: 'Log how you\'re feeling today',
      icon: Heart,
      href: '/mood-tracker',
      color: 'bg-red-500'
    },
    {
      title: 'Chat with AI',
      description: 'Talk to your mental health companion',
      icon: MessageCircle,
      href: '/chatbot',
      color: 'bg-blue-500'
    },
    {
      title: 'Find a Therapist',
      description: 'Locate mental health professionals',
      icon: Users,
      href: '/therapist-locator',
      color: 'bg-green-500'
    },
    {
      title: 'Breathing Exercises',
      description: 'Practice mindfulness and calm',
      icon: Activity,
      href: '/breathing-exercises',
      color: 'bg-purple-500'
    }
  ]

  const getMoodColor = (score) => {
    if (score <= 3) return 'text-red-600 bg-red-100'
    if (score <= 6) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getMoodText = (score) => {
    if (score <= 2) return 'Very Low'
    if (score <= 4) return 'Low'
    if (score <= 6) return 'Moderate'
    if (score <= 8) return 'Good'
    return 'Excellent'
  }

  // Prepare chart data
  const chartData = {
    labels: moodStats?.moodTrend?.map(entry => 
      new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Mood Score',
        data: moodStats?.moodTrend?.map(entry => entry.score) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Your Mental State Over Time',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `Mood: ${context.parsed.y}/10`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            return value + '/10'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    elements: {
      point: {
        hoverBackgroundColor: 'rgb(59, 130, 246)'
      }
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          How are you feeling today? Let's take care of your mental health together.
        </p>
      </div>

      {/* Emergency Alert */}
      {moodStats?.averageMood?.averageScore <= 3 && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                We're concerned about your recent mood
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Consider reaching out for support or using our emergency resources.
              </p>
              <Link
                to="/emergency"
                className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 mt-2 inline-block"
              >
                View emergency resources →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Mood</p>
              <p className={`text-2xl font-semibold ${getMoodColor(moodStats?.averageMood?.averageScore || 5)}`}>
                {moodStats?.averageMood?.averageScore?.toFixed(1) || 'N/A'}
              </p>
              <p className="text-xs text-gray-500">
                {getMoodText(moodStats?.averageMood?.averageScore || 5)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Mood Trend</p>
              <p className="text-2xl font-semibold text-gray-900">
                {moodStats?.moodTrend?.length || 0}
              </p>
              <p className="text-xs text-gray-500">Entries this week</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Streak</p>
              <p className="text-2xl font-semibold text-gray-900">
                {moodStats?.moodTrend?.length || 0}
              </p>
              <p className="text-xs text-gray-500">Days tracked</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Emotions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {moodStats?.emotionFrequency?.length || 0}
              </p>
              <p className="text-xs text-gray-500">Tracked emotions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="card hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${action.color} text-white`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mood Chart */}
      {moodStats?.moodTrend && moodStats.moodTrend.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Mental State Over Time</h2>
          <div className="card">
            <div className="h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Personalized Recommendations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.recommendations?.music && (
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-3">🎵 Music for Your Mood</h3>
                <div className="space-y-2">
                  {recommendations.recommendations.music.slice(0, 2).map((playlist, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900">{playlist.name}</h4>
                      <p className="text-sm text-gray-600">{playlist.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.recommendations?.movies && (
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-3">🎬 Movies for Your Mood</h3>
                <div className="space-y-2">
                  {recommendations.recommendations.movies.slice(0, 2).map((movie, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900">{movie.title}</h4>
                      <p className="text-sm text-gray-600">{movie.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Genre: {movie.genre}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.recommendations?.activities && (
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-3">🎯 Activities for You</h3>
                <div className="space-y-2">
                  {recommendations.recommendations.activities.slice(0, 3).map((activity, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900">{activity.name}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Duration: {activity.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Mood Entries */}
      {moodStats?.moodTrend && moodStats.moodTrend.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Mood Entries</h2>
          <div className="card">
            <div className="space-y-3">
              {moodStats.moodTrend.slice(0, 5).map((entry, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${getMoodColor(entry.score).replace('text-', 'bg-').replace('bg-red-600', 'bg-red-500').replace('bg-yellow-600', 'bg-yellow-500').replace('bg-green-600', 'bg-green-500')}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">{entry.mood}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${getMoodColor(entry.score)}`}>
                      {entry.score}/10
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                to="/mood-tracker"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View all mood entries →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
