import React, { useState, useEffect } from 'react'
import { Users, MessageCircle, Video, Plus, Search, Heart, Share2, MoreHorizontal, Clock, Eye } from 'lucide-react'
import { communityService } from '../services/communityService'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Community = () => {
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [activeTab, setActiveTab] = useState('chatrooms') // 'chatrooms', 'video-rooms', 'hobby-feed'

  const categories = [
    'general', 'anxiety', 'depression', 'trauma', 'addiction',
    'relationships', 'grief', 'eating-disorders', 'bipolar',
    'ocd', 'ptsd', 'adhd', 'autism', 'family', 'couples',
    'children', 'adolescents', 'seniors', 'lgbtq+', 'veterans',
    'students', 'professionals', 'parents', 'caregivers'
  ]

  useEffect(() => {
    fetchCommunities()
  }, [selectedCategory])

  const fetchCommunities = async () => {
    try {
      setLoading(true)
      const response = await communityService.getCommunitiesByCategory(
        selectedCategory || 'general'
      )
      setCommunities(response.communities || [])
    } catch (error) {
      console.error('Error fetching communities:', error)
      toast.error('Failed to load communities')
    } finally {
      setLoading(false)
    }
  }

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-3xl font-bold text-gray-900">Community Hub</h1>
          <p className="text-gray-600 mt-2">Connect with others who understand your journey</p>
        </div>
        <button className="btn btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Create Community
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
        <button
          onClick={() => setActiveTab('chatrooms')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
            activeTab === 'chatrooms'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat Rooms
        </button>
        <button
          onClick={() => setActiveTab('video-rooms')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
            activeTab === 'video-rooms'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Video className="h-4 w-4 mr-2" />
          Video Rooms
        </button>
        <button
          onClick={() => setActiveTab('hobby-feed')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
            activeTab === 'hobby-feed'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="h-4 w-4 mr-2" />
          Hobby Connection
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'chatrooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.filter(c => c.type === 'chatroom').length === 0 ? (
            <div className="col-span-full card text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chat rooms found</h3>
              <p className="text-gray-500">
                Try adjusting your search or create a new chat room.
              </p>
            </div>
          ) : (
            filteredCommunities.filter(c => c.type === 'chatroom').map((community) => (
              <div key={community._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <MessageCircle className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-semibold text-gray-900">{community.name}</h3>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {community.memberCount} members
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {community.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {community.tags?.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="btn btn-primary text-sm">
                    Join Chat
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'video-rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCommunities.filter(c => c.type === 'video-room').length === 0 ? (
            <div className="col-span-full card text-center py-12">
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No video rooms found</h3>
              <p className="text-gray-500">
                Try adjusting your search or create a new video room.
              </p>
            </div>
          ) : (
            filteredCommunities.filter(c => c.type === 'video-room').map((room) => (
              <div key={room._id} className="card hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-green-400 to-blue-500 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Video className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">{room.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">{room.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Eye className="h-4 w-4 mr-1" />
                    {room.memberCount}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {room.description}
                </p>
                
                <button className="w-full btn btn-primary text-sm">
                  Join Video Call
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'hobby-feed' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Create Post */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">U</span>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Share your hobby or interest..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <div className="flex space-x-4">
                <button className="flex items-center text-sm text-gray-600 hover:text-purple-600">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Photo
                </button>
                <button className="flex items-center text-sm text-gray-600 hover:text-purple-600">
                  <Video className="h-4 w-4 mr-1" />
                  Add Video
                </button>
              </div>
              <button className="btn btn-primary text-sm">
                Share
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          {filteredCommunities.filter(c => c.type === 'hobby-group').length === 0 ? (
            <div className="card text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hobby posts found</h3>
              <p className="text-gray-500">
                Be the first to share your hobby or interest!
              </p>
            </div>
          ) : (
            filteredCommunities.filter(c => c.type === 'hobby-group').map((post) => (
              <div key={post._id} className="card">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">U</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Anonymous User</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                
                <p className="text-gray-900 mb-4">{post.description}</p>
                
                {post.image && (
                  <div className="mb-4">
                    <img
                      src={post.image}
                      alt="Hobby post"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center text-sm text-gray-600 hover:text-red-600">
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes || 0}
                    </button>
                    <button className="flex items-center text-sm text-gray-600 hover:text-blue-600">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {post.tags?.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Community
