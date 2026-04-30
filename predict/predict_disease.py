import sys
import json
import os
import tensorflow as tf
import numpy as np

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
MODEL_PATH = 'D:/code/FinalYearProject/AI outsource/Models/disease_detection_model'
IMAGE_SIZE = (224, 224) 

# Keywords that indicate the image is likely a plant or leaf
PLANT_KEYWORDS = [
    'leaf', 'plant', 'tree', 'flower', 'vegetable', 'fruit', 'forest', 'garden', 
    'greenhouse', 'corn', 'maize', 'grass', 'vine', 'shrub', 'bush', 'produce', 
    'herb', 'flora', 'botany', 'nature', 'petal', 'stem', 'branch', 'citrus',
    'apple', 'tomato', 'potato', 'grape', 'strawberry', 'blackberry', 'raspberry',
    'blueberry', 'peach', 'cherry', 'pepper', 'squash', 'melon', 'banana',
    'potted plant', 'pot', 'earth', 'soil', 'ground', 'field', 'agriculture'
]

# Load Models
try:
    import contextlib
    # Redirect stdout to stderr during model loading to avoid "Downloading..." messages in JSON output
    with contextlib.redirect_stdout(sys.stderr):
        # 1. Load Main Disease Detection Model
        model_layer = tf.keras.layers.TFSMLayer(MODEL_PATH, call_endpoint='serving_default')
        inputs = tf.keras.Input(shape=(IMAGE_SIZE[0], IMAGE_SIZE[1], 3), name='input')
        output_key = list(model_layer(inputs).keys())[0]
        model = tf.keras.Model(inputs=inputs, outputs=model_layer(inputs)[output_key])
        
        # 2. Load General Classifier for Validation
        # Use MobileNetV2 pre-trained on ImageNet
        gen_classifier = tf.keras.applications.MobileNetV2(weights='imagenet')
    
    print("Models loaded successfully.", file=sys.stderr)
except Exception as e:
    print(json.dumps({"error": f"Failed to load models: {e}"}), file=sys.stderr)
    sys.exit(1)

def preprocess_image(image_path, target_size):
    img = tf.io.read_file(image_path)
    img = tf.image.decode_jpeg(img, channels=3)
    img = tf.image.resize(img, target_size)
    return img

def validate_leaf(image_path):
    """Checks if the image contains plant-related objects using ImageNet labels."""
    try:
        img = preprocess_image(image_path, (224, 224))
        # MobileNetV2 expects preprocessing in [-1, 1] range
        img = tf.keras.applications.mobilenet_v2.preprocess_input(img)
        img = np.expand_dims(img, axis=0)
        
        preds = gen_classifier.predict(img, verbose=0)
        decoded = tf.keras.applications.mobilenet_v2.decode_predictions(preds, top=5)[0]
        
        # Check if any of the top predicted labels match plant keywords
        found_keywords = []
        for _, label, score in decoded:
            label_lower = label.lower().replace('_', ' ')
            for kw in PLANT_KEYWORDS:
                if kw in label_lower:
                    found_keywords.append((label, score))
                    break
        
        # If any plant keyword is found in top predictions, consider it a plant/leaf
        is_leaf = len(found_keywords) > 0
        return is_leaf, decoded
    except Exception as e:
        print(f"Validation error: {e}", file=sys.stderr)
        return True, [] # Fallback to True if validation fails to avoid blocking

# Dynamically load class names for the disease model
TRAIN_DIR = 'D:/code/FinalYearProject/AI outsource/DataSets/processed_plantvillage_dataset/train'
try:
    class_names = sorted(os.listdir(TRAIN_DIR))
    if not class_names:
        raise ValueError("No class directories found in the training path.")
except Exception as e:
    print(json.dumps({"error": f"Failed to load class names: {e}"}), file=sys.stderr)
    sys.exit(1)

def predict_disease(image_path):
    if not os.path.exists(image_path):
        return {"error": f"Image file not found at {image_path}"}

    # Step 1: Validation
    is_leaf, top_preds = validate_leaf(image_path)
    if not is_leaf:
        return {
            "disease": "unknown", 
            "confidence": 0, 
            "is_leaf": False, 
            "message": "The uploaded image does not appear to be a leaf. Please upload a clear image of a plant leaf.",
            "top_predictions": [p[1] for p in top_preds] # For debugging/transparency
        }

    # Step 2: Disease Prediction
    try:
        img = preprocess_image(image_path, IMAGE_SIZE)
        # Assuming the main model uses MobileNetV2 preprocessing as before
        img = tf.keras.applications.mobilenet_v2.preprocess_input(img)
        img = np.expand_dims(img, axis=0)
        
        predictions = model.predict(img, verbose=0)
        
        predicted_class_index = np.argmax(predictions[0])
        predicted_disease = class_names[predicted_class_index]
        confidence = float(np.max(predictions[0]))

        return {
            "disease": predicted_disease, 
            "confidence": confidence,
            "is_leaf": True
        }

    except Exception as e:
        return {"error": f"Prediction failed: {e}"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}), file=sys.stderr)
        sys.exit(1)

    image_path = sys.argv[1]
    result = predict_disease(image_path)
    print(json.dumps(result))
