import React, { useState, useEffect } from 'react'
import { MapPin, Star, Phone, Globe, Filter, Map } from 'lucide-react'
import { therapistService } from '../services/therapistService'
import LoadingSpinner from '../components/LoadingSpinner'
import TherapistMap from '../components/TherapistMap'
import toast from 'react-hot-toast'

const TherapistLocator = () => {
  const [therapists, setTherapists] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'map'
  const [filters, setFilters] = useState({
    specialization: '',
    maxDistance: 50,
    location: ''
  })
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }) // Default to NYC

  useEffect(() => {
    fetchTherapists()
  }, [])

  const fetchTherapists = async () => {
    try {
      setLoading(true)
      const response = await therapistService.searchTherapists(filters)
      setTherapists(response.therapists || [])
    } catch (error) {
      console.error('Error fetching therapists:', error)
      toast.error('Failed to load therapists')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    fetchTherapists()
  }

  const getSpecializations = () => [
    'anxiety', 'depression', 'trauma', 'addiction', 'relationships',
    'grief', 'eating-disorders', 'bipolar', 'ocd', 'ptsd',
    'adhd', 'autism', 'family-therapy', 'couples-therapy'
  ]

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
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find a Therapist</h1>
            <p className="text-gray-600 mt-2">Connect with mental health professionals in your area</p>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                viewMode === 'map'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Map className="h-4 w-4 mr-1" />
              Map View
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Search Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization
            </label>
            <select
              value={filters.specialization}
              onChange={(e) => handleFilterChange('specialization', e.target.value)}
              className="input"
            >
              <option value="">All Specializations</option>
              {getSpecializations().map(spec => (
                <option key={spec} value={spec}>
                  {spec.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Distance (miles)
            </label>
            <input
              type="number"
              value={filters.maxDistance}
              onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
              className="input"
              min="1"
              max="100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="input"
              placeholder="City, State or ZIP"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={applyFilters}
            className="btn btn-primary"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Therapists Display */}
      {therapists.length === 0 ? (
        <div className="card text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No therapists found</h3>
          <p className="text-gray-500">
            Try adjusting your search filters or expanding your search area.
          </p>
        </div>
      ) : viewMode === 'map' ? (
        <div className="card">
          <div className="h-96">
            <TherapistMap 
              therapists={therapists} 
              center={mapCenter} 
              zoom={12}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {therapists.map((therapist) => (
            <div key={therapist._id} className="card">
              <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                {/* Therapist Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {therapist.name}
                      </h3>
                      <p className="text-gray-600">{therapist.credentials?.degree}</p>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium text-gray-900">
                        {therapist.rating?.average?.toFixed(1) || 'N/A'}
                      </span>
                      <span className="ml-1 text-sm text-gray-500">
                        ({therapist.rating?.count || 0} reviews)
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {therapist.location?.address?.city}, {therapist.location?.address?.state}
                  </div>
                  
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-900">Specializations:</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {therapist.specialization?.slice(0, 3).map((spec, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {spec.replace('-', ' ')}
                        </span>
                      ))}
                      {therapist.specialization?.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{therapist.specialization.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {therapist.bio && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                      {therapist.bio}
                    </p>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex flex-col space-y-2 md:w-48">
                  <button className="btn btn-primary text-sm">
                    View Profile
                  </button>
                  <button className="btn btn-secondary text-sm">
                    Book Session
                  </button>
                  <div className="flex space-x-2">
                    <button className="flex-1 btn btn-secondary text-xs">
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </button>
                    <button className="flex-1 btn btn-secondary text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      Website
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TherapistLocator
