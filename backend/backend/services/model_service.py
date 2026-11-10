import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from pathlib import Path


# Project paths
BASE_DIR = Path(__file__).resolve().parents[3]
MODEL_PATH = BASE_DIR / "models" / "resnet18_pneumonia.pth"


# Device
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# Load checkpoint
checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE,
    weights_only=True
)

CLASS_NAMES = checkpoint["class_names"]
IMAGE_SIZE = checkpoint["image_size"]
DROPOUT = checkpoint["dropout_probability"]


# Recreate the exact ResNet18 architecture
model = models.resnet18(weights=None)

model.fc = nn.Sequential(
    nn.Dropout(p=DROPOUT),
    nn.Linear(model.fc.in_features, len(CLASS_NAMES))
)

model.load_state_dict(checkpoint["model_state_dict"])
model = model.to(DEVICE)
model.eval()


# Prediction preprocessing
preprocess = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def predict_image(image: Image.Image):

    image = image.convert("RGB")
    image_tensor = preprocess(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.softmax(outputs, dim=1)

    confidence, predicted_index = torch.max(probabilities, dim=1)

    predicted_class = CLASS_NAMES[predicted_index.item()]

    return {
        "prediction": predicted_class,
        "confidence": round(confidence.item() * 100, 2),
        "probabilities": {
            CLASS_NAMES[i]: round(probabilities[0][i].item() * 100, 2)
            for i in range(len(CLASS_NAMES))
        }
    }