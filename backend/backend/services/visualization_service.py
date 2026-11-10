
import numpy as np
import cv2

from PIL import Image


def create_gradcam_overlay(image: Image.Image, heatmap: np.ndarray):

    # Convert original image to RGB
    original = image.convert("RGB")

    # Resize heatmap to original image dimensions
    heatmap_resized = cv2.resize(
        heatmap,
        original.size
    )

    # Convert heatmap values to 8-bit format
    heatmap_uint8 = np.uint8(255 * heatmap_resized)

    # Apply JET color map
    colored_heatmap = cv2.applyColorMap(
        heatmap_uint8,
        cv2.COLORMAP_JET
    )

    # Convert BGR to RGB
    colored_heatmap = cv2.cvtColor(
        colored_heatmap,
        cv2.COLOR_BGR2RGB
    )

    # Convert original image to NumPy array
    original_array = np.array(original)

    # Blend original image and heatmap
    overlay = cv2.addWeighted(
        original_array,
        0.6,
        colored_heatmap,
        0.4,
        0
    )

    return Image.fromarray(overlay)
