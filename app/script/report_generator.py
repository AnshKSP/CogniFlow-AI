"""
Report Generator - Generates PDF emotion analysis reports.
Uses reportlab for PDF generation.
"""
import logging
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from typing import Dict, List, Optional
from io import BytesIO

logger = logging.getLogger(__name__)


class ReportGenerator:
    """
    PDF report generator for script emotion analysis.
    """

    def __init__(self):
        """Initialize report generator."""
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """Setup custom paragraph styles."""
        # Title style
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=30,
            alignment=1  # Center alignment
        )
        
        # Heading style
        self.heading_style = ParagraphStyle(
            'CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=12,
            spaceBefore=12
        )
        
        # Body style
        self.body_style = ParagraphStyle(
            'CustomBody',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#34495e'),
            spaceAfter=6
        )

    def generate_report(
        self,
        script_preview: str,
        emotion_label: str,
        confidence: float,
        emotional_arc: List[Dict],
        intensity_level: Optional[str] = None
    ) -> BytesIO:
        """
        Generate PDF emotion analysis report.
        
        Args:
            script_preview: Preview of the script text
            emotion_label: Dominant emotion label
            confidence: Confidence score
            emotional_arc: List of emotional arc entries
            intensity_level: Optional intensity level from audio
            
        Returns:
            BytesIO: PDF file as bytes
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        story = []
        
        # Title
        title = Paragraph("Script Emotion Analysis Report", self.title_style)
        story.append(title)
        story.append(Spacer(1, 0.3 * inch))
        
        # Script Preview Section
        story.append(Paragraph("Script Preview", self.heading_style))
        preview_text = script_preview[:500] + "..." if len(script_preview) > 500 else script_preview
        story.append(Paragraph(preview_text.replace('\n', '<br/>'), self.body_style))
        story.append(Spacer(1, 0.2 * inch))
        
        # Dominant Emotion Section
        story.append(Paragraph("Dominant Emotion", self.heading_style))
        emotion_text = f"<b>Emotion:</b> {emotion_label.capitalize()}<br/>"
        emotion_text += f"<b>Confidence:</b> {confidence*100:.1f}%"
        story.append(Paragraph(emotion_text, self.body_style))
        story.append(Spacer(1, 0.2 * inch))
        
        # Intensity Section (if available)
        if intensity_level:
            story.append(Paragraph("Intensity Level", self.heading_style))
            intensity_text = f"<b>Intensity:</b> {intensity_level.capitalize()}"
            story.append(Paragraph(intensity_text, self.body_style))
            story.append(Spacer(1, 0.2 * inch))
        
        # Emotional Arc Section
        if emotional_arc:
            story.append(Paragraph("Emotional Arc Breakdown", self.heading_style))
            
            # Create table for emotional arc
            table_data = [["Index", "Emotion", "Confidence", "Text Preview"]]
            
            for entry in emotional_arc[:50]:  # Limit to first 50 entries for readability
                index = str(entry.get("index", ""))
                emotion = entry.get("emotion", "neutral").capitalize()
                conf = f"{entry.get('confidence', 0.0)*100:.1f}%"
                text_preview = entry.get("text", "")[:60] + "..." if len(entry.get("text", "")) > 60 else entry.get("text", "")
                table_data.append([index, emotion, conf, text_preview])
            
            # Create table
            table = Table(table_data, colWidths=[0.5*inch, 1*inch, 1*inch, 4*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498db')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fa')])
            ]))
            
            story.append(table)
            story.append(Spacer(1, 0.2 * inch))
            
            # Summary
            total_sentences = len(emotional_arc)
            story.append(Paragraph(f"<i>Total sentences analyzed: {total_sentences}</i>", self.body_style))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer
