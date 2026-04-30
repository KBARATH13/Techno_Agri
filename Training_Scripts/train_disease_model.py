import tensorflow as tf
import os
import numpy as np

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

print(f"--- Starting CNN Disease Detection Model Training ---")
print(f"TensorFlow Version: {tf.__version__}")

# --- 1. Configuration ---
BASE_DATA_DIR = 'D:/code/FinalYearProject/AI outsource/DataSets/processed_plantvillage_dataset'
TRAIN_DIR = os.path.join(BASE_DATA_DIR, 'train')
VALID_DIR = os.path.join(BASE_DATA_DIR, 'valid')
TEST_DIR = os.path.join(BASE_DATA_DIR, 'test')

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16 # A good starting point
EPOCHS = 10 # A good starting point

# --- 2. Load Data from Pre-split Directories ---
print("\n--- Loading and Preprocessing Data from Processed Folders ---")

# Safety checks
if not os.path.exists(TRAIN_DIR) or not os.path.exists(VALID_DIR) or not os.path.exists(TEST_DIR):
    print(f"Error: One or more data directories are missing.")
    print(f"Please ensure '{TRAIN_DIR}', '{VALID_DIR}', and '{TEST_DIR}' exist and are populated.")
    exit()

# Load the training dataset
train_ds = tf.keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    labels='inferred',
    label_mode='categorical', # Use categorical for softmax
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True,
    seed=123
)

# Load the validation dataset
val_ds = tf.keras.utils.image_dataset_from_directory(
    VALID_DIR,
    labels='inferred',
    label_mode='categorical',
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False # No need to shuffle validation data
)

# Load the test dataset
test_ds = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    labels='inferred',
    label_mode='categorical',
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False # No need to shuffle test data
)

class_names = train_ds.class_names
NUM_CLASSES = len(class_names)
print(f"Found {NUM_CLASSES} classes to train on.")
print(f"Class names: {class_names}")

# Configure dataset for performance
AUTOTUNE = tf.data.AUTOTUNE

def preprocess_for_mobilenetv2(image, label):
    image = tf.keras.applications.mobilenet_v2.preprocess_input(image)
    return image, label

train_ds = train_ds.map(preprocess_for_mobilenetv2, num_parallel_calls=AUTOTUNE).prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.map(preprocess_for_mobilenetv2, num_parallel_calls=AUTOTUNE).prefetch(buffer_size=AUTOTUNE)
test_ds = test_ds.map(preprocess_for_mobilenetv2, num_parallel_calls=AUTOTUNE).prefetch(buffer_size=AUTOTUNE)


# --- 3. Build the Model (Transfer Learning) ---
print("\n--- Building Model using Transfer Learning (MobileNetV2) ---")

# Create a data augmentation layer
data_augmentation = tf.keras.Sequential([
    tf.keras.layers.RandomFlip('horizontal'),
    tf.keras.layers.RandomRotation(0.2),
])

# Load the pre-trained MobileNetV2 model
base_model = tf.keras.applications.MobileNetV2(
    input_shape=IMAGE_SIZE + (3,),
    include_top=False,
    weights='imagenet'
)
base_model.trainable = False # Freeze the base model

# Create the full model
inputs = tf.keras.Input(shape=IMAGE_SIZE + (3,))
x = data_augmentation(inputs)
#x = tf.keras.applications.mobilenet_v2.preprocess_input(x) # Preprocess input for MobileNetV2
x = base_model(x, training=False)
x = tf.keras.layers.GlobalAveragePooling2D()(x)
x = tf.keras.layers.Dropout(0.2)(x)
outputs = tf.keras.layers.Dense(NUM_CLASSES, activation='softmax')(x)
model = tf.keras.Model(inputs, outputs)

# --- 4. Compile the Model ---
model.compile(
    optimizer='adam',
    loss=tf.keras.losses.CategoricalCrossentropy(), # Use CategoricalCrossentropy for 'categorical' label_mode
    metrics=['accuracy']
)
print("--- Model Compiled Successfully ---")
model.summary()

# --- 5. Calculate Class Weights & Train ---
print(f"\n--- Calculating Class Weights to Handle Imbalance ---")

# Get the number of images in each class
total_samples = 0
samples_per_class = {}
for i, class_name in enumerate(class_names):
    class_dir = os.path.join(TRAIN_DIR, class_name)
    num_files = len(os.listdir(class_dir))
    samples_per_class[i] = num_files
    total_samples += num_files

print(f"Total training samples: {total_samples}")

# Calculate class weights
class_weight = {}
for i, class_name in enumerate(class_names):
    weight = total_samples / (NUM_CLASSES * samples_per_class[i])
    class_weight[i] = weight
    print(f"Weight for class '{class_name}': {weight:.2f}")


print(f"\n--- Starting Training for {EPOCHS} Epochs ---")
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    class_weight=class_weight
)


# --- 6. Evaluate and Save ---
print("\n--- Evaluating Model Performance ---")

# Evaluate against the validation set
val_loss, val_accuracy = model.evaluate(val_ds)
print(f"Final Validation Loss: {val_loss:.4f}")
print(f"Final Validation Accuracy: {val_accuracy:.4f}")

# Evaluate against the unseen test set
print("\n--- Evaluating on the Unseen Test Set ---")
test_loss, test_accuracy = model.evaluate(test_ds)
print(f"Final Test Loss: {test_loss:.4f}")
print(f"Final Test Accuracy: {test_accuracy:.4f}")

# --- 7. Save the Model ---
model_filename = 'D:/code/FinalYearProject/AI outsource/Models/disease_detection_model'
model.export(model_filename) # Changed from model.save()
print(f"\n--- Model saved successfully as {model_filename} ---")