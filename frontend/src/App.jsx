import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Chatbot from './pages/Chatbot'
import MoodTracker from './pages/MoodTracker'
import TherapistLocator from './pages/TherapistLocator'
import BreathingExercises from './pages/BreathingExercises'
import Community from './pages/Community'
import HobbyConnection from './pages/HobbyConnection'
import Profile from './pages/Profile'
import Emergency from './pages/Emergency'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register /> : <Navigate to="/dashboard" replace />} 
          />
          
          {/* Protected routes */}
          <Route 
            path="/*" 
            element={
              user ? (
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/chatbot" element={<Chatbot />} />
                    <Route path="/mood-tracker" element={<MoodTracker />} />
                    <Route path="/therapist-locator" element={<TherapistLocator />} />
                    <Route path="/breathing-exercises" element={<BreathingExercises />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/hobby-connection" element={<HobbyConnection />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/emergency" element={<Emergency />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App
