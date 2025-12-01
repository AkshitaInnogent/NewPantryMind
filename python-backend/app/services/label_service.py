# app/services/label_service.py
import uuid
import time
from app.core.ocr.engine import ocr_engine
from app.core.ocr.preprocessor import image_preprocessor
from app.core.llm.client import llm_client
from app.core.llm.prompts import PromptTemplates
from app.core.llm.parser import llm_parser
from app.models.common import DocumentType
from app.models.response import OCRResponse
from app.utils.exceptions import OCRServiceError
import logging

logger = logging.getLogger(__name__)

class LabelService:
    
    async def process_label(
        self, 
        image_data: bytes, 
        filename: str,
        storage_hint: str = None
    ) -> OCRResponse:
        """Process product label and extract information"""
        
        request_id = str(uuid.uuid4())
        start_time = time.time()
        
        try:
            logger.info(f"Processing label {request_id}")
            
            # Step 1: Preprocess image
            processed_image, _ = await image_preprocessor.validate_and_process(image_data, filename)
            
            # Step 2: Extract text using OCR
            raw_text = await ocr_engine.extract_text(processed_image)
            
            if not raw_text.strip():
                raise OCRServiceError("NO_TEXT_FOUND", "No text could be extracted from the label")
            
            # Step 3: Use LLM to parse label data
            prompt = PromptTemplates.label_extraction_prompt(raw_text)
            llm_response = await llm_client.text_completion(prompt)
            
            # Step 4: Parse response into single item
            item = llm_parser.parse_label_response(llm_response)
            
            processing_time = int((time.time() - start_time) * 1000)
            
            logger.info(f"Label {request_id} processed successfully in {processing_time}ms")
            
            return OCRResponse(
                request_id=request_id,
                document_type=DocumentType.LABEL,
                raw_ocr_text=raw_text,
                items=[item],  # Single item for labels
                confidence_summary=item.confidence,
                processing_time_ms=processing_time
            )
            
        except OCRServiceError:
            raise
        except Exception as e:
            logger.error(f"Label processing failed for {request_id}: {str(e)}")
            raise OCRServiceError("PROCESSING_FAILED", f"Failed to process label: {str(e)}")

# Global service instance
label_service = LabelService()
