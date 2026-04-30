import joblib
import pandas as pd
import sys
import json
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
utils_path = os.path.join(current_dir, '..', 'translator')
if utils_path not in sys.path:
    sys.path.append(utils_path)

from translator import translate_to_tamil

MODEL_PATH = 'D:/code/FinalYearProject/AI outsource/Models/crop_recommender_model.joblib'

def predict_crop_recommendation(N, P, K, temperature, humidity, ph, rainfall, language='en'):
    """Loads the crop recommender model and makes a prediction."""
    if not os.path.exists(MODEL_PATH):
        return {"error": f"Model file not found at '{MODEL_PATH}'"}

    try:
        model = joblib.load(MODEL_PATH)
    except Exception as e:
        return {"error": f"Error loading model: {e}"}

    input_data = pd.DataFrame([[N, P, K, temperature, humidity, ph, rainfall]],
                              columns=['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'])

    try:
        prediction = model.predict(input_data)
        recommended_crop = prediction[0]
        print(f"DEBUG: Raw model prediction: '{recommended_crop}'", file=sys.stderr) # DEBUG
    except Exception as e:
        return {"error": f"Error during prediction: {e}"}

    if language == 'ta':
        print(f"DEBUG: Attempting to translate '{recommended_crop}' to Tamil.", file=sys.stderr) # DEBUG
        translated_crop = translate_to_tamil(recommended_crop, 'crops')
        print(f"DEBUG: Translation result: '{translated_crop}'", file=sys.stderr) # DEBUG
        recommended_crop = translated_crop

    return {"recommended_crop": recommended_crop}

if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding='utf-8')

        input_json = sys.stdin.read()
        data = json.loads(input_json)

        language = data.get("language", "en")
        params = data.get("params", {})

        response = predict_crop_recommendation(
            N=float(params.get("N")),
            P=float(params.get("P")),
            K=float(params.get("K")),
            temperature=float(params.get("temperature")),
            humidity=float(params.get("humidity")),
            ph=float(params.get("ph")),
            rainfall=float(params.get("rainfall")),
            language=language
        )

        print(json.dumps(response, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"error": f"An unexpected error occurred: {e}"}), file=sys.stderr)
        sys.exit(1)

