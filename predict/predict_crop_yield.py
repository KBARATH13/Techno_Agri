import joblib
import pandas as pd
import sys
import json
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
utils_path = os.path.join(current_dir, '..', 'translator')
if utils_path not in sys.path:
    sys.path.append(utils_path)

from translator import translate_to_tamil, translate_to_english

MODEL_PATH = 'D:/code/FinalYearProject/AI outsource/Models/crop_yield_model.joblib'
TRAINING_DATA_PATH = 'D:/code/FinalYearProject/AI outsource/DataSets/merged_yield_data.csv'

def standardize_district_name(district_name):
    if 'Chengalpattu MGR / Kanchipuram' in district_name:
        return 'Kanchipuram'
    elif 'South Arcot / Cuddalore' in district_name:
        return 'Cuddalore'
    elif 'North Arcot / Vellore' in district_name:
        return 'Vellore'
    elif 'Tiruchirapalli / Trichy' in district_name:
        return 'Tiruchirapalli'
    elif 'Ramananthapuram' in district_name:
        return 'Ramanathapuram'
    elif 'Thirunelveli' in district_name:
        return 'Tirunelveli'
    return district_name # Return original if no specific mapping

def get_unique_form_data(language='en'):
    """Loads unique crop names, district names, and seasons from the dataset."""
    unique_crops = []
    unique_districts = []
    unique_seasons = []

    if os.path.exists(TRAINING_DATA_PATH):
        try:
            data_df = pd.read_csv(TRAINING_DATA_PATH)
            data_df = data_df.rename(columns={
                'Area(*1000 ha)': 'Area_1000_ha',
                'Production(*1000 tons)': 'Production_1000_tons'
            })

            if 'Crop' in data_df.columns:
                unique_crops = sorted(data_df['Crop'].unique().tolist())
            if 'District_Name' in data_df.columns:
                unique_districts = sorted(data_df['District_Name'].apply(standardize_district_name).unique().tolist())
            if 'Season' in data_df.columns:
                unique_seasons = sorted(data_df['Season'].unique().tolist())
            else:
                print(f"Warning: 'Season' column not found in {TRAINING_DATA_PATH}", file=sys.stderr)

        except Exception as e:
            print(f"Warning: Could not load data from {TRAINING_DATA_PATH}: {e}", file=sys.stderr)
    else:
        print(f"Warning: Training data file not found at {TRAINING_DATA_PATH}", file=sys.stderr)

    if language == 'ta':
        unique_crops = list(dict.fromkeys([translate_to_tamil(c, 'crops') for c in unique_crops]))
        unique_districts = list(dict.fromkeys([translate_to_tamil(d, 'districts') for d in unique_districts]))
        unique_seasons = list(dict.fromkeys([translate_to_tamil(s, 'seasons') for s in unique_seasons]))

    return unique_crops, unique_districts, unique_seasons

def predict_crop_yield(district, crop_year, crop, area, area_unit, annual_rainfall, rainfall_unit, season, language='en'):
    """Loads the crop yield model and makes a prediction."""
    if not os.path.exists(MODEL_PATH):
        return {"error": f"Model file not found at '{MODEL_PATH}'"}

    try:
        model = joblib.load(MODEL_PATH)
    except Exception as e:
        return {"error": f"Error loading model: {e}"}

    if language == 'ta':
        district = translate_to_english(district, 'districts')
        crop = translate_to_english(crop, 'crops')
        season = translate_to_english(season, 'seasons')

    if district:
        district = district.upper()

    area_ha = area
    if area_unit == 'acres':
        area_ha = area * 0.404686 

    annual_rainfall_mm = annual_rainfall
    annual_rainfall_mm = annual_rainfall
    if rainfall_unit == 'cm':
        annual_rainfall_mm = annual_rainfall * 10 # 1 cm = 10 mm

    input_data = pd.DataFrame([[district, crop_year, crop, area_ha, annual_rainfall_mm, season]],
                              columns=['District_Name', 'Crop_Year', 'Crop', 'Area_ha', 'Annual_Rainfall_mm', 'Season'])
    
    try:
        prediction = model.predict(input_data)
        predicted_yield_kg_per_ha = prediction[0]

        return {"predicted_yield_kg_per_ha": predicted_yield_kg_per_ha}
    except Exception as e:
        return {"error": f"Error during prediction: {e}"}

if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        
        input_json = sys.stdin.read()
        data = json.loads(input_json)

        command = data.get("command")
        language = data.get("language", "en")

        if command == "get_form_data":
            unique_crops, unique_districts, unique_seasons = get_unique_form_data(language)
            response = {"crops": unique_crops, "districts": unique_districts, "seasons": unique_seasons}
        elif command == "predict":
            params = data.get("params", {})
            response = predict_crop_yield(
                district=params.get("district"),
                crop_year=int(params.get("crop_year")),
                crop=params.get("crop"),
                area=float(params.get("area")),
                area_unit=params.get("area_unit"),
                annual_rainfall=float(params.get("annual_rainfall")),
                rainfall_unit=params.get("rainfall_unit"),
                season=params.get("season"),
                language=language
            )
        else:
            response = {"error": "Invalid command specified"}

        print(json.dumps(response, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"error": f"An unexpected error occurred: {e}"}), file=sys.stderr)
        sys.exit(1)
