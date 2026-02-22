import { useState } from 'react'
import { Video, FileText, FileText as FilePdf, TrendingUp, BarChart3, Sparkles, FileDown, Link2 } from 'lucide-react'
import { emotionApi } from '../services/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface EmotionAnalysisSectionProps {
  fullHeight?: boolean
}

interface AnalysisResult {
  dominantMood: string
  intensity: string
  confidence: number
  emotionalArc: number[]
  emotions: {
    name: string
    value: number
    color: string
  }[]
}

export default function EmotionAnalysisSection({ fullHeight = false }: EmotionAnalysisSectionProps) {
  const [selectedType, setSelectedType] = useState<'video' | 'script' | 'pdf' | 'youtube' | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'script' | 'pdf') => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedType(type)
      setUploadedFile(file)
      setResult(null)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedType) return

    setIsAnalyzing(true)
    try {
      let analysisResult: AnalysisResult

      if (selectedType === 'youtube') {
        if (!youtubeUrl.trim()) {
          throw new Error('Please enter a YouTube URL.')
        }
        analysisResult = await emotionApi.analyzeYouTube(youtubeUrl.trim())
      } else {
        if (!uploadedFile) {
          throw new Error('Please upload a file first.')
        }
        analysisResult = await emotionApi.analyze(uploadedFile, selectedType)
      }

      setResult(analysisResult)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateReport = () => {
    if (!result || !uploadedFile) return

    // Create PDF document
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Colors
    const primaryColor: [number, number, number] = [59, 130, 246] // Blue
    const secondaryColor: [number, number, number] = [139, 92, 246] // Purple
    const textDark: [number, number, number] = [15, 23, 42] // Slate-950
    const textLight: [number, number, number] = [100, 116, 139] // Slate-500

    // Header Section
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, pageWidth, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('CogniFlow AI', 20, 22)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Emotion Analysis Report', 20, 32)

    doc.setFontSize(8)
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 20, 32, { align: 'right' })

    // Report Info
    let yPos = 55
    doc.setTextColor(textDark[0], textDark[1], textDark[2])
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Analysis Summary', 20, yPos)

    yPos += 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(textLight[0], textLight[1], textLight[2])
    doc.text(`File: ${uploadedFile.name}`, 20, yPos)
    yPos += 6
    doc.text(`Type: ${selectedType?.toUpperCase()}`, 20, yPos)
    yPos += 6
    doc.text(`Size: ${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`, 20, yPos)

    // KPI Cards Section
    yPos += 15
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(15, yPos - 5, pageWidth - 30, 35, 3, 3, 'F')

    // Dominant Mood
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.roundedRect(20, yPos, 50, 25, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('DOMINANT MOOD', 25, yPos + 8)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(result.dominantMood, 25, yPos + 18)

    // Intensity
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.roundedRect(80, yPos, 50, 25, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('INTENSITY', 85, yPos + 8)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(result.intensity, 85, yPos + 18)

    // Confidence
    const emeraldColor: [number, number, number] = [16, 185, 129]
    doc.setFillColor(emeraldColor[0], emeraldColor[1], emeraldColor[2])
    doc.roundedRect(140, yPos, 50, 25, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('CONFIDENCE', 145, yPos + 8)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`${result.confidence}%`, 145, yPos + 18)

    yPos += 50

    // Emotional Breakdown Table
    doc.setTextColor(textDark[0], textDark[1], textDark[2])
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Emotional Breakdown', 20, yPos)

    yPos += 10

    autoTable(doc, {
      startY: yPos,
      head: [['Emotion', 'Percentage', 'Level']],
      body: result.emotions.map(emotion => [
        emotion.name,
        `${emotion.value}%`,
        emotion.value >= 60 ? 'High' : emotion.value >= 30 ? 'Medium' : 'Low'
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        textColor: textDark,
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 40 }
      }
    })

    yPos = (doc as any).lastAutoTable.finalY + 20

    // Emotional Arc Section
    doc.setTextColor(textDark[0], textDark[1], textDark[2])
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Emotional Arc Over Time', 20, yPos)

    yPos += 10

    // Draw emotional arc visualization
    const chartWidth = pageWidth - 40
    const chartHeight = 60
    const barWidth = (chartWidth / result.emotionalArc.length) - 2

    doc.setFillColor(248, 250, 252)
    doc.roundedRect(15, yPos - 5, pageWidth - 30, chartHeight + 15, 3, 3, 'F')

    result.emotionalArc.forEach((value, index) => {
      const barHeight = (value / 100) * chartHeight
      const x = 20 + index * (barWidth + 2)
      const y = yPos + chartHeight - barHeight

      // Gradient effect (simplified with multiple rectangles)
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.rect(x, y, barWidth, barHeight, 'F')
    })

    // Axis labels
    doc.setTextColor(textLight[0], textLight[1], textLight[2])
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Start', 20, yPos + chartHeight + 10)
    doc.text('Middle', pageWidth / 2 - 15, yPos + chartHeight + 10)
    doc.text('End', pageWidth - 40, yPos + chartHeight + 10)

    yPos += chartHeight + 30

    // Insights Section
    doc.setTextColor(textDark[0], textDark[1], textDark[2])
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Key Insights', 20, yPos)

    yPos += 10
    doc.setTextColor(textLight[0], textLight[1], textLight[2])
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')

    const insights = [
      `• The dominant emotion detected is ${result.dominantMood.toLowerCase()}, indicating a ${result.intensity.toLowerCase()} emotional tone.`,
      `• AI model confidence is ${result.confidence}%, suggesting ${result.confidence > 85 ? 'highly reliable' : result.confidence > 70 ? 'moderately reliable' : 'cautious interpretation needed'} results.`,
      `• Emotional arc shows ${result.emotionalArc[0] > result.emotionalArc[result.emotionalArc.length - 1] ? 'a declining trend' : result.emotionalArc[0] < result.emotionalArc[result.emotionalArc.length - 1] ? 'an ascending trend' : 'relatively stable emotions'} throughout the content.`,
      `• Top emotions: ${result.emotions.slice(0, 3).map(e => e.name).join(', ')}.`
    ]

    insights.forEach(insight => {
      const lines = doc.splitTextToSize(insight, pageWidth - 40)
      lines.forEach((line: string) => {
        doc.text(line, 20, yPos)
        yPos += 5
      })
      yPos += 3
    })

    // Footer
    const footerY = pageHeight - 20
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, footerY, pageWidth, 20, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('This report was generated by CogniFlow AI - Enterprise Intelligence Platform', pageWidth / 2, footerY + 12, { align: 'center' })

    // Save the PDF
    const fileName = `CogniFlow_Analysis_${uploadedFile.name.replace(/\\.[^/.]+$/, '')}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  return (
    <div className={`bg-slate-900/40 backdrop-blur-xl border border-blue-900/30 rounded-2xl overflow-hidden ${fullHeight ? '' : ''}`}>
      {/* Upload Section */}
      <div className="p-6 border-b border-blue-900/30">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          Upload Content for Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Video Upload */}
          <label className={`relative group cursor-pointer ${
            selectedType === 'video' ? 'ring-2 ring-blue-500' : ''
          }`}>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileUpload(e, 'video')}
              className="hidden"
            />
            <div className="border-2 border-dashed border-blue-500/30 rounded-xl p-6 text-center hover:border-blue-500/60 hover:bg-slate-800/40 transition-all group-hover:scale-[1.02]">
              <Video className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-white mb-1">Video</p>
              <p className="text-xs text-blue-300/50">MP4, MOV, AVI</p>
            </div>
          </label>

          {/* Script Upload */}
          <label className={`relative group cursor-pointer ${
            selectedType === 'script' ? 'ring-2 ring-blue-500' : ''
          }`}>
            <input
              type="file"
              accept=".txt,.doc,.docx"
              onChange={(e) => handleFileUpload(e, 'script')}
              className="hidden"
            />
            <div className="border-2 border-dashed border-blue-500/30 rounded-xl p-6 text-center hover:border-blue-500/60 hover:bg-slate-800/40 transition-all group-hover:scale-[1.02]">
              <FileText className="w-10 h-10 text-purple-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-white mb-1">Script</p>
              <p className="text-xs text-blue-300/50">TXT, DOC, DOCX</p>
            </div>
          </label>

          {/* PDF Upload */}
          <label className={`relative group cursor-pointer ${
            selectedType === 'pdf' ? 'ring-2 ring-blue-500' : ''
          }`}>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileUpload(e, 'pdf')}
              className="hidden"
            />
            <div className="border-2 border-dashed border-blue-500/30 rounded-xl p-6 text-center hover:border-blue-500/60 hover:bg-slate-800/40 transition-all group-hover:scale-[1.02]">
              <FilePdf className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-white mb-1">PDF</p>
              <p className="text-xs text-blue-300/50">PDF Documents</p>
            </div>
          </label>

          {/* YouTube URL */}
          <button
            onClick={() => {
              setSelectedType('youtube')
              setUploadedFile(null)
              setResult(null)
            }}
            className={`relative group cursor-pointer ${
              selectedType === 'youtube' ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="border-2 border-dashed border-blue-500/30 rounded-xl p-6 text-center hover:border-blue-500/60 hover:bg-slate-800/40 transition-all group-hover:scale-[1.02] w-full">
              <Link2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-white mb-1">YouTube</p>
              <p className="text-xs text-blue-300/50">Paste Video Link</p>
            </div>
          </button>
        </div>

        {selectedType === 'youtube' && (
          <div className="mt-4 p-4 bg-slate-800/40 rounded-xl border border-blue-900/30 flex flex-col md:flex-row gap-3 md:items-center">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-4 py-2 bg-slate-800/80 border border-blue-900/30 rounded-lg text-sm text-white placeholder-blue-400/40 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !youtubeUrl.trim()}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-medium rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Link
                </>
              )}
            </button>
          </div>
        )}

        {uploadedFile && (
          <div className="mt-4 flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-blue-900/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                {selectedType === 'video' && <Video className="w-5 h-5 text-blue-400" />}
                {selectedType === 'script' && <FileText className="w-5 h-5 text-purple-400" />}
                {selectedType === 'pdf' && <FilePdf className="w-5 h-5 text-cyan-400" />}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{uploadedFile.name}</p>
                <p className="text-xs text-blue-300/50">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-medium rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="p-6 space-y-6">
          {/* Results Header with Download */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Analysis Results
              </h3>
              <p className="text-sm text-blue-300/50 mt-1">AI-powered emotion analysis completed successfully</p>
            </div>
            <button
              onClick={handleGenerateReport}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-medium rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <FileDown className="w-4 h-4" />
              Download PDF
            </button>
          </div>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dominant Mood */}
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-blue-300/60 font-medium uppercase tracking-wider">Dominant Mood</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{result.dominantMood}</p>
              <p className="text-xs text-blue-300/50">Primary emotion detected</p>
            </div>

            {/* Intensity Badge */}
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-purple-300/60 font-medium uppercase tracking-wider">Intensity</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{result.intensity}</p>
              <p className="text-xs text-purple-300/50">Emotional strength level</p>
            </div>

            {/* Confidence */}
            <div className="bg-gradient-to-br from-emerald-600/20 to-cyan-600/20 border border-emerald-500/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-emerald-300/60 font-medium uppercase tracking-wider">Confidence</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{result.confidence}%</p>
              <p className="text-xs text-emerald-300/50">AI model confidence</p>
            </div>
          </div>

          {/* Emotional Breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Emotional Breakdown
            </h4>
            <div className="space-y-3">
              {result.emotions.map((emotion) => (
                <div key={emotion.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-blue-100">{emotion.name}</span>
                    <span className="text-sm text-blue-300 font-medium">{emotion.value}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${emotion.value}%`,
                        backgroundColor: emotion.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emotional Arc Chart */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Emotional Arc Over Time
            </h4>
            <div className="bg-slate-800/40 border border-blue-900/30 rounded-xl p-4">
              <div className="flex items-end justify-between h-32 gap-2">
                {result.emotionalArc.map((value, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-500 rounded-t-lg transition-all duration-300 hover:from-blue-500 hover:to-cyan-400"
                    style={{ height: `${value}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-blue-300/50">
                <span>Start</span>
                <span>Middle</span>
                <span>End</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!result && !uploadedFile && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <h4 className="text-lg font-medium text-white mb-2">Ready to Analyze</h4>
          <p className="text-sm text-blue-300/50 max-w-md mx-auto">
            Upload a video, script, or PDF document to get detailed emotion analysis with AI-powered insights.
          </p>
        </div>
      )}
    </div>
  )
}
