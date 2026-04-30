import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error
import joblib
import numpy as np

print("--- Starting Model Training ---")

# --- 1. Load Data ---
try:
    # Load the merged and cleaned dataset
    df = pd.read_csv('D:/code/FinalYearProject/AI outsource/DataSets/merged_yield_data.csv')
    print("Successfully loaded merged_yield_data.csv.")
except FileNotFoundError as e:
    print(f"Error: {e}. Please ensure merged_yield_data.csv is in the 'AI outsource/DataSets' directory.")
    exit()

# --- 2. Preprocess Data ---
# Rename columns for clarity and consistency
df = df.rename(columns={
    'Area(*1000 ha)': 'Area_1000_ha',
    'Production(*1000 tons)': 'Production_1000_tons'
})

# Convert units to base units (hectares and kilograms)
if 'Area_1000_ha' in df.columns:
    df['Area_ha'] = df['Area_1000_ha'] * 1000
if 'Production_1000_tons' in df.columns:
    df['Production_kg'] = df['Production_1000_tons'] * 1000 * 1000

# Calculate Yield (Kg per ha)
if 'Area_ha' in df.columns and 'Production_kg' in df.columns:
    df['Yield_kg_per_ha'] = df.apply(
        lambda row: row['Production_kg'] / row['Area_ha'] if row['Area_ha'] > 0 else 0, axis=1
    )

# Define target and features
TARGET = 'Yield_kg_per_ha'
FEATURES = ['District_Name', 'Crop_Year', 'Season', 'Crop', 'Area_ha', 'Annual_Rainfall_mm']

# Filter out rows with 0 or NaN target values, or NaN in features
required_cols = FEATURES + [TARGET]
for col in required_cols:
    if col not in df.columns:
        print(f"Error: Required column '{col}' not found in the dataframe.")
        exit()

df = df[df[TARGET] > 0].dropna(subset=required_cols)

# --- 3. Split Data ---
X = df[FEATURES]
y = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Total data shape: {df.shape}")
print(f"Training data shape: {X_train.shape}")
print(f"Testing data shape: {X_test.shape}")

# --- 2. Define Preprocessing ---
# Identify categorical and numerical features
categorical_features = ['District_Name', 'Season', 'Crop']
numerical_features = ['Crop_Year', 'Area_ha', 'Annual_Rainfall_mm']

# Create a preprocessor object using ColumnTransformer
# OneHotEncoder will handle categorical variables, creating binary columns for each category
# StandardScaler will scale numerical features to have zero mean and unit variance
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ],
    remainder='passthrough' # Keep other columns (if any)
)

# --- 3. Define the Model ---
# We'll use a RandomForestRegressor, a powerful and versatile model
model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)

# --- 4. Create and Train the Pipeline ---
# A pipeline bundles preprocessing and modeling steps.
# This is crucial for ensuring the same steps are applied during prediction.
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', model)
])

print("\n--- Training the RandomForestRegressor model... ---")
# Train the entire pipeline on the training data
pipeline.fit(X_train, y_train)
print("--- Model training complete. ---")

# --- 5. Evaluate the Model ---
print("\n--- Evaluating model performance on the test set... ---")
y_pred = pipeline.predict(X_test)

# Calculate performance metrics
r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)

print(f"R-squared (R²): {r2:.4f}")
print(f"Mean Absolute Error (MAE): {mae:.4f}")

# Interpretation of R-squared
if r2 > 0.8:
    print("Model performance is excellent (R² > 0.8).")
elif r2 > 0.6:
    print("Model performance is good (R² > 0.6).")
elif r2 > 0.4:
    print("Model performance is fair (R² > 0.4).")
else:
    print("Model performance is poor (R² <= 0.4). Further improvements may be needed.")


# --- 6. Save the Model ---
model_filename = 'D:/code/FinalYearProject/AI outsource/Models/crop_yield_model.joblib'
joblib.dump(pipeline, model_filename)
print(f"\n--- Model saved successfully as {model_filename} ---")