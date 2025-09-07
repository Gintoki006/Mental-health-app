from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import time
from datetime import datetime
from gemini_chatbot import GeminiChatbot
from gemini_mood_detector import GeminiMoodDetector

# Try to load environment variables, but don't fail if .env doesn't exist
try:
    load_dotenv()
except:
    pass

app = Flask(__name__)
CORS(app)

# Initialize Gemini services
try:
    chatbot = GeminiChatbot()
    mood_detector = GeminiMoodDetector()
    print("✅ Gemini services initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize Gemini services: {e}")
    chatbot = None
    mood_detector = None

@app.route('/health', methods=['GET']) 
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'gemini_available': chatbot is not None and mood_detector is not None
    })

@app.route('/chat', methods=['POST'])
def chat():
    """Chat endpoint with mood detection and Gemini-powered responses in chronological order"""
    try:
        data = request.get_json()
        user_message_text = data.get('message', '').strip()
        user_id = data.get('userId', 'anonymous')
        conversation_history = data.get('conversationHistory', [])

        if not user_message_text:
            return jsonify({'success': False, 'error': 'Message is required'}), 400

        # Prepare user message object
        user_message = {
            'id': str(int(time.time() * 1000)),
            'message': user_message_text,
            'isBot': False,
            'timestamp': datetime.utcnow().isoformat(),
            'userId': user_id
        }

        # Store user message in mood detector (optional)
        mood_analysis = None
        if mood_detector:
            mood_analysis = mood_detector.detect_mood(user_message_text)
            if mood_analysis['success']:
                mood_detector.store_user_score(
                    user_id=user_id,
                    score=mood_analysis['score'],
                    emotion=mood_analysis['emotion'],
                    confidence=mood_analysis['confidence'],
                    text=user_message_text
                )

        # Generate bot response
        if chatbot:
            bot_resp = chatbot.generate_response(
                user_message=user_message_text,
                conversation_history=conversation_history
            )
            bot_message = {
                'id': str(int(time.time() * 1000) + 1),
                'message': bot_resp['message'],
                'isBot': True,
                'timestamp': datetime.utcnow().isoformat(),
                'userId': 'bot',
                'moodAnalysis': mood_analysis,
                'suggestions': bot_resp.get('suggestions', [])
            }
        else:
            bot_message = {
                'id': str(int(time.time() * 1000) + 1),
                'message': "I'm sorry, the AI service is currently unavailable.",
                'isBot': True,
                'timestamp': datetime.utcnow().isoformat(),
                'userId': 'bot'
            }

        # Merge messages
        all_messages = conversation_history + [user_message, bot_message]

        # Sort messages chronologically by timestamp
        all_messages.sort(key=lambda x: x['timestamp'])

        # Check for emergency
        emergency_triggered = False
        crisis_detection = None
        if mood_analysis and mood_analysis['success'] and mood_detector:
            emergency_triggered = mood_detector.should_trigger_emergency_alert(user_id, mood_analysis['score'])
            crisis_detection = mood_detector.detect_crisis_situation(user_message_text, mood_analysis)
            if crisis_detection['requires_immediate_intervention']:
                emergency_triggered = True

        # Prepare result for frontend
        result = {
            'success': True,
            'response': bot_message['message'],
            'messages': all_messages,          # Include full chat in chronological order
            'moodAnalysis': mood_analysis,
            'suggestions': bot_message.get('suggestions', []),
            'emergencyTriggered': emergency_triggered,
            'crisisDetection': crisis_detection,
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({'success': False, 'error': f'Internal server error: {str(e)}'}), 500



@app.route('/detect-emotion', methods=['POST'])
def detect_emotion():
    """Detect emotion from text"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        user_id = data.get('userId', 'anonymous')
        
        if not text:
            return jsonify({
                'success': False,
                'error': 'Text is required'
            }), 400
        
        if not mood_detector:
            return jsonify({
                'success': False,
                'error': 'Mood detection service not available'
            }), 503
        
        # Detect mood
        mood_analysis = mood_detector.detect_mood(text)
        
        if mood_analysis['success']:
            # Store mood data
            mood_detector.store_user_score(
                user_id=user_id,
                score=mood_analysis['score'],
                emotion=mood_analysis['emotion'],
                confidence=mood_analysis['confidence'],
                text=text
            )
            
            # Check for significant deviation
            deviation_analysis = mood_detector.detect_significant_deviation(
                user_id, mood_analysis['score']
            )
            
            # Check for emergency alert
            emergency_triggered = mood_detector.should_trigger_emergency_alert(
                user_id, mood_analysis['score']
            )
            
            return jsonify({
                'success': True,
                'emotion': mood_analysis['emotion'],
                'confidence': mood_analysis['confidence'],
                'score': mood_analysis['score'],
                'intensity': mood_analysis['intensity'],
                'sentiment': mood_analysis['sentiment'],
                'secondary_emotions': mood_analysis['secondary_emotions'],
                'keywords': mood_analysis['keywords'],
                'deviationAnalysis': deviation_analysis,
                'emergencyTriggered': emergency_triggered
            })
        else:
            return jsonify({
                'success': False,
                'error': mood_analysis['error']
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/user-mood-stats', methods=['POST'])
def get_user_mood_stats():
    """Get user mood statistics and trend data"""
    try:
        data = request.get_json()
        user_id = data.get('userId', 'anonymous')
        days = data.get('days', 30)
        
        if not mood_detector:
            return jsonify({
                'success': False,
                'error': 'Mood detection service not available'
            }), 503
        
        # Get mood statistics
        stats = mood_detector.get_mood_statistics(user_id, days)
        trend = mood_detector.get_mood_trend(user_id, days)
        
        return jsonify({
            'success': True,
            'statistics': stats,
            'trend': trend
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/analyze-text', methods=['POST'])
def analyze_text():
    """Comprehensive text analysis"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        user_id = data.get('userId', 'anonymous')
        
        if not text:
            return jsonify({
                'success': False,
                'error': 'Text is required'
            }), 400
        
        if not mood_detector:
            return jsonify({
                'success': False,
                'error': 'Mood detection service not available'
            }), 503
        
        # Analyze text
        mood_analysis = mood_detector.detect_mood(text)
        
        if mood_analysis['success']:
            # Store mood data
            mood_detector.store_user_score(
                user_id=user_id,
                score=mood_analysis['score'],
                emotion=mood_analysis['emotion'],
                confidence=mood_analysis['confidence'],
                text=text
            )
            
            # Get user statistics
            stats = mood_detector.get_mood_statistics(user_id, 30)
            trend = mood_detector.get_mood_trend(user_id, 30)
            
            # Check for deviation
            deviation_analysis = mood_detector.detect_significant_deviation(
                user_id, mood_analysis['score']
            )
            
            return jsonify({
                'success': True,
                'moodAnalysis': mood_analysis,
                'statistics': stats,
                'trend': trend,
                'deviationAnalysis': deviation_analysis
            })
        else:
            return jsonify({
                'success': False,
                'error': mood_analysis['error']
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/emergency-support', methods=['GET'])
def emergency_support():
    """Get emergency support resources"""
    if chatbot:
        response = chatbot.get_emergency_response()
        return jsonify(response)
    else:
        return jsonify({
            'message': "Emergency support is currently unavailable. Please contact:\n\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n• Emergency Services: 911",
            'success': True,
            'error': None
        })

@app.route('/coping-strategies', methods=['POST'])
def get_coping_strategies():
    """Get personalized coping strategies based on emotion"""
    try:
        data = request.get_json()
        emotion = data.get('emotion', 'neutral')
        intensity = data.get('intensity', 'medium')
        
        if not chatbot:
            return jsonify({
                'success': False,
                'error': 'Chatbot service not available'
            }), 503
        
        strategies = chatbot.get_coping_strategies(emotion, intensity)
        return jsonify(strategies)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/crisis-check', methods=['POST'])
def crisis_check():
    """Check for crisis indicators in text"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({
                'success': False,
                'error': 'Text is required'
            }), 400
        
        if not mood_detector:
            return jsonify({
                'success': False,
                'error': 'Mood detection service not available'
            }), 503
        
        # Detect mood first
        mood_analysis = mood_detector.detect_mood(text)
        
        # Check for crisis
        crisis_detection = mood_detector.detect_crisis_situation(text, mood_analysis)
        
        return jsonify({
            'success': True,
            'moodAnalysis': mood_analysis,
            'crisisDetection': crisis_detection
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"🚀 Starting AI service on port {port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"🤖 Gemini API available: {chatbot is not None and mood_detector is not None}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)