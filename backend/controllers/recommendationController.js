const axios = require('axios');
const MoodEntry = require('../models/MoodEntry');

// Get personalized recommendations
const getRecommendations = async (req, res) => {
  try {
    const { type } = req.query; // 'music', 'movies', 'games', 'activities'
    
    // Get user's recent mood
    const recentMood = await MoodEntry.findOne({
      userId: req.user._id
    }).sort({ date: -1 });
    
    const moodScore = recentMood ? recentMood.score : 5;
    const mood = recentMood ? recentMood.mood : 'moderate';
    
    let recommendations = {};
    
    switch (type) {
      case 'music':
        recommendations = await getMusicRecommendations(moodScore, mood);
        break;
      case 'movies':
        recommendations = await getMovieRecommendations(moodScore, mood);
        break;
      case 'games':
        recommendations = await getGameRecommendations(moodScore, mood);
        break;
      case 'activities':
        recommendations = await getActivityRecommendations(moodScore, mood);
        break;
      default:
        // Get all recommendations
        recommendations = {
          music: await getMusicRecommendations(moodScore, mood),
          movies: await getMovieRecommendations(moodScore, mood),
          games: await getGameRecommendations(moodScore, mood),
          activities: await getActivityRecommendations(moodScore, mood)
        };
    }
    
    res.json({
      moodScore,
      mood,
      recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
  }
};

// Get music recommendations
const getMusicRecommendations = async (moodScore, mood) => {
  try {
    // This would typically integrate with Spotify API or similar
    // For now, we'll return curated playlists based on mood
    
    const playlists = {
      'very-low': [
        {
          name: 'Gentle Healing',
          description: 'Soft, calming music for difficult times',
          tracks: [
            'Weightless - Marconi Union',
            'Clair de Lune - Claude Debussy',
            'River Flows in You - Yiruma'
          ]
        },
        {
          name: 'Hope & Light',
          description: 'Uplifting melodies to bring comfort',
          tracks: [
            'Here Comes the Sun - The Beatles',
            'Three Little Birds - Bob Marley',
            'What a Wonderful World - Louis Armstrong'
          ]
        }
      ],
      'low': [
        {
          name: 'Comfort Zone',
          description: 'Gentle music for reflection and healing',
          tracks: [
            'Mad World - Gary Jules',
            'Hallelujah - Jeff Buckley',
            'The Sound of Silence - Simon & Garfunkel'
          ]
        }
      ],
      'moderate': [
        {
          name: 'Balanced Vibes',
          description: 'Music for a steady, peaceful mood',
          tracks: [
            'Imagine - John Lennon',
            'Lean on Me - Bill Withers',
            'Don\'t Worry Be Happy - Bobby McFerrin'
          ]
        }
      ],
      'good': [
        {
          name: 'Positive Energy',
          description: 'Upbeat music to enhance your good mood',
          tracks: [
            'Happy - Pharrell Williams',
            'Good Vibrations - The Beach Boys',
            'Walking on Sunshine - Katrina and the Waves'
          ]
        }
      ],
      'very-good': [
        {
          name: 'Pure Joy',
          description: 'High-energy music for great days',
          tracks: [
            'I Gotta Feeling - Black Eyed Peas',
            'Can\'t Stop the Feeling - Justin Timberlake',
            'Uptown Funk - Mark Ronson ft. Bruno Mars'
          ]
        }
      ],
      'excellent': [
        {
          name: 'Celebration',
          description: 'The best music for amazing days',
          tracks: [
            'Celebration - Kool & The Gang',
            'I Will Survive - Gloria Gaynor',
            'We Are the Champions - Queen'
          ]
        }
      ]
    };
    
    return playlists[mood] || playlists['moderate'];
  } catch (error) {
    console.error('Get music recommendations error:', error);
    return [];
  }
};

// Get movie recommendations
const getMovieRecommendations = async (moodScore, mood) => {
  try {
    // This would typically integrate with a movie API like TMDB
    // For now, we'll return curated movies based on mood
    
    const movies = {
      'very-low': [
        {
          title: 'The Pursuit of Happyness',
          genre: 'Drama',
          description: 'An inspiring story of perseverance and hope',
          year: 2006
        },
        {
          title: 'Good Will Hunting',
          genre: 'Drama',
          description: 'A touching story about finding your path',
          year: 1997
        }
      ],
      'low': [
        {
          title: 'The Secret Life of Walter Mitty',
          genre: 'Adventure/Comedy',
          description: 'A journey of self-discovery and adventure',
          year: 2013
        }
      ],
      'moderate': [
        {
          title: 'The Grand Budapest Hotel',
          genre: 'Comedy/Drama',
          description: 'A whimsical and beautifully crafted story',
          year: 2014
        }
      ],
      'good': [
        {
          title: 'La La Land',
          genre: 'Musical/Romance',
          description: 'A beautiful musical about dreams and love',
          year: 2016
        }
      ],
      'very-good': [
        {
          title: 'The Princess Bride',
          genre: 'Adventure/Comedy',
          description: 'A classic adventure with humor and heart',
          year: 1987
        }
      ],
      'excellent': [
        {
          title: 'The Lion King',
          genre: 'Animation/Musical',
          description: 'A timeless story of courage and family',
          year: 1994
        }
      ]
    };
    
    return movies[mood] || movies['moderate'];
  } catch (error) {
    console.error('Get movie recommendations error:', error);
    return [];
  }
};

// Get game recommendations
const getGameRecommendations = async (moodScore, mood) => {
  try {
    const games = {
      'very-low': [
        {
          name: 'Flower',
          type: 'Relaxing',
          description: 'A peaceful journey through nature',
          platform: 'PC/Console'
        },
        {
          name: 'Journey',
          type: 'Adventure',
          description: 'A meditative adventure through beautiful landscapes',
          platform: 'PC/Console'
        }
      ],
      'low': [
        {
          name: 'Stardew Valley',
          type: 'Simulation',
          description: 'A relaxing farming and life simulation',
          platform: 'PC/Mobile/Console'
        }
      ],
      'moderate': [
        {
          name: 'Animal Crossing',
          type: 'Simulation',
          description: 'A peaceful life simulation game',
          platform: 'Nintendo Switch'
        }
      ],
      'good': [
        {
          name: 'Minecraft',
          type: 'Sandbox',
          description: 'Creative building and exploration',
          platform: 'PC/Mobile/Console'
        }
      ],
      'very-good': [
        {
          name: 'Overcooked 2',
          type: 'Cooperative',
          description: 'Fun cooking chaos with friends',
          platform: 'PC/Console'
        }
      ],
      'excellent': [
        {
          name: 'Just Dance',
          type: 'Rhythm',
          description: 'High-energy dancing and fun',
          platform: 'Console/Mobile'
        }
      ]
    };
    
    return games[mood] || games['moderate'];
  } catch (error) {
    console.error('Get game recommendations error:', error);
    return [];
  }
};

// Get activity recommendations
const getActivityRecommendations = async (moodScore, mood) => {
  try {
    const activities = {
      'very-low': [
        {
          name: 'Deep Breathing Exercise',
          type: 'Mindfulness',
          description: '5-minute guided breathing for calm',
          duration: '5 minutes'
        },
        {
          name: 'Gentle Stretching',
          type: 'Physical',
          description: 'Light stretching to release tension',
          duration: '10 minutes'
        }
      ],
      'low': [
        {
          name: 'Nature Walk',
          type: 'Physical',
          description: 'A peaceful walk in nature',
          duration: '20-30 minutes'
        }
      ],
      'moderate': [
        {
          name: 'Journaling',
          type: 'Mental',
          description: 'Write about your thoughts and feelings',
          duration: '15 minutes'
        }
      ],
      'good': [
        {
          name: 'Creative Art',
          type: 'Creative',
          description: 'Drawing, painting, or crafting',
          duration: '30 minutes'
        }
      ],
      'very-good': [
        {
          name: 'Social Connection',
          type: 'Social',
          description: 'Call a friend or family member',
          duration: '15-30 minutes'
        }
      ],
      'excellent': [
        {
          name: 'Physical Exercise',
          type: 'Physical',
          description: 'Dancing, running, or sports',
          duration: '30-60 minutes'
        }
      ]
    };
    
    return activities[mood] || activities['moderate'];
  } catch (error) {
    console.error('Get activity recommendations error:', error);
    return [];
  }
};

module.exports = {
  getRecommendations
};
