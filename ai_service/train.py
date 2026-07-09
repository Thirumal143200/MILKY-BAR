import argparse
import torch
from torch.utils.data import DataLoader, random_split

from train.dataset import MilkQualityDataset, SyntheticDataGenerator
from train.model import get_milk_quality_model
from train.trainer import train_model
from train.evaluate import evaluate_model, export_model

def main():
    parser = argparse.ArgumentParser(description="MilkBoy AI Training Pipeline")
    parser.add_argument('--data_dir', type=str, default='dataset', help='Path to the image dataset')
    parser.add_argument('--synthetic', action='store_true', help='Generate synthetic dataset if no real data is available')
    parser.add_argument('--epochs', type=int, default=10, help='Number of training epochs')
    parser.add_argument('--batch_size', type=int, default=32, help='Batch size for training')
    parser.add_argument('--lr', type=float, default=1e-4, help='Learning rate')
    parser.add_argument('--num_synthetic', type=int, default=300, help='Number of synthetic images to generate')
    
    args = parser.parse_args()
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    if args.synthetic:
        print("Running in Synthetic Mode...")
        generator = SyntheticDataGenerator(args.data_dir, num_samples=args.num_synthetic)
        generator.generate()
        
    print("\nLoading Dataset...")
    try:
        full_dataset = MilkQualityDataset(args.data_dir, is_training=True)
        if len(full_dataset) == 0:
            print(f"Error: No images found in {args.data_dir}. Use --synthetic to generate fake data.")
            return
            
        print(f"Total samples: {len(full_dataset)}")
        print(f"Classes: {full_dataset.classes}")
        
        # Split dataset (80% train, 20% val)
        train_size = int(0.8 * len(full_dataset))
        val_size = len(full_dataset) - train_size
        
        # Use a fixed generator for reproducible splits
        generator_split = torch.Generator().manual_seed(42)
        train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size], generator=generator_split)
        
        # Override transforms for validation set
        val_dataset.dataset = MilkQualityDataset(args.data_dir, is_training=False)
        
        train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=0)
        val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=0)
        
        print("\nInitializing Model...")
        model = get_milk_quality_model(num_classes=len(full_dataset.classes), pretrained=True)
        
        print(f"\nStarting Training (Epochs: {args.epochs}, Batch Size: {args.batch_size}, LR: {args.lr})")
        best_model = train_model(
            model=model,
            train_loader=train_loader,
            val_loader=val_loader,
            device=device,
            epochs=args.epochs,
            learning_rate=args.lr
        )
        
        evaluate_model(best_model, val_loader, device, full_dataset.classes)
        export_model(best_model, save_path="models/best_model.pt")
        
    except Exception as e:
        print(f"\nPipeline Failed: {e}")

if __name__ == "__main__":
    main()
