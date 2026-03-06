"""
PDF Loader - Extracts text from PDF files for script analysis.
Uses PyPDF2 for PDF text extraction.
"""
import logging
import re
from collections import Counter
from PyPDF2 import PdfReader

logger = logging.getLogger(__name__)


class PDFLoader:
    """
    PDF text extractor for script analysis.
    """

    def __init__(self):
        """Initialize PDF loader."""
        pass

    def _clean_page_lines(self, page_text: str) -> list[str]:
        if not page_text:
            return []

        normalized = page_text.replace("\r\n", "\n").replace("\r", "\n")
        lines: list[str] = []

        for raw_line in normalized.split("\n"):
            line = re.sub(r"\s+", " ", raw_line).strip()
            if not line:
                continue
            lines.append(line)

        return lines

    def _remove_common_headers_and_footers(self, pages: list[list[str]]) -> list[list[str]]:
        if len(pages) < 2:
            return pages

        edge_counter: Counter[str] = Counter()
        for lines in pages:
            if not lines:
                continue
            edge_lines = lines[:2] + lines[-2:]
            for line in edge_lines:
                compact = line.lower()
                if 3 <= len(compact) <= 80:
                    edge_counter[compact] += 1

        threshold = max(2, len(pages) // 2)
        common_edges = {line for line, count in edge_counter.items() if count >= threshold}
        if not common_edges:
            return pages

        filtered_pages: list[list[str]] = []
        for lines in pages:
            filtered = [line for line in lines if line.lower() not in common_edges]
            filtered_pages.append(filtered)

        return filtered_pages

    def _normalize_extracted_text(self, pages: list[list[str]]) -> str:
        cleaned_pages: list[str] = []

        for lines in pages:
            kept: list[str] = []
            for line in lines:
                lower = line.lower()
                if re.fullmatch(r"\d+", line):
                    continue
                if re.fullmatch(r"(page|pg\.?)\s+\d+(\s*(of|/)\s*\d+)?", lower):
                    continue
                kept.append(line)

            if kept:
                cleaned_pages.append("\n".join(kept))

        text = "\n\n".join(cleaned_pages)
        text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)  # De-hyphenate line-wrapped words.
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

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
            pages_text_lines: list[list[str]] = []
            for page_num, page in enumerate(reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        pages_text_lines.append(self._clean_page_lines(page_text))
                except Exception as e:
                    logger.warning(f"Error extracting text from page {page_num + 1}: {str(e)}")
                    continue

            pages_text_lines = self._remove_common_headers_and_footers(pages_text_lines)

            # Combine and normalize all pages
            full_text = self._normalize_extracted_text(pages_text_lines)
            
            if not full_text.strip():
                raise ValueError("No text content found in PDF")
            
            return full_text
        except FileNotFoundError:
            logger.error(f"PDF file not found: {pdf_path}")
            raise
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")
