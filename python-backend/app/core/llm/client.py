# app/core/llm/client.py
import time
import asyncio
from typing import Optional, Dict, Any
import google.generativeai as genai
from app.config.settings import settings
from app.utils.exceptions import LLMError
import logging

logger = logging.getLogger(__name__)

class GeminiClient:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.timeout = 30.0
        self.last_request_time = 0
        self.min_request_interval = 0.1
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash-lite')
        # self.model = genai.GenerativeModel('gemini-3-pro-preview')
    
    async def text_completion(
        self, 
        prompt: str, 
        model: str = None,
        max_tokens: int = 1000,
        temperature: float = 0.1
    ) -> str:
        """Send text-only completion request to Gemini"""
        
        return await self._generate_with_retry(prompt, max_tokens, temperature)

    async def vision_completion(
        self,
        text_prompt: str,
        image_base64: str,
        model: str = None
    ) -> str:
        """Send vision completion request for image analysis"""
        
        import base64
        from PIL import Image
        import io
        
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data))
        
        return await self._generate_vision_content(text_prompt, image, 1000, 0.1)

    async def _generate_with_retry(
        self, 
        content,
        max_tokens: int = 1000,
        temperature: float = 0.1,
        max_retries: int = 1
    ) -> str:
        """Generate content with minimal retry"""
        
        try:
            return await self._generate_content(content, max_tokens, temperature)
        except Exception as e:
            logger.error(f"Gemini error: {str(e)}")
            raise LLMError("GEMINI_ERROR", f"Gemini API error: {str(e)}")
    
    async def _generate_content(
        self, 
        content,
        max_tokens: int = 1000,
        temperature: float = 0.1
    ) -> str:
        """Internal method for text content generation"""
        
        request_start = time.time()
        
        try:
            generation_config = genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=temperature,
            )
            
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.model.generate_content(
                    content, 
                    generation_config=generation_config
                )
            )
            
            total_time = (time.time() - request_start) * 1000
            logger.info(f"Gemini text completed in {total_time:.0f}ms")
            logger.info(f"Gemini response: {response.text[:200]}...")
            
            return response.text
            
        except Exception as e:
            total_time = (time.time() - request_start) * 1000
            logger.error(f"Gemini text error after {total_time:.0f}ms: {str(e)}")
            raise LLMError("GEMINI_FAILURE", f"Gemini API error: {str(e)}")

    async def _generate_vision_content(
        self, 
        text_prompt: str,
        image,
        max_tokens: int = 1000,
        temperature: float = 0.1
    ) -> str:
        """Internal method for vision content generation"""
        
        request_start = time.time()
        
        try:
            generation_config = genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=temperature,
            )
            
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.model.generate_content(
                    [text_prompt, image],
                    generation_config=generation_config
                )
            )
            
            total_time = (time.time() - request_start) * 1000
            logger.info(f"Gemini vision completed in {total_time:.0f}ms")
            logger.info(f"Gemini vision response: {response.text[:500]}...")
            
            return response.text
            
        except Exception as e:
            total_time = (time.time() - request_start) * 1000
            logger.error(f"Gemini vision error after {total_time:.0f}ms: {str(e)}")
            raise LLMError("GEMINI_FAILURE", f"Gemini vision API error: {str(e)}")

# Global client instance
llm_client = GeminiClient()
