from flask import Flask, request, jsonify
from flask_cors import CORS  # ✅ Import Flask-CORS
import os
import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)  # ✅ Enable CORS for all routes

# Load the data from the JSON file
DATA_FILE_PATH = os.path.join(os.path.dirname(__file__), "data.json")

try:
    with open(DATA_FILE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    df = pd.DataFrame(data)
except Exception as e:
    print(f"Error loading data.json: {e}")
    df = pd.DataFrame([])  # Fallback to empty DataFrame

# Function to generate keywords based on personality and relationship type
def generate_keywords(personality, relationship_type):
    return personality + [relationship_type]


# Function to recommend multiple gifts
def recommend_gifts(user_interest, user_category, user_personality, user_relationship_type):
    # Step 1: Filter by interest
    filtered_data = [item for item in df.to_dict(orient='records') if item['interest'] == user_interest]

    # Step 2: Filter by category
    valid_categories = list(range(1, user_category + 1))
    filtered_data = [
        item for item in filtered_data 
        if isinstance(item['category'], list) and any(c in valid_categories for c in item['category']) 
        or item['category'] in valid_categories
    ]

    # Step 3: Generate keywords
    user_keywords = generate_keywords(user_personality, user_relationship_type)
    user_keywords = list(map(str, user_keywords))  # Convert to string

    # Step 4: Calculate similarity
    gift_scores = []
    for item in filtered_data:
        gift_keywords = generate_keywords(item['personality'], item['relationship_type'])
        gift_keywords = list(map(str, gift_keywords))  # Convert to string

        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([' '.join(user_keywords), ' '.join(gift_keywords)])
        cos_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

        # Append all gift scores without a threshold
        gift_scores.append((item['title'], cos_sim))

    # Sort and return top 5 gifts based on similarity
    gift_scores.sort(key=lambda x: x[1], reverse=True)
    recommended_gifts = [gift[0] for gift in gift_scores[:5]]

    return recommended_gifts if recommended_gifts else ["No suitable gift found."]


@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.json
        print("Received request data:", data)
        print("\nReceived request data:")
        print(json.dumps(data, indent=4))  # Pretty-print JSON request

        # Log each value separately
        print(f"Category: {data.get('category', 'MISSING')}")
        print(f"Interest: {data.get('interest', 'MISSING')}")
        print(f"Personality: {data.get('personality', 'MISSING')}")
        print(f"Relationship Type: {data.get('relationshipType', 'MISSING')}")

        user_interest = data.get("interest", "")
        user_category = int(data.get("category", "1"))  # Convert to integer
        user_personality = data.get("personality", [])
        user_relationship_type = data.get("relationshipType", "")

        if isinstance(user_personality, str):
            user_personality = [user_personality]

        recommended_gifts = recommend_gifts(user_interest, user_category, user_personality, user_relationship_type)

        print("Recommended gifts:", recommended_gifts)
        return jsonify({"recommendation": recommended_gifts})

    except Exception as e:
        print("Error in /recommend route:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask app...")
    

    app.run(debug=True)
