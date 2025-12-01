# app/services/bill_service.py
import uuid
import time
from typing import List
from app.core.ocr.engine import ocr_engine
from app.core.ocr.preprocessor import image_preprocessor
from app.core.llm.client import llm_client
from app.core.llm.prompts import PromptTemplates
from app.core.llm.parser import llm_parser
from app.models.common import ExtractedItem, DocumentType
from app.models.response import OCRResponse
from app.utils.exceptions import OCRServiceError
import logging

logger = logging.getLogger(__name__)

class BillService:
    
    async def process_bill(
        self, 
        image_data: bytes, 
        filename: str,
        locale: str = "en-IN",
        timezone: str = "Asia/Kolkata"
    ) -> OCRResponse:
        """Process bill image and extract items"""
        
        request_id = str(uuid.uuid4())
        start_time = time.time()
        
        try:
            logger.info(f"Processing bill {request_id}")
            
            # Step 1: Validate and preprocess image
            processed_image, _ = await image_preprocessor.validate_and_process(image_data, filename)
            
            # Step 2: Extract text using OCR
            raw_text = await ocr_engine.extract_text(processed_image)
            
            if not raw_text.strip():
                raise OCRServiceError("NO_TEXT_FOUND", "No text could be extracted from the image")
            
            # Step 3: Use LLM to parse structured data
            prompt = PromptTemplates.bill_extraction_prompt(raw_text, locale)
            llm_response = await llm_client.text_completion(prompt)
            
            # Step 4: Parse LLM response into structured items
            items = llm_parser.parse_bill_response(llm_response)
            
            # Step 5: Calculate confidence summary
            confidence_summary = self._calculate_confidence_summary(items)
            
            processing_time = int((time.time() - start_time) * 1000)
            
            logger.info(f"Bill {request_id} processed successfully: {len(items)} items in {processing_time}ms")
            
            return OCRResponse(
                request_id=request_id,
                document_type=DocumentType.BILL,
                raw_ocr_text=raw_text,
                items=items,
                confidence_summary=confidence_summary,
                processing_time_ms=processing_time,
                message=self._generate_user_message(items, raw_text, confidence_summary)
            )
            
        except OCRServiceError:
            raise
        except Exception as e:
            logger.error(f"Bill processing failed for {request_id}: {str(e)}")
            raise OCRServiceError("PROCESSING_FAILED", f"Failed to process bill: {str(e)}")
    
    def _calculate_confidence_summary(self, items: List[ExtractedItem]) -> float:
        """Calculate overall confidence score"""
        if not items:
            return 0.0
        
        total_confidence = sum(item.confidence for item in items)
        return round(total_confidence / len(items), 2)
    
    def _generate_user_message(self, items: List[ExtractedItem], raw_text: str, confidence: float) -> str:
        """Generate helpful message for user based on results"""
        if not items:
            # Check if OCR text is too short or unclear
            if len(raw_text.strip()) < 20:
                return "Image quality appears poor. Please upload a clearer picture of your receipt."
            elif "total" in raw_text.lower() or "receipt" in raw_text.lower():
                return "Receipt detected but no food items found. This may contain non-food items only."
            else:
                return "No food items detected in this image. Please ensure it's a grocery receipt or food label."
        
        elif confidence < 0.5:
            return f"Found {len(items)} items but with low confidence. Consider uploading a clearer image for better accuracy."
        
        elif confidence < 0.7:
            return f"Successfully extracted {len(items)} items. Some items may need verification due to image quality."
        
        else:
            return f"Successfully extracted {len(items)} food items from your receipt."

# Global service instance
bill_service = BillService()
