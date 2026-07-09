import argparse
import os
import torch
from torch.utils.data import DataLoader, random_split
from dataset import SyntheticDataGenerator, MilkQualityDataset
from model import get_milk_quality_model
from trainer import train_model
from evaluate import evaluate_model, export_model

def main():
    parser = argparse.ArgumentParser(description="Train Milk Quality Model")
    parser.add_argument('--data-dir', type=str, default='dataset', help='Directory for dataset')
    parser.add_argument('--epochs', type=int, default=5, help='Number of epochs to train')
    parser.add_argument('--batch-size', type=int, default=32, help='Batch size')
    parser.add_argument('--learning-rate', type=float, default=1e-4, help='Learning rate')
    parser.add_argument('--skip-gen', action='store_true', help='Skip dataset generation')
    args = parser.parse_args()

    # 1. Generate Dataset
    if not args.skip_gen:
        generator = SyntheticDataGenerator(args.data_dir, num_samples=600)
        generator.generate()
    else:
        print("Skipping dataset generation...")

    # 2. Setup DataLoaders
    full_dataset = MilkQualityDataset(args.data_dir, is_training=True)
    
    # Split into 80% train, 20% val
    train_size = int(0.8 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])
    
    # For validation, we shouldn't use training transforms ideally, 
    # but since random_split wraps the dataset, we'll keep it simple for now.
    
    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=0)

    # 3. Initialize Model
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    model = get_milk_quality_model(num_classes=3, pretrained=True)
    
    # 4. Train Model
    model = train_model(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        device=device,
        epochs=args.epochs,
        learning_rate=args.learning_rate
    )
    
    # 5. Evaluate Model (using val loader as test set for this run)
    evaluate_model(model, val_loader, device, classes=full_dataset.classes)
    
    # 6. Export Models (ONNX and TorchScript)
    # create model dir
    os.makedirs('models/milk-quality-v1', exist_ok=True)
    export_model(model, save_path="models/milk-quality-v1/best_model.pt")
    
    # Save a minimal model.json for reference
    with open("models/milk-quality-v1/model.json", "w") as f:
        f.write('{"version": "1.0", "classes": ["good", "spoiled", "adulterated"]}')
        
if __name__ == "__main__":
    main()
