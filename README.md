# Mental Health & Wellness Web Application

A comprehensive mental health and wellness platform featuring an AI chatbot for mood analysis, personalized recommendations, community support, and emergency assistance.

## 🌟 Features

### Core Features
- **AI Chatbot with Mood Analysis**: Natural language processing to detect user mood and provide support
- **Mood Tracking**: Daily mood scoring (1-10) with detailed analysis and insights
- **Personalized Recommendations**: Music, movies, games, and activities based on mood
- **Therapist Locator**: Find mental health professionals in your area
- **Breathing Exercises**: Guided mindfulness and relaxation techniques
- **Emergency System**: Automatic alerts for critical mood drops with SMS notifications

### Community Features
- **Chatrooms**: Anonymous group discussions for specific demographics
- **Video Rooms**: Small, topic-based video calls for connection
- **Hobby Connection**: Social feed for sharing hobbies and finding like-minded people

### Technical Features
- **Real-time Communication**: Socket.IO for instant messaging and video calls
- **Secure Authentication**: JWT-based authentication with password protection
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **AI Integration**: Python Flask service for advanced mood analysis

## 🏗️ Architecture

```
mental-health-app/
├── backend/                 # Node.js/Express API server
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── controllers/        # Business logic
│   ├── middleware/         # Authentication & validation
│   └── utils/              # Helper functions
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API service layer
│   │   ├── context/        # React context providers
│   │   └── hooks/          # Custom React hooks
├── ai-service/             # Python Flask AI service
│   ├── mood_analyzer.py    # Mood analysis algorithms
│   ├── chatbot.py          # Chatbot conversation logic
│   └── app.py              # Flask application
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mental-health-app
   ```

