# app/services/label_service.py
import uuid
import time
import base64
from app.core.ocr.preprocessor import image_preprocessor
from app.core.llm.client import llm_client
from app.core.llm.prompts import PromptTemplates
from app.core.llm.parser import llm_parser
from app.models.common import DocumentType
from app.models.response import OCRResponse
from app.utils.exceptions import OCRServiceError
from app.utils.timing import PerformanceTimer
import logging

logger = logging.getLogger(__name__)

class LabelService:
    
    async def process_label(
        self, 
        image_data: bytes, 
        filename: str,
        storage_hint: str = None
    ) -> OCRResponse:
        """Process product label using vision model directly"""
        
        request_id = str(uuid.uuid4())
        timer = PerformanceTimer(request_id)
        
        try:
            logger.info(f"Processing label {request_id}")
            
            # Step 1: Only preprocess image (skip OCR)
            with timer.time_step("image_preprocessing"):
                processed_image, _ = await image_preprocessor.validate_and_process(image_data, filename)
            
            # Step 2: Convert to base64 for vision model
            with timer.time_step("image_encoding"):
                image_base64 = base64.b64encode(processed_image).decode('utf-8')
            
            # Step 3: Use vision model directly (no OCR)
            with timer.time_step("vision_api_call"):
                prompt = PromptTemplates.label_vision_prompt()
                llm_response = await llm_client.vision_completion(prompt, image_base64)
            
            # Step 4: Parse response
            with timer.time_step("response_parsing"):
                item = llm_parser.parse_label_response(llm_response)
            
            processing_time = int(timer.get_total_time())
            timer.log_summary()
            
            logger.info(f"Label {request_id} processed successfully in {processing_time}ms")
            
            return OCRResponse(
                request_id=request_id,
                document_type=DocumentType.LABEL,
                raw_ocr_text="Vision-based detection (no OCR)",
                items=[item],
                confidence_summary=item.confidence,
                processing_time_ms=processing_time,
                message=f"Successfully extracted product information from label."
            )
            
        except OCRServiceError:
            timer.log_summary()
            raise
        except Exception as e:
            timer.log_summary()
            logger.error(f"Label processing failed for {request_id}: {str(e)}")
            raise OCRServiceError("PROCESSING_FAILED", f"Failed to process label: {str(e)}")

# Global service instance
label_service = LabelService()
