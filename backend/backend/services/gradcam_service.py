
import torch
import torch.nn.functional as F
import numpy as np
from PIL import Image

from backend.backend.services.model_service import (
    model,
    preprocess,
    DEVICE,
    CLASS_NAMES
)


class GradCAM:

    def __init__(self, model):
        self.model = model
        self.gradients = None
        self.activations = None

        self.target_layer = model.layer4[-1]

        self.target_layer.register_forward_hook(
            self.save_activation
        )

        self.target_layer.register_full_backward_hook(
            self.save_gradient
        )

    def save_activation(self, module, input, output):
        self.activations = output.detach()

    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate(self, image_tensor, class_index):

        self.model.zero_grad()

        output = self.model(image_tensor)

        score = output[0, class_index]
        score.backward()

        weights = torch.mean(
            self.gradients,
            dim=(2, 3),
            keepdim=True
        )

        cam = torch.sum(
            weights * self.activations,
            dim=1
        )

        cam = F.relu(cam)

        cam = F.interpolate(
            cam.unsqueeze(1),
            size=(224, 224),
            mode="bilinear",
            align_corners=False
        )

        cam = cam.squeeze().cpu().numpy()

        cam = cam - np.min(cam)

        if np.max(cam) > 0:
            cam = cam / np.max(cam)

        return cam


grad_cam = GradCAM(model)


def generate_gradcam(image: Image.Image):

    image = image.convert("RGB")

    image_tensor = preprocess(image).unsqueeze(0).to(DEVICE)
    image_tensor.requires_grad_(True)

    with torch.enable_grad():

        output = model(image_tensor)

        predicted_index = torch.argmax(output, dim=1).item()

        heatmap = grad_cam.generate(
            image_tensor,
            predicted_index
        )

    return {
        "predicted_class": CLASS_NAMES[predicted_index],
        "heatmap": heatmap
    }
