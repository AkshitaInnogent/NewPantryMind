import pytest
from app.models.requests import OCRRequest
from app.models.common import DocumentType

def test_ocr_request_valid():
    request = OCRRequest(document_type=DocumentType.BILL)
    assert request.document_type == DocumentType.BILL
    assert request.locale == "en-IN"
    assert request.timezone == "Asia/Kolkata"

def test_ocr_request_invalid_document_type():
    with pytest.raises(ValueError):
        OCRRequest(document_type="invalid_type")