2. **Install dependencies for all services**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   **Backend** (`backend/.env`):
   ```env
   MONGODB_URI=mongodb://localhost:27017/mental-health-app
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   
   # Twilio (for emergency SMS)
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=your-twilio-phone-number
   
   # AI Service
   AI_SERVICE_URL=http://localhost:5001
   
   # External APIs
   MOVIE_API_KEY=your-movie-api-key
   MUSIC_API_KEY=your-music-api-key
   
   # CORS
   CLIENT_URL=http://localhost:5173
   ```

   **Frontend** (`frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

   **AI Service** (`ai-service/.env`):
   ```env
   FLASK_ENV=development
   PORT=5001
   
   # Gemini API Configuration
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

4. **Start MongoDB**
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```

5. **Start all services**
   ```bash
   # Start all services concurrently
   npm run dev
   
   # Or start individually:
   # Backend
   npm run server
   
   # Frontend
   npm run client
   
   # AI Service
   npm run ai-service
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - AI Service: http://localhost:5001

## 🔧 Configuration

### MongoDB Setup

1. **Install MongoDB** following the [official guide](https://docs.mongodb.com/manual/installation/)

2. **Create database and user** (optional)
   ```javascript
   use mental-health-app
   db.createUser({
     user: "mentalhealth",
     pwd: "your-password",
     roles: ["readWrite"]
   })
   ```

### Twilio Setup (for Emergency SMS)

1. **Create a Twilio account** at [twilio.com](https://www.twilio.com)

2. **Get your credentials**:
   - Account SID
   - Auth Token
   - Phone Number

3. **Add to backend/.env**:
   ```env
   TWILIO_ACCOUNT_SID=your-account-sid
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### Gemini API Setup (Required for AI Features)

1. **Get a Gemini API key**:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key
   - Copy the API key

2. **Add to ai-service/.env**:
   ```env
   GEMINI_API_KEY=your-actual-api-key-here
   ```

### External APIs (Optional)

- **Movie API**: Get API key from [TMDB](https://www.themoviedb.org/settings/api)
- **Music API**: Get API key from [Spotify](https://developer.spotify.com/dashboard)

## 📱 Usage

### User Registration & Login
1. Navigate to the registration page
2. Fill in your personal information
3. Set up emergency contact (optional but recommended)
4. Verify your email (if implemented)

### Mood Tracking
1. Go to "Mood Tracker" from the dashboard
2. Rate your mood on a scale of 1-10
3. Add notes about your feelings
4. View your mood trends and insights

### AI Chatbot
1. Click "AI Chatbot" in the navigation
2. Start a conversation about your feelings
3. Receive mood analysis and personalized suggestions
4. Get emergency alerts if needed

### Community Features
1. Browse communities by category
2. Join relevant groups
3. Participate in discussions
4. Share your hobbies and interests

### Emergency Resources
1. Access emergency resources anytime
2. Test your emergency contact setup
3. Get crisis hotline information
4. Trigger emergency alerts if needed

## 🛠️ Development

### Project Structure

**Backend (Node.js/Express)**
- RESTful API with JWT authentication
- MongoDB with Mongoose ODM
- Socket.IO for real-time features
- Twilio integration for SMS
- Comprehensive validation and error handling

**Frontend (React)**
- Modern React with hooks and context
- Tailwind CSS for styling
- Responsive design
- Real-time updates with Socket.IO
- Form validation and error handling

**AI Service (Python/Flask)**
- **Gemini AI Integration**: Advanced language model for natural conversations
- **Enhanced Mood Detection**: Comprehensive emotion analysis with 50+ emotions
- **Crisis Detection**: Automatic identification of crisis situations
- **Context-Aware Responses**: Personalized support based on mood and conversation history
- **Coping Strategies**: AI-generated personalized coping techniques
- **Emergency Alerts**: Automatic detection of concerning patterns

### API Endpoints

**Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

**Mood Tracking**
- `POST /api/mood` - Create mood entry
- `GET /api/mood` - Get mood entries
- `GET /api/mood/stats` - Get mood statistics
- `GET /api/mood/insights` - Get mood insights

**Chat**
- `POST /api/chat/bot` - Send message to chatbot
- `GET /api/chat/bot/history` - Get chat history
- `POST /api/chat/community` - Send community message

**Therapists**
- `GET /api/therapists/search` - Search therapists
- `GET /api/therapists/:id` - Get therapist details
- `POST /api/therapists/:id/review` - Add review

**Emergency**
- `POST /api/emergency/test` - Test emergency contact
- `POST /api/emergency/trigger` - Trigger emergency alert
- `GET /api/emergency/resources` - Get emergency resources

**AI Service Endpoints**
- `POST /chat` - Chat with AI chatbot (with mood analysis)
- `POST /detect-emotion` - Detect emotion from text
- `POST /coping-strategies` - Get personalized coping strategies
- `POST /crisis-check` - Check for crisis indicators
- `GET /emergency-support` - Get emergency support resources
- `POST /user-mood-stats` - Get user mood statistics
- `POST /analyze-text` - Comprehensive text analysis

### Database Models

**User**
- Personal information
- Authentication data
- Emergency contact
- Preferences

**MoodEntry**
- Mood score and category
- Emotions and triggers
- AI analysis results
- Emergency flags

**ChatMessage**
- Message content
- User and room information
- Bot responses
- Mood analysis

**Therapist**
- Professional information
- Location and availability
- Specializations
- Reviews and ratings

**Community**
- Community details
- Member management
- Settings and rules

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js for security headers

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# AI service tests
cd ai-service
python -m pytest
```

## 📦 Deployment

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Start production servers
cd backend
npm start

cd ai-service
gunicorn app:app
```

### Environment Variables for Production

- Set `NODE_ENV=production`
- Use production MongoDB URI
- Configure production Twilio credentials
- Set up proper CORS origins
- Use secure JWT secrets

### Docker Deployment (Optional)

```dockerfile
# Example Dockerfile for backend
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints
- Contact the development team

## 🔮 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Advanced AI features
- [ ] Video therapy sessions
- [ ] Medication tracking
- [ ] Sleep pattern analysis
- [ ] Integration with wearables
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

## ⚠️ Disclaimer

This application is for educational and supportive purposes only. It is not a replacement for professional mental health care. Always consult with qualified mental health professionals for serious concerns.

---

**Built with ❤️ for mental health awareness and support**
