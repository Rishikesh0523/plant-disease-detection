# Plant Disease Detection - Backend

FastAPI backend for plant disease detection using PyTorch models.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Make sure the model files are in the correct location:
- `../model/efficientnetb0/best.pt` and `../model/efficientnetb0/classes.json`
- `../model/resnet50/best.pt` and `../model/resnet50/classes.json`

## Running the Server

### Development
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### GET `/`
Get API information

### GET `/models`
Get list of available models

### GET `/health`
Health check endpoint

### POST `/predict`
Predict plant disease from an image

**Parameters:**
- `file`: Image file (form-data)
- `model_name`: Model to use (`efficientnetb0` or `resnet50`)

**Example using curl:**
```bash
curl -X POST "http://localhost:8000/predict?model_name=efficientnetb0" \
  -F "file=@path/to/image.jpg"
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "class": "TOMATO_HEALTHY",
    "formatted_name": "Tomato - Healthy",
    "confidence": 0.98,
    "model_used": "EfficientNetB0"
  },
  "top_predictions": [
    {
      "class": "TOMATO_HEALTHY",
      "confidence": 0.98,
      "formatted_name": "Tomato - Healthy"
    },
    ...
  ]
}
```

## Testing

You can test the API using the Swagger UI at `http://localhost:8000/docs`
