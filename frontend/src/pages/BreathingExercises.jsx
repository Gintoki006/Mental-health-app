import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Wind } from 'lucide-react'

const BreathingExercises = () => {
  const [isActive, setIsActive] = useState(false)
  const [currentPhase, setCurrentPhase] = useState('inhale')
  const [timeLeft, setTimeLeft] = useState(4)
  const [cycle, setCycle] = useState(0)
  const [exercise, setExercise] = useState('box')

  const exercises = {
    box: {
      name: 'Box Breathing',
      description: 'A simple 4-4-4-4 pattern for stress relief',
      phases: [
        { name: 'inhale', duration: 4, instruction: 'Breathe in slowly' },
        { name: 'hold', duration: 4, instruction: 'Hold your breath' },
        { name: 'exhale', duration: 4, instruction: 'Breathe out slowly' },
        { name: 'rest', duration: 4, instruction: 'Rest and relax' }
      ]
    },
    '4-7-8': {
      name: '4-7-8 Breathing',
      description: 'Calming technique for anxiety and sleep',
      phases: [
        { name: 'inhale', duration: 4, instruction: 'Breathe in through nose' },
        { name: 'hold', duration: 7, instruction: 'Hold your breath' },
        { name: 'exhale', duration: 8, instruction: 'Breathe out through mouth' },
        { name: 'rest', duration: 2, instruction: 'Rest and relax' }
      ]
    },
    triangle: {
      name: 'Triangle Breathing',
      description: 'Equal breathing for balance and focus',
      phases: [
        { name: 'inhale', duration: 4, instruction: 'Breathe in slowly' },
        { name: 'exhale', duration: 4, instruction: 'Breathe out slowly' },
        { name: 'rest', duration: 2, instruction: 'Rest and relax' }
      ]
    }
  }

  useEffect(() => {
    let interval = null
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      const currentExerciseData = exercises[exercise]
      const currentPhaseIndex = currentExerciseData.phases.findIndex(phase => phase.name === currentPhase)
      const nextPhaseIndex = (currentPhaseIndex + 1) % currentExerciseData.phases.length
      const nextPhase = currentExerciseData.phases[nextPhaseIndex]
      
      setCurrentPhase(nextPhase.name)
      setTimeLeft(nextPhase.duration)
      
      if (nextPhaseIndex === 0) {
        setCycle(cycle + 1)
      }
    }
    
    return () => clearInterval(interval)
  }, [isActive, timeLeft, currentPhase, cycle, exercise])

  const startExercise = () => {
    setIsActive(true)
    setCycle(0)
    const currentExerciseData = exercises[exercise]
    setCurrentPhase(currentExerciseData.phases[0].name)
    setTimeLeft(currentExerciseData.phases[0].duration)
  }

  const stopExercise = () => {
    setIsActive(false)
    setTimeLeft(4)
    setCurrentPhase('inhale')
    setCycle(0)
  }

  const getCurrentInstruction = () => {
    const currentExerciseData = exercises[exercise]
    const currentPhaseData = currentExerciseData.phases.find(phase => phase.name === currentPhase)
    return currentPhaseData?.instruction || ''
  }

  const getCircleSize = () => {
    const currentExerciseData = exercises[exercise]
    const currentPhaseData = currentExerciseData.phases.find(phase => phase.name === currentPhase)
    const totalDuration = currentPhaseData?.duration || 4
    
    if (currentPhase === 'inhale') {
      return 100 + (100 * (1 - timeLeft / totalDuration))
    } else if (currentPhase === 'exhale') {
      return 200 - (100 * (1 - timeLeft / totalDuration))
    } else {
      return 200
    }
  }

  const getCircleColor = () => {
    switch (currentPhase) {
      case 'inhale': return 'bg-blue-500'
      case 'hold': return 'bg-yellow-500'
      case 'exhale': return 'bg-green-500'
      case 'rest': return 'bg-gray-400'
      default: return 'bg-blue-500'
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-4">
          <Wind className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Breathing Exercises</h1>
        <p className="text-gray-600 mt-2">Practice mindfulness and find your calm</p>
      </div>

      {/* Exercise Selector */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose an Exercise</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(exercises).map(([key, exerciseData]) => (
            <button
              key={key}
              onClick={() => setExercise(key)}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                exercise === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-medium text-gray-900">{exerciseData.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{exerciseData.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Breathing Exercise */}
      <div className="card text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {exercises[exercise].name}
        </h2>
        
        {/* Breathing Circle */}
        <div className="flex justify-center items-center mb-8">
          <div className="relative">
            <div
              className={`w-64 h-64 rounded-full ${getCircleColor()} transition-all duration-1000 ease-in-out flex items-center justify-center`}
              style={{
                width: `${getCircleSize()}px`,
                height: `${getCircleSize()}px`
              }}
            >
              <div className="text-white text-center">
                <div className="text-4xl font-bold mb-2">{timeLeft}</div>
                <div className="text-lg capitalize">{currentPhase}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-8">
          <p className="text-lg text-gray-700 mb-2">{getCurrentInstruction()}</p>
          <p className="text-sm text-gray-500">
            Cycle {cycle + 1} • {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} phase
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!isActive ? (
            <button
              onClick={startExercise}
              className="btn btn-primary flex items-center"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Exercise
            </button>
          ) : (
            <>
              <button
                onClick={stopExercise}
                className="btn btn-secondary flex items-center"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </button>
              <button
                onClick={stopExercise}
                className="btn btn-secondary flex items-center"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="card mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Better Breathing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Environment</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Find a quiet, comfortable space</li>
              <li>• Sit or lie down in a relaxed position</li>
              <li>• Close your eyes to reduce distractions</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Technique</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Breathe through your nose when possible</li>
              <li>• Keep your shoulders relaxed</li>
              <li>• Focus on the rhythm and sensation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="card mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits of Breathing Exercises</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 text-xl">😌</span>
            </div>
            <h4 className="font-medium text-gray-900">Reduces Stress</h4>
            <p className="text-sm text-gray-600">Activates the parasympathetic nervous system</p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 text-xl">🧠</span>
            </div>
            <h4 className="font-medium text-gray-900">Improves Focus</h4>
            <p className="text-sm text-gray-600">Enhances concentration and mindfulness</p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 text-xl">💤</span>
            </div>
            <h4 className="font-medium text-gray-900">Better Sleep</h4>
            <p className="text-sm text-gray-600">Promotes relaxation and restful sleep</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BreathingExercises
