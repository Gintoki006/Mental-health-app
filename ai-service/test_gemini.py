#!/usr/bin/env python3
"""
Test script for Gemini AI integration
Run this to verify the Gemini API is working correctly
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from gemini_chatbot import GeminiChatbot
from gemini_mood_detector import GeminiMoodDetector

def test_gemini_integration():
    """Test the Gemini AI integration"""
    print("🧪 Testing Gemini AI Integration...")
    print("=" * 50)
    
    # Check if API key is set
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key or api_key == 'your-gemini-api-key-here':
        print("❌ GEMINI_API_KEY not set or using placeholder value")
        print("Please set your actual Gemini API key in .env file")
        return False
    
    try:
        # Test chatbot initialization
        print("🤖 Initializing chatbot...")
        chatbot = GeminiChatbot()
        print("✅ Chatbot initialized successfully")
        
        # Test mood detector initialization
        print("😊 Initializing mood detector...")
        mood_detector = GeminiMoodDetector()
        print("✅ Mood detector initialized successfully")
        
        # Test mood detection
        print("\n🔍 Testing mood detection...")
        test_texts = [
            "I'm feeling really happy today!",
            "I'm so stressed and overwhelmed with work",
            "I don't know what to do, everything seems hopeless"
        ]
        
        for text in test_texts:
            print(f"\nText: '{text}'")
            mood_analysis = mood_detector.detect_mood(text)
            if mood_analysis['success']:
                print(f"  Emotion: {mood_analysis['emotion']}")
                print(f"  Score: {mood_analysis['score']}/10")
                print(f"  Confidence: {mood_analysis['confidence']:.2f}")
                print(f"  Sentiment: {mood_analysis['sentiment']}")
                if mood_analysis.get('crisis_indicators'):
                    print(f"  ⚠️  Crisis indicators: {mood_analysis['crisis_indicators']}")
            else:
                print(f"  ❌ Error: {mood_analysis['error']}")
        
        # Test chatbot response
        print("\n💬 Testing chatbot response...")
        test_message = "I'm feeling anxious about my job interview tomorrow"
        response = chatbot.generate_response(test_message)
        
        if response['success']:
            print(f"User: {test_message}")
            print(f"Bot: {response['message'][:200]}...")
        else:
            print(f"❌ Error: {response['error']}")
        
        # Test crisis detection
        print("\n🚨 Testing crisis detection...")
        crisis_text = "I don't see any point in living anymore"
        crisis_detection = mood_detector.detect_crisis_situation(crisis_text)
        print(f"Crisis detected: {crisis_detection['is_crisis']}")
        print(f"Crisis level: {crisis_detection['crisis_level']}")
        if crisis_detection['all_indicators']:
            print(f"Indicators: {crisis_detection['all_indicators']}")
        
        print("\n✅ All tests completed successfully!")
        print("🎉 Gemini AI integration is working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Make sure GEMINI_API_KEY is set correctly in .env")
        print("2. Check your internet connection")
        print("3. Verify your Gemini API key is valid")
        print("4. Make sure you have the required dependencies installed")
        return False

if __name__ == "__main__":
    success = test_gemini_integration()
    sys.exit(0 if success else 1)




