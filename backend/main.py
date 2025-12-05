from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import torch
import torch.nn as nn
from torchvision import models, transforms
import json
import io
from pathlib import Path
from typing import Dict, List
import uvicorn

app = FastAPI(title="Plant Disease Detection API")

# Enable CORS for React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
models_cache: Dict[str, dict] = {}
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

# Model configurations
MODEL_CONFIGS = {
    "efficientnetb0": {
        "path": Path("../model/efficientnetb0"),
        "name": "EfficientNetB0",
        "architecture": "efficientnet_b0"
    },
    "resnet50": {
        "path": Path("../model/resnet50"),
        "name": "ResNet50",
        "architecture": "resnet50"
    }
}


def load_model(model_key: str):
    """Load a model from checkpoint if not already cached"""
    if model_key in models_cache:
        return models_cache[model_key]
    
    config = MODEL_CONFIGS.get(model_key)
    if not config:
        raise ValueError(f"Model {model_key} not found")
    
    model_path = config["path"] / "best.pt"
    classes_path = config["path"] / "classes.json"
    
    if not model_path.exists() or not classes_path.exists():
        raise FileNotFoundError(f"Model files not found for {model_key}")
    
    # Load classes
    with open(classes_path, "r") as f:
        classes = json.load(f)
    
    # Load checkpoint
    try:
        checkpoint = torch.load(model_path, map_location=DEVICE, weights_only=False)
    except TypeError:
        checkpoint = torch.load(model_path, map_location=DEVICE)
    
    # Create model architecture
    if config["architecture"] == "efficientnet_b0":
        model = models.efficientnet_b0()
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, len(classes))
    else:  # resnet50
        model = models.resnet50()
        model.fc = nn.Linear(model.fc.in_features, len(classes))
    
    # Load weights
    model.load_state_dict(checkpoint["model_state"])
    model.to(DEVICE)
    model.eval()
    
    # Image preprocessing
    preprocess = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    models_cache[model_key] = {
        "model": model,
        "classes": classes,
        "preprocess": preprocess,
        "name": config["name"]
    }
    
    return models_cache[model_key]


@app.on_event("startup")
async def startup_event():
    """Preload models on startup"""
    try:
        for model_key in MODEL_CONFIGS.keys():
            load_model(model_key)
        print(f"Successfully loaded {len(models_cache)} models on {DEVICE}")
    except Exception as e:
        print(f"Warning: Could not preload models: {e}")


@app.get("/")
async def root():
    return {
        "message": "Plant Disease Detection API",
        "version": "1.0.0",
        "device": DEVICE,
        "available_models": list(MODEL_CONFIGS.keys())
    }


@app.get("/models")
async def get_models():
    """Get list of available models"""
    return {
        "models": [
            {
                "id": key,
                "name": config["name"],
                "classes": len(models_cache.get(key, {}).get("classes", []))
            }
            for key, config in MODEL_CONFIGS.items()
        ]
    }


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    model_name: str = "efficientnetb0"
):
    """
    Predict plant disease from an image
    
    Args:
        file: Image file (JPG, PNG)
        model_name: Model to use (efficientnetb0 or resnet50)
    """
    try:
        # Validate model name
        if model_name not in MODEL_CONFIGS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid model name. Choose from: {list(MODEL_CONFIGS.keys())}"
            )
        
        # Load model
        model_data = load_model(model_name)
        model = model_data["model"]
        classes = model_data["classes"]
        preprocess = model_data["preprocess"]
        
        # Read and preprocess image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Prepare input tensor
        input_tensor = preprocess(image).unsqueeze(0).to(DEVICE)
        
        # Make prediction
        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, predicted_idx = torch.max(probabilities, 1)
            
            predicted_class = classes[predicted_idx.item()]
            confidence_score = confidence.item()
        
        # Get top 5 predictions
        top5_prob, top5_idx = torch.topk(probabilities, min(5, len(classes)), dim=1)
        top5_predictions = [
            {
                "class": classes[idx.item()],
                "confidence": prob.item(),
                "formatted_name": format_class_name(classes[idx.item()])
            }
            for prob, idx in zip(top5_prob[0], top5_idx[0])
        ]
        
        return JSONResponse(content={
            "success": True,
            "prediction": {
                "class": predicted_class,
                "formatted_name": format_class_name(predicted_class),
                "confidence": confidence_score,
                "model_used": model_data["name"]
            },
            "top_predictions": top5_predictions
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def format_class_name(class_name: str) -> str:
    """Format class name for display"""
    # Convert APPLE_HEALTHY to "Apple - Healthy"
    parts = class_name.split("_")
    if len(parts) >= 2:
        plant = parts[0].capitalize()
        disease = " ".join(parts[1:]).replace("_", " ").title()
        return f"{plant} - {disease}"
    return class_name.replace("_", " ").title()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": len(models_cache),
        "device": DEVICE
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
