import google.generativeai as genai
import os
from dotenv import load_dotenv

# Try to load .env file, but don't fail if it doesn't exist
try:
    load_dotenv()
except:
    pass

class GeminiChatbot:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key or self.api_key == 'your-gemini-api-key-here':
            print("⚠️  GEMINI_API_KEY not configured - running in demo mode")
            self.model = None
            return
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self.user_messages = {} 
        # Mental health context and instructions
        self.system_prompt = """
You are a compassionate mental health support companion.
Your responsibilities:

Listen with empathy and understanding.

Keep responses short (3–5 sentences maximum).

Use a warm, supportive, and non-judgmental tone.

Provide practical coping tips (e.g., deep breathing, journaling, grounding).

Ask gentle clarifying questions to better understand the user.

Encourage seeking professional help if the user expresses severe distress.

Never give medical diagnoses or replace therapy.

Style guidelines:

Write in short, clear paragraphs.

Use simple, everyday language.

Where helpful, format with bullets, bold, or line breaks for readability.

Always validate the user’s feelings first, then offer gentle suggestions.

Remember: You are here to support, not to solve.
"""

    def generate_response(self, user_message, conversation_history=None):
        """
        Generate a response using Gemini API with mental health context
        
        Args:
            user_message (str): The user's message
            conversation_history (list): Previous conversation context
            
        Returns:
            dict: Response with message, mood analysis, and suggestions
        """
        try:
            if self.model is None:
                return {
                    'message': "I'm here to listen and support you. While the AI features are not fully configured, I want you to know that your feelings are valid and important. If you're struggling, please consider reaching out to a mental health professional or a trusted friend.",
                    'success': True,
                    'error': None
                }
            
            # Build conversation context
            context = self.system_prompt + "\n\n"
            
            if conversation_history:
                context += "Previous conversation:\n"
                for msg in conversation_history[-5:]:  # Last 5 messages for context
                    context += f"User: {msg.get('user', '')}\n"
                    context += f"Assistant: {msg.get('assistant', '')}\n"
                context += "\n"
            
            context += f"Current user message: {user_message}\n\n"
            context += "Please provide a supportive, empathetic response that addresses their concerns and offers helpful coping strategies."
            
            # Generate response
            response = self.model.generate_content(context)
            
            return {
                'message': response.text,
                'success': True,
                'error': None
            }
            
        except Exception as e:
            return {
                'message': "I'm sorry, I'm having trouble processing your message right now. Please try again or reach out to a mental health professional if you need immediate support.",
                'success': False,
                'error': str(e)
            }
# key: user_id, value: list of messages

    def store_message(self, user_id, user_msg, assistant_msg):
        if user_id not in self.user_messages:
            self.user_messages[user_id] = []
        self.user_messages[user_id].append({
            'user': user_msg,
            'assistant': assistant_msg
        })

    def get_emergency_response(self):
        """Get emergency support response"""
        return {
            'message': "I'm concerned about your wellbeing. Please consider reaching out to:\n\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n• Emergency Services: 911\n\nYou're not alone, and there are people who want to help you.",
            'success': True,
            'error': None
        }
