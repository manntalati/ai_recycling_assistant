import tensorflow as tf
import numpy as np
import os, io, json
from PIL import Image

class_names = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']

def model_fn(model_dir):
    model = tf.keras.models.load_model(model_dir)
    return model

def input_fn(request_body, content_type):
    img = Image.open(io.BytesIO(request_body)).convert("RGB")
    resized_img = img.resize((512, 256))
    img_array = tf.keras.utils.img_to_array(resized_img) / 255.0
    img_array = tf.expand_dims(img_array, 0)
    return img_array

def predict_fn(input_data, model):
    predictions = model.predict(input_data)
    return predictions

def output_fn(predictions, content_type):
    scores = tf.nn.softmax(predictions[0]).numpy()
    res = {
        "predicted name": class_names[int(np.argmax(scores))],
        "score": float(scores[int(np.argmax(scores))])
    }
    return json.dumps(res), "applications/json"
