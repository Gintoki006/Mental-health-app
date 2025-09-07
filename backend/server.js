const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');
const moodRoutes = require('./routes/mood');
const therapistRoutes = require('./routes/therapists');
const communityRoutes = require('./routes/community');
const emergencyRoutes = require('./routes/emergency');
const recommendationRoutes = require('./routes/recommendations');
const EmergencyMonitor = require('./services/emergencyMonitor');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mental-health-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/therapists', therapistRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling with namespaces
const chatNamespace = io.of('/chat');
const videoNamespace = io.of('/video');

// Chat namespace for text-based chatrooms
chatNamespace.on('connection', (socket) => {
  console.log('User connected to chat namespace:', socket.id);

  // Join chat room
  socket.on('join-room', (data) => {
    const { roomId, userId } = data;
    socket.join(roomId);
    socket.userId = userId;
    socket.roomId = roomId;
    
    // Notify others in the room
    socket.to(roomId).emit('user-joined', {
      userId,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
    
    console.log(`User ${userId} joined chat room ${roomId}`);
  });

  // Leave chat room
  socket.on('leave-room', (data) => {
    const { roomId, userId } = data;
    socket.leave(roomId);
    
    // Notify others in the room
    socket.to(roomId).emit('user-left', {
      userId,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
    
    console.log(`User ${userId} left chat room ${roomId}`);
  });

  // Send message
  socket.on('send-message', (data) => {
    const messageData = {
      ...data,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    };
    
    // Broadcast to all users in the room except sender
    socket.to(data.roomId).emit('receive-message', messageData);
    
    console.log(`Message sent in room ${data.roomId} by user ${data.userId}`);
  });

  // Typing indicators
  socket.on('typing-start', (data) => {
    socket.to(data.roomId).emit('user-typing', {
      userId: data.userId,
      isTyping: true
    });
  });

  socket.on('typing-stop', (data) => {
    socket.to(data.roomId).emit('user-typing', {
      userId: data.userId,
      isTyping: false
    });
  });

  socket.on('disconnect', () => {
    if (socket.roomId && socket.userId) {
      socket.to(socket.roomId).emit('user-left', {
        userId: socket.userId,
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
    }
    console.log('User disconnected from chat namespace:', socket.id);
  });
});

// Video namespace for WebRTC video calls
videoNamespace.on('connection', (socket) => {
  console.log('User connected to video namespace:', socket.id);

  // Join video room
  socket.on('join-video-room', (data) => {
    const { roomId, userId } = data;
    socket.join(roomId);
    socket.userId = userId;
    socket.roomId = roomId;
    
    // Get list of users in the room
    const room = videoNamespace.adapter.rooms.get(roomId);
    const usersInRoom = room ? Array.from(room).map(socketId => {
      const userSocket = videoNamespace.sockets.get(socketId);
      return userSocket ? userSocket.userId : null;
    }).filter(Boolean) : [];
    
    // Notify the joining user about existing users
    socket.emit('users-in-room', usersInRoom);
    
    // Notify others about the new user
    socket.to(roomId).emit('user-joined-video', {
      userId,
      socketId: socket.id
    });
    
    console.log(`User ${userId} joined video room ${roomId}`);
  });

  // Leave video room
  socket.on('leave-video-room', (data) => {
    const { roomId, userId } = data;
    socket.leave(roomId);
    
    socket.to(roomId).emit('user-left-video', {
      userId,
      socketId: socket.id
    });
    
    console.log(`User ${userId} left video room ${roomId}`);
  });

  // WebRTC signaling
  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', {
      ...data,
      from: socket.userId
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', {
      ...data,
      from: socket.userId
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', {
      ...data,
      from: socket.userId
    });
  });

  // Video call controls
  socket.on('toggle-video', (data) => {
    socket.to(data.roomId).emit('user-toggle-video', {
      userId: socket.userId,
      isVideoOn: data.isVideoOn
    });
  });

  socket.on('toggle-audio', (data) => {
    socket.to(data.roomId).emit('user-toggle-audio', {
      userId: socket.userId,
      isAudioOn: data.isAudioOn
    });
  });

  socket.on('disconnect', () => {
    if (socket.roomId && socket.userId) {
      socket.to(socket.roomId).emit('user-left-video', {
        userId: socket.userId,
        socketId: socket.id
      });
    }
    console.log('User disconnected from video namespace:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize and start emergency monitoring
  const emergencyMonitor = new EmergencyMonitor();
  emergencyMonitor.start();
  
  // For development/testing, you can also run a manual check
  if (process.env.NODE_ENV === 'development') {
    console.log('Emergency Monitor: Development mode - manual check available');
  }
});

module.exports = { app, io };
