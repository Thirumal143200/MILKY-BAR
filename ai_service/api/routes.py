from fastapi import APIRouter, UploadFile, File, HTTPException, status
from pydantic import BaseModel
import cv2
import numpy as np
from core.processor import detect_blur, assess_lighting, enhance_image
from core.model import model_instance

router = APIRouter()

class QualityAssessmentResponse(BaseModel):
    is_accepted: bool
    label: str | None
    confidence: float | None
    explanation: str | None
    issues: list[str]
    enhanced: bool

@router.post("/analyze", response_model=QualityAssessmentResponse)
async def analyze_milk_sample(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    issues = []
    
    # 1. Pre-capture checks
    is_blurry, blur_val = detect_blur(image)
    if is_blurry:
        issues.append(f"Image is too blurry (score: {blur_val:.2f})")
        
    lighting_status, light_val = assess_lighting(image)
    if lighting_status == "too_dark":
        issues.append("Lighting is too dark")
    elif lighting_status == "too_bright":
        issues.append("Image is overexposed/glare detected")
        
    # If severe issues, reject before ML
    if len(issues) > 0:
        return QualityAssessmentResponse(
            is_accepted=False,
            label=None,
            confidence=None,
            explanation="Image rejected due to quality issues. Please retake.",
            issues=issues,
            enhanced=False
        )
        
    # 2. Enhance image
    enhanced_img = enhance_image(image)
    
    # 3. Model Inference
    prediction = model_instance.predict(enhanced_img)
    
    return QualityAssessmentResponse(
        is_accepted=True,
        label=prediction["label"],
        confidence=prediction["confidence"],
        explanation=prediction["explanation"],
        issues=[],
        enhanced=True
    )
