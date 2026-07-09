import cv2
import numpy as np
from core.config import settings

def detect_blur(image: np.ndarray) -> tuple[bool, float]:
    """Detect blur using Variance of Laplacian"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
    # Vectorized laplacian variance for faster execution
    variance = float(np.var(cv2.Laplacian(gray, cv2.CV_64F)))
    is_blurry = variance < settings.BLUR_THRESHOLD
    return is_blurry, variance

def detect_glare(image: np.ndarray) -> tuple[bool, float]:
    """Detect presence of extreme glare/reflections using vectorized masking"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
    # Create mask of very bright pixels (glare)
    _, mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY)
    # Calculate percentage of glare pixels
    glare_ratio = cv2.countNonZero(mask) / (gray.shape[0] * gray.shape[1])
    is_glaring = glare_ratio > 0.05 # 5% of image is pure white glare
    return is_glaring, float(glare_ratio)

def assess_lighting(image: np.ndarray) -> tuple[str, float]:
    """Assess lighting conditions (too dark, too bright, good)"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
    mean_brightness = np.mean(gray)
    
    if mean_brightness < settings.BRIGHTNESS_LOW_THRESHOLD:
        return "too_dark", mean_brightness
    elif mean_brightness > settings.BRIGHTNESS_HIGH_THRESHOLD:
        return "too_bright", mean_brightness
    return "good", mean_brightness

def enhance_image(image: np.ndarray) -> np.ndarray:
    """Apply automatic image enhancement"""
    # Convert to LAB color space for histogram equalization on luminance
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    
    # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_channel_eq = clahe.apply(l_channel)
    
    # Merge and convert back to BGR
    lab_eq = cv2.merge((l_channel_eq, a_channel, b_channel))
    enhanced = cv2.cvtColor(lab_eq, cv2.COLOR_LAB2BGR)
    
    # Apply subtle unsharp masking for detail
    gaussian = cv2.GaussianBlur(enhanced, (9, 9), 10.0)
    enhanced = cv2.addWeighted(enhanced, 1.5, gaussian, -0.5, 0)
    
    return enhanced
