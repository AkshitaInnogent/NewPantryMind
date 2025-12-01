# app/core/ocr/preprocessor.py
from PIL import Image, ImageEnhance
import io
from typing import Tuple
from app.config.settings import settings
from app.utils.exceptions import ImageProcessingError
import logging

logger = logging.getLogger(__name__)

class ImagePreprocessor:
    def __init__(self):
        self.max_size_mb = settings.max_image_size_mb
        self.supported_formats = settings.supported_formats
        self.max_dimension = 2048  # Max width/height for processing
    
    async def validate_and_process(self, image_data: bytes, filename: str) -> Tuple[bytes, str]:
        """Validate image and prepare for OCR"""
        try:
            # Check file size
            size_mb = len(image_data) / (1024 * 1024)
            if size_mb > self.max_size_mb:
                raise ImageProcessingError(
                    "IMAGE_TOO_LARGE", 
                    f"Image size {size_mb:.1f}MB exceeds limit of {self.max_size_mb}MB"
                )
            
            # Check format
            format_valid = any(filename.lower().endswith(f'.{fmt}') for fmt in self.supported_formats)
            if not format_valid:
                raise ImageProcessingError(
                    "UNSUPPORTED_FORMAT",
                    f"Format not supported. Use: {', '.join(self.supported_formats)}"
                )
            
            # Load and process image
            image = Image.open(io.BytesIO(image_data))
            
            # Auto-rotate based on EXIF
            image = self._auto_rotate(image)
            
            # Resize if too large
            image = self._resize_if_needed(image)
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert back to bytes
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=85)
            processed_data = output.getvalue()
            
            logger.info(f"Image processed: {len(image_data)} -> {len(processed_data)} bytes")
            return processed_data, 'JPEG'
            
        except ImageProcessingError:
            raise
        except Exception as e:
            logger.error(f"Image processing failed: {str(e)}")
            raise ImageProcessingError("PROCESSING_FAILED", f"Failed to process image: {str(e)}")
    
    def _auto_rotate(self, image: Image.Image) -> Image.Image:
        """Auto-rotate image based on EXIF orientation"""
        try:
            exif = image._getexif()
            if exif is not None:
                orientation = exif.get(274)  # Orientation tag
                if orientation == 3:
                    image = image.rotate(180, expand=True)
                elif orientation == 6:
                    image = image.rotate(270, expand=True)
                elif orientation == 8:
                    image = image.rotate(90, expand=True)
        except:
            pass  # No EXIF data or error reading it
        return image
    
    def _resize_if_needed(self, image: Image.Image) -> Image.Image:
        """Resize image if dimensions are too large"""
        width, height = image.size
        
        if width <= self.max_dimension and height <= self.max_dimension:
            return image
        
        # Calculate new size maintaining aspect ratio
        if width > height:
            new_width = self.max_dimension
            new_height = int((height * self.max_dimension) / width)
        else:
            new_height = self.max_dimension
            new_width = int((width * self.max_dimension) / height)
        
        return image.resize((new_width, new_height), Image.Resampling.LANCZOS)

# Global preprocessor instance
image_preprocessor = ImagePreprocessor()
