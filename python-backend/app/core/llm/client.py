# app/core/llm/client.py
import httpx
import json
import base64
import time
import asyncio
from typing import Optional, Dict, Any
from app.config.settings import settings
from app.utils.exceptions import LLMError
import logging

logger = logging.getLogger(__name__)

class OpenRouterClient:
    def __init__(self):
        self.base_url = settings.openrouter_base_url
        self.api_key = settings.openrouter_api_key
        self.timeout = settings.llm_timeout_seconds
        self.last_request_time = 0
        self.min_request_interval = 2  # 2 seconds between requests
        
    async def text_completion(
        self, 
        prompt: str, 
        model: str = None,
        max_tokens: int = 4000,  # Increased from 2000
        temperature: float = 0.1
    ) -> str:
        """Send text-only completion request to OpenRouter"""
        
        model = model or settings.ocr_model
        messages = [{"role": "user", "content": prompt}]
        
        return await self._chat_completion_with_retry(messages, model, max_tokens, temperature)
    
    async def vision_completion(
        self,
        text_prompt: str,
        image_base64: str,
        model: str = None
    ) -> str:
        """Send vision completion request for image analysis"""
        
        model = model or settings.vision_model
        
        messages = [{
            "role": "user",
            "content": [
                {"type": "text", "text": text_prompt},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
                }
            ]
        }]
        
        return await self._chat_completion_with_retry(messages, model, max_tokens=4000)
    
    async def _chat_completion_with_retry(
        self, 
        messages: list, 
        model: str,
        max_tokens: int = 4000,
        temperature: float = 0.1,
        max_retries: int = 3
    ) -> str:
        """Chat completion with retry logic for rate limits"""
        
        for attempt in range(max_retries):
            try:
                # Add delay between requests
                await self._rate_limit_delay()
                
                return await self._chat_completion(messages, model, max_tokens, temperature)
                
            except LLMError as e:
                if "429" in str(e) and attempt < max_retries - 1:
                    wait_time = (2 ** attempt) * 30  # 30s, 60s, 120s
                    logger.warning(f"Rate limited, waiting {wait_time}s before retry {attempt + 1}")
                    await asyncio.sleep(wait_time)
                    continue
                raise
    
    async def _rate_limit_delay(self):
        """Add delay to avoid rate limits"""
        time_since_last = time.time() - self.last_request_time
        if time_since_last < self.min_request_interval:
            await asyncio.sleep(self.min_request_interval - time_since_last)
        self.last_request_time = time.time()
    
    async def _chat_completion(
        self, 
        messages: list, 
        model: str,
        max_tokens: int = 4000,
        temperature: float = 0.1
    ) -> str:
        """Internal method for chat completion requests"""
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://pantrymind.com",
            "X-Title": "PantryMind OCR Service"
        }
        
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                
                result = response.json()
                return result["choices"][0]["message"]["content"]
                
        except httpx.TimeoutException:
            raise LLMError("LLM_TIMEOUT", "Request timed out")
        except httpx.HTTPStatusError as e:
            raise LLMError("LLM_API_ERROR", f"API error: {e.response.status_code}")
        except Exception as e:
            logger.error(f"LLM client error: {str(e)}")
            raise LLMError("LLM_FAILURE", "Unexpected error in LLM processing")

# Global client instance
llm_client = OpenRouterClient()
