import React, { useState } from 'react'
import { Heart, MessageCircle, Share2, Plus, Search, Filter } from 'lucide-react'

const HobbyConnection = () => {
  const [posts, setPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHobby, setSelectedHobby] = useState('')

  const hobbies = [
    'art', 'music', 'sports', 'cooking', 'gardening', 'reading',
    'writing', 'photography', 'crafts', 'gaming', 'dancing',
    'fitness', 'travel', 'collecting', 'woodworking', 'sewing',
    'knitting', 'pottery', 'painting', 'drawing', 'sculpture',
    'jewelry-making', 'baking', 'fishing', 'hiking', 'cycling',
    'swimming', 'yoga', 'meditation', 'volunteering', 'learning',
    'technology', 'programming', 'electronics', 'mechanics'
  ]

  // Mock data for demonstration
  const mockPosts = [
    {
      id: 1,
      title: "My Watercolor Journey",
      content: "Started learning watercolor painting last month. It's been so therapeutic and helps me relax after stressful days.",
      hobby: "painting",
      author: "Sarah M.",
      likes: 12,
      comments: 3,
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      title: "Garden Update - Spring Blooms",
      content: "My vegetable garden is finally showing signs of life! The tomatoes are starting to flower. Gardening has become my favorite stress relief activity.",
      hobby: "gardening",
      author: "Mike R.",
      likes: 8,
      comments: 5,
      timestamp: "4 hours ago"
    },
    {
      id: 3,
      title: "New Recipe Success",
      content: "Tried making homemade sourdough bread for the first time. The process was meditative and the result was delicious!",
      hobby: "cooking",
      author: "Emma L.",
      likes: 15,
      comments: 7,
      timestamp: "6 hours ago"
    }
  ]

  const filteredPosts = mockPosts.filter(post =>
    (searchTerm === '' || post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedHobby === '' || post.hobby === selectedHobby)
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hobby Connection</h1>
          <p className="text-gray-600 mt-2">Share your passions and connect with like-minded people</p>
        </div>
        <button className="btn btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Share Your Hobby
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
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="md:w-64">
            <select
              value={selectedHobby}
              onChange={(e) => setSelectedHobby(e.target.value)}
              className="input"
            >
              <option value="">All Hobbies</option>
              {hobbies.map(hobby => (
                <option key={hobby} value={hobby}>
                  {hobby.charAt(0).toUpperCase() + hobby.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="card text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-500">
              Try adjusting your search or be the first to share about this hobby!
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="card">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {post.author.charAt(0)}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{post.author}</h3>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{post.timestamp}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {post.hobby}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-medium text-gray-900 mb-2">{post.title}</h4>
                  <p className="text-gray-600 mb-4">{post.content}</p>
                  
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500">
                      <Share2 className="h-4 w-4" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default HobbyConnection
