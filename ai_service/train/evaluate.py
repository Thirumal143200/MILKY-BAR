import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

def evaluate_model(model: nn.Module, test_loader: DataLoader, device: torch.device, classes: list):
    """
    Evaluates the model on the test set and prints detailed metrics.
    """
    model.eval()
    all_preds = []
    all_labels = []
    
    print("\nStarting Evaluation...")
    with torch.no_grad():
        for inputs, labels in test_loader:
            inputs = inputs.to(device)
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
            
    # Print Classification Report (Precision, Recall, F1-Score)
    print("\nClassification Report:")
    print(classification_report(all_labels, all_preds, target_names=classes))
    
    # Generate Confusion Matrix
    cm = confusion_matrix(all_labels, all_preds)
    print("\nConfusion Matrix:")
    print(cm)
    
    # Optional: Plot confusion matrix and save it
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=classes, yticklabels=classes)
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('Milk Quality Confusion Matrix')
    
    output_dir = Path("models")
    output_dir.mkdir(exist_ok=True)
    plt.savefig(output_dir / "confusion_matrix.png")
    print(f"Saved confusion matrix plot to {output_dir / 'confusion_matrix.png'}")

def export_model(model: nn.Module, save_path: str = "models/best_model.pt"):
    """
    Saves the PyTorch model weights and also exports a TorchScript version for inference.
    """
    path = Path(save_path)
    path.parent.mkdir(exist_ok=True)
    
    # Save standard PyTorch state dict
    torch.save(model.state_dict(), path)
    print(f"\nModel weights saved to {path}")
    
    # Export to TorchScript for production use (FastAPI / C++ deployment)
    model.eval()
    # Create a dummy input tensor representing a single RGB image of size 224x224
    dummy_input = torch.randn(1, 3, 224, 224)
    # Move dummy input to the same device as model
    device = next(model.parameters()).device
    dummy_input = dummy_input.to(device)
    
    traced_model = torch.jit.trace(model, dummy_input)
    script_path = path.with_suffix('.torchscript.pt')
    traced_model.save(script_path)
    print(f"TorchScript model exported to {script_path}")
