import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

print("--- Starting Crop Recommender Model Training (New Dataset) ---")

# --- 1. Load Data ---
try:
    df = pd.read_csv('D:/code/FinalYearProject/AI outsource/DataSets/Crop_recommendation.csv')
    print("Successfully loaded the 'Crop_recommendation.csv' dataset.")
except FileNotFoundError as e:
    print(f"Error: {e}. Please ensure 'Crop_recommendation.csv' is in the 'AI' directory.")
    exit()

# --- 2. Define Features and Target ---
TARGET = 'label'
FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']

X = df[FEATURES]
y = df[TARGET]

# --- 3. Split Data ---
# Using stratify=y is good practice for classification to ensure both train and test sets have a similar distribution of classes
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
print(f"Training data shape: {X_train.shape}")
print(f"Testing data shape: {X_test.shape}")

# --- 4. Define Preprocessing and Model ---
# In this dataset, all features are numerical, so we only need to scale them.
# A pipeline bundles these steps.
pipeline = Pipeline(steps=[
    ('scaler', StandardScaler()),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1))
])

# --- 5. Train the Pipeline ---
print("\n--- Training the RandomForestClassifier model... ---")
pipeline.fit(X_train, y_train)
print("--- Model training complete. ---")

# --- 6. Evaluate the Model ---
print("\n--- Evaluating model performance on the test set... ---")
y_pred = pipeline.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy:.4f}")

if accuracy > 0.95:
    print("Model performance is excellent (Accuracy > 0.95).")
elif accuracy > 0.9:
    print("Model performance is good (Accuracy > 0.9).")
else:
    print("Model performance is fair. Further tuning might be beneficial.")

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# --- 7. Save the Model ---
# We will overwrite the previous, poorly performing model.
model_filename = 'D:/code/FinalYearProject/AI outsource/Models/crop_recommender_model.joblib'
joblib.dump(pipeline, model_filename)
print(f"\n--- Model saved successfully as {model_filename} ---")