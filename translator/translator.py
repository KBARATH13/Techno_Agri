import json
import os
import sys

# Ensure the utils directory is in the Python path
# This allows the script to be run from the project root or from the AI directory
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, '..', '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Path to the translation file
TRANSLATION_FILE_PATH = os.path.join(current_dir, '..', '..', 'frontend', 'src', 'translations', 'data_translations.json')

def _load_translations():
    """Loads the translation dictionary from the JSON file."""
    if not os.path.exists(TRANSLATION_FILE_PATH):
        # Return an empty structure if the file doesn't exist
        return {"crops": {}, "districts": {}, "seasons": {}}
    try:
        with open(TRANSLATION_FILE_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Convert crop keys to lowercase for consistent lookup
            if "crops" in data:
                data["crops"] = {k.lower(): v for k, v in data["crops"].items()}
            return data
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error loading translation file: {e}", file=sys.stderr)
        # Return an empty structure on error
        return {"crops": {}, "districts": {}, "seasons": {}}

# Load translations once when the module is imported
_translations = _load_translations()
_reversed_translations = {
    category: {v: k for k, v in items.items()}
    for category, items in _translations.items()
}

def _find_category(text_to_find):
    """Finds which category a given English or Tamil text belongs to."""
    # Check English names first
    for category, items in _translations.items():
        if text_to_find in items:
            return category
    # Check Tamil names
    for category, items in _reversed_translations.items():
        if text_to_find in items:
            return category
    return None

def translate_to_tamil(english_text, category=None):
    """
    Translates an English text to Tamil.
    If category is not provided, it will try to find it.
    """
    if not english_text:
        return ""
    if category is None:
        category = _find_category(english_text)

    if category and category in _translations:
        if category == 'crops':
            return _translations[category].get(english_text.lower(), english_text)
        else:
            return _translations[category].get(english_text, english_text)
    return english_text # Return original text if no category or translation found

def translate_to_english(tamil_text, category=None):
    """
    Translates a Tamil text to English.
    If category is not provided, it will try to find it.
    """
    if not tamil_text:
        return ""
    if category is None:
        category = _find_category(tamil_text)

    if category and category in _reversed_translations:
        return _reversed_translations[category].get(tamil_text, tamil_text)
    return tamil_text # Return original text if no category or translation found

# Example usage for testing
if __name__ == '__main__':
    # This block will only run when the script is executed directly
    # It won't run when imported by other scripts.
    sys.stdout.reconfigure(encoding='utf-8')
    print("--- Translator Test ---")
    print(f"Loading translations from: {TRANSLATION_FILE_PATH}")
    print(f"Loaded {_translations.keys()} categories.")

    # Create a dummy translation file for testing if it doesn't exist
    if not os.path.exists(TRANSLATION_FILE_PATH):
        print("Creating dummy translation file for testing...")
        dummy_data = {
            "crops": {
                "Paddy": "நெல்",
                "Maize": "மக்காச்சோளம்"
            },
            "districts": {
                "Ariyalur": "அரியலூர்",
                "Chennai": "சென்னை"
            },
            "seasons": {
                "Kharif": "காரிஃப்",
                "Rabi": "ரபி"
            }
        }
        with open(TRANSLATION_FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(dummy_data, f, ensure_ascii=False, indent=2)
        # Reload translations after creating the dummy file
        _translations = _load_translations()
        _reversed_translations = {
            category: {v: k for k, v in items.items()}
            for category, items in _translations.items()
        }

    # --- Test Cases ---
    english_crop = "Paddy"
    tamil_crop = translate_to_tamil(english_crop, 'crops')
    print(f"'{english_crop}' -> '{tamil_crop}'")

    tamil_district = "சென்னை"
    english_district = translate_to_english(tamil_district, 'districts')
    print(f"'{tamil_district}' -> '{english_district}'")

    # Test without category
    print("\n--- Testing without category hint ---")
    print(f"'Maize' -> '{translate_to_tamil('Maize')}'")
    print(f"'காரிஃப்' -> '{translate_to_english('காரிஃப்')}'")

    # Test not found
    print("\n--- Testing not found ---")
    print(f"'UnknownCrop' -> '{translate_to_tamil('UnknownCrop')}'")
    print(f"'தெரியாத பயிர்' -> '{translate_to_english('தெரியாத பயிர்')}'")

    # Clean up dummy file
    if 'dummy_data' in locals():
        print("\nCleaning up dummy translation file.")
        os.remove(TRANSLATION_FILE_PATH)
