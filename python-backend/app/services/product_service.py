# app/services/product_service.py
import uuid
import time
import base64
from typing import List
from app.core.ocr.preprocessor import image_preprocessor
from app.core.llm.client import llm_client
from app.core.llm.prompts import PromptTemplates
from app.core.llm.parser import llm_parser
from app.models.common import ExtractedItem, DocumentType
from app.models.response import OCRResponse
from app.utils.exceptions import OCRServiceError
import logging

logger = logging.getLogger(__name__)

class ProductService:
    
    async def process_product(
        self, 
        image_data: bytes, 
        filename: str,
        mode: str = "auto"
    ) -> OCRResponse:
        """Process product/shelf image using vision model directly"""
        
        request_id = str(uuid.uuid4())
        start_time = time.time()
        
        try:
            logger.info(f"Processing product image {request_id} in {mode} mode")
            
            # Step 1: Only preprocess image (no OCR)
            processed_image, _ = await image_preprocessor.validate_and_process(image_data, filename)
            
            # Step 2: Convert to base64 for vision model
            image_base64 = base64.b64encode(processed_image).decode('utf-8')
            
            # Step 3: Use vision model directly (no OCR step)
            prompt = PromptTemplates.product_detection_prompt(mode)
            llm_response = await llm_client.vision_completion(prompt, image_base64)
            
            # Step 4: Parse vision model response
            items = llm_parser.parse_product_response(llm_response)
            
            # Step 5: Calculate confidence
            confidence_summary = self._calculate_confidence_summary(items)
            
            processing_time = int((time.time() - start_time) * 1000)
            
            logger.info(f"Product {request_id} processed: {len(items)} items in {processing_time}ms")
            
            return OCRResponse(
                request_id=request_id,
                document_type=DocumentType.PRODUCT,
                raw_ocr_text="Vision-based detection (no OCR)",
                items=items,
                confidence_summary=confidence_summary,
                processing_time_ms=processing_time,
                message=self._generate_user_message(items, mode, confidence_summary)
            )
            
        except Exception as e:
            logger.error(f"Product processing failed for {request_id}: {str(e)}")
            raise OCRServiceError("PROCESSING_FAILED", f"Failed to process product: {str(e)}")
    
    def _calculate_confidence_summary(self, items: List[ExtractedItem]) -> float:
        if not items:
            return 0.0
        total_confidence = sum(item.confidence for item in items)
        return round(total_confidence / len(items), 2)
    
    # Add to product_service.py _generate_user_message method
    def _generate_user_message(self, items: List[ExtractedItem], mode: str, confidence: float) -> str:
        if not items:
            if mode == "single":
                return "No product detected. Ensure the product is clearly visible, well-lit, and the image is not blurry."
            else:
                return "No products detected on shelf. Try better lighting, closer image, or ensure products are clearly visible."
        
        elif confidence < 0.4:
            return f"Detected {len(items)} products but image quality is poor. Please upload a clearer, well-lit image."
        
        elif confidence < 0.7:
            return f"Detected {len(items)} products with moderate confidence. Some details may need verification."
        
        else:
            return f"Successfully detected {len(items)} products with high accuracy."

# Global service instance
product_service = ProductService()
