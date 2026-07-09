import torch
import torch.nn as nn
from torchvision.models import mobilenet_v2, MobileNet_V2_Weights

def get_milk_quality_model(num_classes: int = 3, pretrained: bool = True):
    """
    Returns a MobileNetV2 model adapted for Milk Quality classification.
    """
    if pretrained:
        weights = MobileNet_V2_Weights.IMAGENET1K_V1
        model = mobilenet_v2(weights=weights)
    else:
        model = mobilenet_v2(weights=None)
        
    # Freeze feature extractor layers for the first few epochs (optional, depending on training strategy)
    # We will just replace the classifier head for now.
    
    # The default classifier in MobileNetV2 is:
    # Sequential(
    #   (0): Dropout(p=0.2, inplace=False)
    #   (1): Linear(in_features=1280, out_features=1000, bias=True)
    # )
    
    num_ftrs = model.classifier[1].in_features
    
    # Replace the classification head
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.2, inplace=False),
        nn.Linear(num_ftrs, 512),
        nn.ReLU(),
        nn.Dropout(p=0.2, inplace=False),
        nn.Linear(512, num_classes)
    )
    
    return model
