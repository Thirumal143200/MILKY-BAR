import os
from pathlib import Path
import random
import numpy as np
from PIL import Image
import torch
from torch.utils.data import Dataset
from torchvision import transforms
import cv2

class SyntheticDataGenerator:
    """Generates an advanced synthetic milk quality dataset using OpenCV for realistic simulation."""
    def __init__(self, data_dir: str, num_samples: int = 1500):
        self.data_dir = Path(data_dir)
        self.num_samples = num_samples
        self.classes = ['good', 'spoiled', 'adulterated']
    
    def generate(self):
        """Generates realistic simulated milk images with texture, lighting, and noise."""
        print(f"Generating {self.num_samples} advanced synthetic images in {self.data_dir}...")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        for cls in self.classes:
            (self.data_dir / cls).mkdir(exist_ok=True)
            
        for i in range(self.num_samples):
            cls = random.choice(self.classes)
            
            # Base milk texture - using Gaussian noise smoothed out
            img = np.random.normal(loc=230, scale=20, size=(224, 224, 3)).astype(np.float32)
            img = cv2.GaussianBlur(img, (15, 15), 0)
            
            if cls == 'good':
                # Pure white/cream
                img[:, :, 0] += 10 # R
                img[:, :, 1] += 5  # G
                img = np.clip(img, 0, 255)
            elif cls == 'spoiled':
                # Yellowish/grey with curdling artifacts
                img[:, :, 0] -= 10 # R
                img[:, :, 1] -= 5  # G
                img[:, :, 2] -= 40 # B (makes it yellow)
                # Add curdling spots
                for _ in range(random.randint(5, 20)):
                    x, y = random.randint(0, 223), random.randint(0, 223)
                    cv2.circle(img, (x, y), random.randint(3, 10), (180, 180, 150), -1)
            else: # adulterated
                # Watered down (bluish, transparent look against a dark background simulator)
                img[:, :, 0] -= 20
                img[:, :, 1] -= 10
                img[:, :, 2] += 20 # Blue tint for watery
                # Lower contrast
                img = img * 0.8 + 20

            # Add random lighting gradient (glare simulation)
            gradient = np.zeros((224, 224), dtype=np.float32)
            cx, cy = random.randint(0, 224), random.randint(0, 224)
            cv2.circle(gradient, (cx, cy), 150, 1.0, -1)
            gradient = cv2.GaussianBlur(gradient, (99, 99), 0)
            img = img + (gradient[:, :, np.newaxis] * random.uniform(10, 50))
            
            img = np.clip(img, 0, 255).astype(np.uint8)
            
            # Remove duplicate possibility by using index
            file_path = self.data_dir / cls / f"synth_{i}_{random.randint(1000,9999)}.jpg"
            cv2.imwrite(str(file_path), cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
            
        print("Advanced Synthetic dataset generation complete.")

class MilkQualityDataset(Dataset):
    """PyTorch Dataset for loading milk quality images."""
    def __init__(self, data_dir: str, is_training: bool = True):
        self.data_dir = Path(data_dir)
        self.classes = ['good', 'spoiled', 'adulterated']
        self.class_to_idx = {cls: idx for idx, cls in enumerate(self.classes)}
        
        self.image_paths = []
        self.labels = []
        
        for cls in self.classes:
            cls_dir = self.data_dir / cls
            if cls_dir.exists():
                for ext in ('*.jpg', '*.jpeg', '*.png'):
                    for img_path in cls_dir.glob(ext):
                        self.image_paths.append(img_path)
                        self.labels.append(self.class_to_idx[cls])
        
        # Standard MobileNetV2 preprocessing
        normalize = transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                         std=[0.229, 0.224, 0.225])
        
        if is_training:
            self.transform = transforms.Compose([
                transforms.Resize(256),
                transforms.RandomResizedCrop(224),
                transforms.RandomHorizontalFlip(),
                transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.1),
                transforms.RandomRotation(15),
                transforms.RandomPerspective(distortion_scale=0.2, p=0.5),
                transforms.ToTensor(),
                normalize,
            ])
        else:
            self.transform = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                normalize,
            ])

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        image = Image.open(img_path).convert('RGB')
        
        if self.transform:
            image = self.transform(image)
            
        label = self.labels[idx]
        return image, torch.tensor(label, dtype=torch.long)
