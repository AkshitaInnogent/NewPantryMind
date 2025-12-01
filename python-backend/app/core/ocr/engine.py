# app/core/ocr/engine.py
import pytesseract
import cv2
import numpy as np
from PIL import Image
import io
import base64
from typing import Tuple, Optional
from app.utils.exceptions import OCRError
import logging

logger = logging.getLogger(__name__)

class OCREngine:
    def __init__(self):
        # Configure Tesseract for better accuracy
        self.config = '--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,₹$€£¥/-:() '
    
    async def extract_text(self, image_data: bytes) -> str:
        """Extract text from image using OCR"""
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Preprocess image for better OCR
            processed_image = self._preprocess_image(image)
            
            # Extract text using Tesseract
            text = pytesseract.image_to_string(processed_image, config=self.config)
            
            # Clean and normalize text
            cleaned_text = self._clean_text(text)
            
            logger.info(f"OCR extracted {len(cleaned_text)} characters")
            return cleaned_text
            
        except Exception as e:
            logger.error(f"OCR extraction failed: {str(e)}")
            raise OCRError("OCR_EXTRACTION_FAILED", f"Failed to extract text: {str(e)}")
    
    def _preprocess_image(self, image: Image.Image) -> Image.Image:
        """Preprocess image to improve OCR accuracy"""
        try:
            # Convert PIL to OpenCV format
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Convert to grayscale
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
            
            # Apply denoising
            denoised = cv2.fastNlMeansDenoising(gray)
            
            # Enhance contrast
            enhanced = cv2.convertScaleAbs(denoised, alpha=1.2, beta=10)
            
            # Apply threshold to get binary image
            _, binary = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Convert back to PIL
            return Image.fromarray(binary)
            
        except Exception as e:
            logger.warning(f"Image preprocessing failed, using original: {str(e)}")
            return image
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize extracted text"""
        if not text:
            return ""
        
        # Remove excessive whitespace
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        # Join lines with single newline
        cleaned = '\n'.join(lines)
        
        return cleaned

# Global OCR engine instance
ocr_engine = OCREngine()
