import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();


  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-10 w-10 items-center justify-center rounded-lg
        transition-all duration-200 ease-in-out
        ${isDarkMode 
          ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-gray-600' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
        }
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isDarkMode ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'}
        ${className}
      `}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div className="relative">
        <Sun 
          className={`
            h-5 w-5 transition-all duration-300 ease-in-out
            ${isDarkMode 
              ? 'opacity-0 rotate-90 scale-0' 
              : 'opacity-100 rotate-0 scale-100'
            }
          `}
        />
        <Moon 
          className={`
            absolute top-0 left-0 h-5 w-5 transition-all duration-300 ease-in-out
            ${isDarkMode 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
            }
          `}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
