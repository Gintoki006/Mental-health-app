import google.generativeai as genai
import os
import json
from dotenv import load_dotenv
from datetime import datetime, timedelta
import statistics

# Load environment variables
try:
    load_dotenv()
except:
    pass

class GeminiMoodDetector:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key or self.api_key == 'your-gemini-api-key-here':
            print("⚠️  GEMINI_API_KEY not configured - running in demo mode")
            self.model = None
            return

        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')

        # User mood history storage
        self.user_mood_history = {}

        # Emotion-to-score mapping
        self.emotion_scores = {
            # Positive emotions
            'joy': 9, 'happiness': 9, 'elation': 9, 'euphoria': 10,
            'excitement': 8, 'enthusiasm': 8, 'contentment': 7, 'satisfaction': 7,
            'gratitude': 8, 'love': 9, 'hope': 7, 'optimism': 7, 'confidence': 7,
            'pride': 7, 'peace': 7, 'serenity': 7, 'tranquility': 7,
            # Neutral emotions
            'neutral': 5, 'calm': 6, 'relaxed': 6, 'balanced': 6, 'curious': 6,
            'interested': 6, 'focused': 6, 'contemplative': 5, 'reflective': 5,
            'thoughtful': 5,
            # Negative emotions
            'sadness': 3, 'grief': 2, 'sorrow': 2, 'melancholy': 3,
            'depression': 2, 'despair': 1, 'hopelessness': 1,
            'anxiety': 3, 'stress': 4, 'overwhelmed': 3,
            'anger': 3, 'frustration': 4, 'loneliness': 3,
            'shame': 3, 'guilt': 3, 'confusion': 4, 'disappointment': 4,
            'exhaustion': 3, 'fear': 3, 'nervousness': 4
        }

    def detect_mood(self, text):
        """Detect mood from text using Gemini API"""
        try:
            if self.model is None:
                # Demo mode
                return {
                    'emotion': 'neutral',
                    'confidence': 0.5,
                    'score': 5,
                    'intensity': 'medium',
                    'sentiment': 'neutral',
                    'secondary_emotions': [],
                    'keywords': ['demo', 'mode'],
                    'success': True,
                    'error': None
                }

            prompt = f"""
You are a mental health AI. Analyze this text for emotional content:
"{text}"

Return a JSON object with:
- primary_emotion
- sentiment
- secondary_emotions (optional)
- intensity (low, medium, high)
- keywords (optional)
- crisis_indicators (optional)
Respond ONLY in JSON.
"""
            response = self.model.generate_content(prompt)

            try:
                mood_data = json.loads(response.text.strip())
            except json.JSONDecodeError:
                mood_data = {}

            # Parse Gemini response
            primary_emotion = (
                mood_data.get('primary_emotion') or
                mood_data.get('emotion') or
                mood_data.get('mood') or
                'neutral'
            ).lower()

            sentiment = (mood_data.get('sentiment') or 'neutral').lower()

            secondary_emotions = (
                mood_data.get('secondary_emotions') or
                mood_data.get('emotions') or
                mood_data.get('other_emotions') or []
            )

            confidence = mood_data.get('confidence', 0.8)
            intensity = mood_data.get('intensity', 'medium')
            keywords = mood_data.get('keywords', [])
            crisis_indicators = mood_data.get('crisis_indicators', [])

            # Calculate score
            base_score = self.emotion_scores.get(primary_emotion, 5)
            intensity_multiplier = {'low': 0.8, 'medium': 1.0, 'high': 1.2}.get(intensity, 1.0)
            final_score = max(1, min(10, int(base_score * confidence * intensity_multiplier)))

            return {
                'emotion': primary_emotion,
                'confidence': confidence,
                'score': final_score,
                'intensity': intensity,
                'sentiment': sentiment,
                'secondary_emotions': secondary_emotions,
                'keywords': keywords,
                'crisis_indicators': crisis_indicators,
                'success': True,
                'error': None
            }

        except Exception as e:
            return {
                'emotion': 'neutral',
                'confidence': 0.5,
                'score': 5,
                'intensity': 'medium',
                'sentiment': 'neutral',
                'secondary_emotions': [],
                'keywords': [],
                'crisis_indicators': [],
                'success': False,
                'error': str(e)
            }

    def store_user_score(self, user_id, score, emotion, confidence, text=""):
        """Store user's mood score in history"""
        entry = {
        'timestamp': datetime.now().isoformat(),
        'score': score,
        'emotion': emotion,
        'confidence': confidence,
        'text': text
    }

        if user_id not in self.user_mood_history:
            self.user_mood_history[user_id] = []

        # Append instead of insert at 0
        self.user_mood_history[user_id].append(entry)
        
        # Keep only last 100 entries
        if len(self.user_mood_history[user_id]) > 100:
            self.user_mood_history[user_id] = self.user_mood_history[user_id][-100:]

    def get_mood_statistics(self, user_id, days=30):
        """Get mood statistics for a user"""
        if user_id not in self.user_mood_history:
            return {'average_score': 5, 'min_score': 5, 'max_score': 5, 'total_entries': 0, 'trend': 'stable'}

        cutoff_date = datetime.now() - timedelta(days=days)
        recent_entries = [
            entry for entry in self.user_mood_history[user_id]
            if datetime.fromisoformat(entry['timestamp']) >= cutoff_date
        ]

        if not recent_entries:
            return {'average_score': 5, 'min_score': 5, 'max_score': 5, 'total_entries': 0, 'trend': 'stable'}

        scores = [entry['score'] for entry in recent_entries]

        # Calculate trend
        if len(scores) >= 7:
            recent_week = scores[-7:]
            older_week = scores[-14:-7] if len(scores) >= 14 else scores[:-7]

            if recent_week and older_week:
                recent_avg = statistics.mean(recent_week)
                older_avg = statistics.mean(older_week)
                if recent_avg > older_avg + 0.5:
                    trend = 'improving'
                elif recent_avg < older_avg - 0.5:
                    trend = 'declining'
                else:
                    trend = 'stable'
            else:
                trend = 'stable'
        else:
            trend = 'stable'

        return {
            'average_score': round(statistics.mean(scores), 2),
            'min_score': min(scores),
            'max_score': max(scores),
            'total_entries': len(scores),
            'trend': trend
        }

    def get_mood_trend(self, user_id, days=30):
        """Get daily mood trend for charting"""
        if user_id not in self.user_mood_history:
            return []

        daily_scores = {}
        cutoff_date = datetime.now() - timedelta(days=days)

        for entry in self.user_mood_history[user_id]:
            entry_date = datetime.fromisoformat(entry['timestamp']).date()
            if entry_date >= cutoff_date.date():
                daily_scores.setdefault(entry_date, []).append(entry['score'])

        trend_data = []
        for date in sorted(daily_scores.keys()):
            avg_score = statistics.mean(daily_scores[date])
            trend_data.append({
                'date': date.isoformat(),
                'score': round(avg_score, 2),
                'count': len(daily_scores[date])
            })

        return trend_data

    def detect_significant_deviation(self, user_id, current_score, lookback_days=7, threshold_percentage=0.2):
        """Detect if current score represents a significant deviation"""
        if user_id not in self.user_mood_history:
            return {'is_deviation': False, 'deviation_type': 'none', 'percentage_change': 0, 'average_score': current_score}

        cutoff_date = datetime.now() - timedelta(days=lookback_days)
        recent_entries = [
            entry for entry in self.user_mood_history[user_id]
            if datetime.fromisoformat(entry['timestamp']) >= cutoff_date
        ]

        if len(recent_entries) < 3:
            return {'is_deviation': False, 'deviation_type': 'none', 'percentage_change': 0, 'average_score': current_score}

        recent_scores = [entry['score'] for entry in recent_entries]
        average_score = statistics.mean(recent_scores)
        percentage_change = abs(current_score - average_score) / average_score if average_score > 0 else 0
        is_deviation = percentage_change >= threshold_percentage
        deviation_type = 'none'
        if is_deviation:
            deviation_type = 'decline' if current_score < average_score else 'improvement'

        return {
            'is_deviation': is_deviation,
            'deviation_type': deviation_type,
            'percentage_change': round(percentage_change * 100, 2),
            'average_score': round(average_score, 2)
        }

    def should_trigger_emergency_alert(self, user_id, current_score, critical_threshold=2, drop_percentage=0.5):
        """Determine if emergency alert should be triggered"""
        if current_score <= critical_threshold:
            return True
        deviation = self.detect_significant_deviation(user_id, current_score)
        return deviation['is_deviation'] and deviation['deviation_type'] == 'decline' and deviation['percentage_change'] >= drop_percentage * 100

    def detect_crisis_situation(self, text, mood_analysis=None):
        """Detect if the text indicates a crisis situation"""
        try:
            crisis_indicators = [
                'suicide', 'kill myself', 'end it all', 'not worth living',
                'better off dead', 'want to die', 'hurt myself', 'self harm',
                'cut myself', 'overdose', 'jump off', 'hang myself',
                'no point', 'hopeless', "can't go on", 'give up',
                'nobody cares', 'alone forever', 'worthless', 'burden',
                'final goodbye', 'last time', 'goodbye forever'
            ]

            text_lower = text.lower()
            found_indicators = [i for i in crisis_indicators if i in text_lower]
            mood_crisis_indicators = mood_analysis.get('crisis_indicators', []) if mood_analysis else []

            crisis_level = 'none'
            if found_indicators or mood_crisis_indicators:
                if any(severe in text_lower for severe in ['suicide', 'kill myself', 'end it all', 'hurt myself']):
                    crisis_level = 'severe'
                elif any(moderate in text_lower for moderate in ['hopeless', 'worthless', 'give up', 'no point']):
                    crisis_level = 'moderate'
                else:
                    crisis_level = 'mild'

            return {
                'is_crisis': crisis_level != 'none',
                'crisis_level': crisis_level,
                'text_indicators': found_indicators,
                'mood_indicators': mood_crisis_indicators,
                'all_indicators': found_indicators + mood_crisis_indicators,
                'requires_immediate_intervention': crisis_level in ['severe', 'moderate']
            }
        except Exception as e:
            return {
                'is_crisis': False,
                'crisis_level': 'none',
                'text_indicators': [],
                'mood_indicators': [],
                'all_indicators': [],
                'requires_immediate_intervention': False,
                'error': str(e)
            }
