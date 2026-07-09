import os
import torch
import numpy as np
from PIL import Image
from torchvision import transforms
from typing import Dict, Any

class MilkQualityModel:
    """
    Production PyTorch milk quality classification model.
    Loads TorchScript weights from a .pt file.
    """
    def __init__(self, model_path: str = "models/milk-quality-v1/best_model.torchscript.pt"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.labels = ["good", "spoiled", "adulterated"]
        
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225])
        ])
        
        if os.path.exists(model_path):
            self.model = torch.jit.load(model_path, map_location=self.device)
            self.model.eval()
            self.is_loaded = True
        else:
            self.model = None
            self.is_loaded = False
            print(f"CRITICAL WARNING: Model weights not found at {model_path}. You must train the model first.")

    def predict(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Runs production inference using the loaded model.
        """
        if not self.is_loaded:
            raise RuntimeError("Production model is not loaded. Train the model using train.py before running inference.")
            
        # Convert OpenCV BGR to PIL RGB
        if image.shape[2] == 3:
            image = image[:, :, ::-1] # BGR to RGB
        pil_img = Image.fromarray(image)
        
        input_tensor = self.transform(pil_img).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            output = self.model(input_tensor)
            probabilities = torch.nn.functional.softmax(output, dim=1)[0]
            
        confidence, predicted_idx = torch.max(probabilities, 0)
        
        predicted_label = self.labels[predicted_idx.item()]
        conf_val = round(float(confidence.item()), 4)
        
        explanations = {
            "good": "Clear consistency, optimal color and no impurities detected.",
            "spoiled": "Signs of spoilage, abnormal color or severe inconsistencies.",
            "adulterated": "High probability of dilution or foreign substances."
        }
        
        return {
            "label": predicted_label,
            "confidence": conf_val,
            "explanation": explanations.get(predicted_label, "Unknown prediction.")
        }

model_instance = MilkQualityModel()
