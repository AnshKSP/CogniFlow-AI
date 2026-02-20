"""
PDF Loader - Extracts text from PDF files for script analysis.
Uses PyPDF2 for PDF text extraction.
"""
import logging
from PyPDF2 import PdfReader
from typing import Optional

logger = logging.getLogger(__name__)


class PDFLoader:
    """
    PDF text extractor for script analysis.
    """

    def __init__(self):
        """Initialize PDF loader."""
        pass

    def extract_text(self, pdf_path: str) -> str:
        """
        Extract text from PDF file.
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            str: Extracted text content
            
        Raises:
            FileNotFoundError: If PDF file doesn't exist
            ValueError: If PDF extraction fails
        """
        if not pdf_path:
            raise ValueError("PDF path is required")
        
        try:
            # Read PDF file
            reader = PdfReader(pdf_path)
            
            # Extract text from all pages
            text_parts = []
            for page_num, page in enumerate(reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
                except Exception as e:
                    logger.warning(f"Error extracting text from page {page_num + 1}: {str(e)}")
                    continue
            
            # Combine all pages
            full_text = "\n\n".join(text_parts)
            
            if not full_text.strip():
                raise ValueError("No text content found in PDF")
            
            return full_text
        except FileNotFoundError:
            logger.error(f"PDF file not found: {pdf_path}")
            raise
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")
