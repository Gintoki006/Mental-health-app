import React, { useState, useEffect } from 'react'
import { AlertTriangle, Phone, MessageSquare, Globe, Shield, TestTube } from 'lucide-react'
import { emergencyService } from '../services/emergencyService'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Emergency = () => {
  const [emergencyStats, setEmergencyStats] = useState(null)
  const [resources, setResources] = useState(null)
  const [loading, setLoading] = useState(true)
  const [testingContact, setTestingContact] = useState(false)

  useEffect(() => {
    fetchEmergencyData()
  }, [])

  const fetchEmergencyData = async () => {
    try {
      const [statsResponse, resourcesResponse] = await Promise.all([
        emergencyService.getEmergencyStats(30),
        emergencyService.getEmergencyResources()
      ])
      
      setEmergencyStats(statsResponse.stats)
      setResources(resourcesResponse.resources)
    } catch (error) {
      console.error('Error fetching emergency data:', error)
      toast.error('Failed to load emergency data')
    } finally {
      setLoading(false)
    }
  }

  const handleTestContact = async () => {
    try {
      setTestingContact(true)
      await emergencyService.testEmergencyContact()
      toast.success('Test message sent successfully!')
    } catch (error) {
      console.error('Error testing emergency contact:', error)
      toast.error('Failed to send test message')
    } finally {
      setTestingContact(false)
    }
  }

  const handleTriggerEmergency = async () => {
    if (window.confirm('Are you sure you want to trigger an emergency alert? This will notify your emergency contact immediately.')) {
      try {
        await emergencyService.triggerEmergency()
        toast.success('Emergency alert sent!')
      } catch (error) {
        console.error('Error triggering emergency:', error)
        toast.error('Failed to send emergency alert')
      }
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" className="flex justify-center items-center h-64" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Emergency Resources</h1>
            <p className="text-gray-600 mt-2">Immediate help and crisis support</p>
          </div>
        </div>
      </div>

      {/* Emergency Alert Button */}
      <div className="card mb-8 bg-red-50 border-red-200">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 mb-2">Need Immediate Help?</h2>
          <p className="text-red-700 mb-6">
            If you're in crisis or having thoughts of self-harm, please reach out for help immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleTriggerEmergency}
              className="btn btn-danger text-lg px-8 py-3"
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              Trigger Emergency Alert
            </button>
            <a
              href="tel:988"
              className="btn btn-primary text-lg px-8 py-3"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call 988 (Suicide & Crisis Lifeline)
            </a>
          </div>
        </div>
      </div>

      {/* Emergency Stats */}
      {emergencyStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Emergencies</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {emergencyStats.totalEmergencies}
                </p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Alerts Sent</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {emergencyStats.triggeredEmergencies}
                </p>
                <p className="text-xs text-gray-500">Successfully delivered</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <TestTube className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Test Contact</p>
                <button
                  onClick={handleTestContact}
                  disabled={testingContact}
                  className="btn btn-secondary text-sm"
                >
                  {testingContact ? <LoadingSpinner size="sm" /> : 'Test Now'}
                </button>
                <p className="text-xs text-gray-500 mt-1">Verify your setup</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crisis Hotlines */}
      {resources?.hotlines && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Phone className="h-5 w-5 mr-2" />
            Crisis Hotlines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.hotlines.map((hotline, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{hotline.name}</h3>
                <p className="text-2xl font-bold text-primary-600 mb-2">{hotline.number}</p>
                <p className="text-sm text-gray-600">{hotline.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Online Resources */}
      {resources?.websites && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Online Resources
          </h2>
          <div className="space-y-4">
            {resources.websites.map((website, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{website.name}</h3>
                  <p className="text-sm text-gray-600">{website.description}</p>
                </div>
                <a
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary text-sm"
                >
                  Visit Site
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Apps */}
      {resources?.apps && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Helpful Mobile Apps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.apps.map((app, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{app.name}</h3>
                <p className="text-sm text-gray-600">{app.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety Planning */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Safety Planning</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Warning Signs</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Thoughts of suicide or self-harm</li>
              <li>• Feeling hopeless or trapped</li>
              <li>• Increased substance use</li>
              <li>• Withdrawing from friends and family</li>
              <li>• Extreme mood swings</li>
              <li>• Giving away possessions</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Coping Strategies</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Reach out to a trusted person</li>
              <li>• Call a crisis hotline</li>
              <li>• Go to the nearest emergency room</li>
              <li>• Remove means of self-harm</li>
              <li>• Practice grounding techniques</li>
              <li>• Remember: feelings are temporary</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Emergency
