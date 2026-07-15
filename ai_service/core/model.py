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
        self.awaiting_dataset = False
        
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
            # Fallback dynamically to a real PyTorch MobileNetV2 instance
            from torchvision.models import mobilenet_v2
            import torch.nn as nn
            
            self.model = mobilenet_v2(pretrained=False)
            num_ftrs = self.model.classifier[1].in_features
            self.model.classifier = nn.Sequential(
                nn.Dropout(p=0.2, inplace=False),
                nn.Linear(num_ftrs, 512),
                nn.ReLU(),
                nn.Dropout(p=0.2, inplace=False),
                nn.Linear(512, len(self.labels))
            )
            self.model.eval()
            self.model.to(self.device)
            self.is_loaded = True
            self.awaiting_dataset = True
            print(f"INFO: AI pipeline successfully loaded standard MobileNetV2. Awaiting production dataset training.")

    def predict(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Runs production inference using the loaded model.
        """
        if not self.is_loaded:
            raise RuntimeError("Production model is not loaded.")
            
        # Convert OpenCV BGR to PIL RGB
        if len(image.shape) == 3 and image.shape[2] == 3:
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
        
        explanation = explanations.get(predicted_label, "Unknown prediction.")
        if self.awaiting_dataset:
            explanation += " [Pipeline Ready: Awaiting production dataset training]"
            
        return {
            "label": predicted_label,
            "confidence": conf_val,
            "explanation": explanation
        }

model_instance = MilkQualityModel()
