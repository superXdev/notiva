import jsPDF from "jspdf"

export interface PDFExportOptions {
  title: string
  content: string
  labels?: string[]
  createdAt?: string
  updatedAt?: string
}

export const exportToPDF = async (options: PDFExportOptions) => {
  const { title, content, labels = [], createdAt, updatedAt } = options

  // Create new PDF document
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Set up margins and dimensions
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const maxWidth = pageWidth - margin * 2
  let currentY = margin

  // Helper function to add text with word wrapping
  const addText = (text: string, fontSize: number, isBold = false, color = "#000000") => {
    pdf.setFontSize(fontSize)
    pdf.setFont("helvetica", isBold ? "bold" : "normal")
    pdf.setTextColor(color)

    const lines = pdf.splitTextToSize(text, maxWidth)

    // Check if we need a new page
    if (currentY + lines.length * fontSize * 0.35 > pageHeight - margin) {
      pdf.addPage()
      currentY = margin
    }

    pdf.text(lines, margin, currentY)
    currentY += lines.length * fontSize * 0.35 + 5
  }

  // Add title
  addText(title, 18, true, "#1a1a1a")
  currentY += 5

  // Add metadata
  if (labels.length > 0) {
    addText(`Labels: ${labels.join(", ")}`, 10, false, "#666666")
  }

  if (createdAt) {
    addText(`Created: ${new Date(createdAt).toLocaleString()}`, 10, false, "#666666")
  }

  if (updatedAt) {
    addText(`Last Updated: ${new Date(updatedAt).toLocaleString()}`, 10, false, "#666666")
  }

  currentY += 10

  // Add separator line
  pdf.setDrawColor(200, 200, 200)
  pdf.line(margin, currentY, pageWidth - margin, currentY)
  currentY += 10

  // Helper function to add code block background
  const addCodeBlock = (lines: string[]) => {
    const codeBlockPadding = 8
    const lineHeight = 4
    
    // Calculate code block dimensions
    const blockHeight = lines.length * lineHeight + codeBlockPadding * 2
    
    // Check if we need a new page
    if (currentY + blockHeight > pageHeight - margin) {
      pdf.addPage()
      currentY = margin
    }
    
    // Draw background rectangle
    pdf.setFillColor(248, 248, 248) // Light gray background
    pdf.rect(margin, currentY, maxWidth, blockHeight, "F")
    
    // Draw border
    pdf.setDrawColor(220, 220, 220)
    pdf.setLineWidth(0.5)
    pdf.rect(margin, currentY, maxWidth, blockHeight, "S")
    
    // Add code text
    pdf.setFontSize(9)
    pdf.setFont("courier", "normal") // Monospace font
    pdf.setTextColor("#333333")
    
    let codeY = currentY + codeBlockPadding + 3
    for (const line of lines) {
      pdf.text(line, margin + codeBlockPadding, codeY)
      codeY += lineHeight
    }
    
    currentY += blockHeight + 8
  }

  // Helper function to add inline code with background
  const addInlineCode = (text: string) => {
    // Process inline code with backticks
    const processedText = text.replace(/`([^`]+)`/g, (match, code) => {
      return code // Just return the code without backticks for now
    })
    
    pdf.setFont("courier", "normal") // Monospace font for inline code
    addText(processedText, 10, false, "#333333")
    pdf.setFont("helvetica", "normal") // Reset to default font
  }

  // Process markdown content (enhanced conversion)
  const processMarkdown = (text: string) => {
    const lines = text.split("\n")
    let inCodeBlock = false
    let codeBlockLines: string[] = []
    let codeBlockLanguage = ""

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Handle code block start/end
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          // Starting a code block
          inCodeBlock = true
          codeBlockLanguage = line.substring(3).trim()
          codeBlockLines = []
          continue
        } else {
          // Ending a code block
          inCodeBlock = false
          
          // Add language label if present
          if (codeBlockLanguage) {
            pdf.setFontSize(8)
            pdf.setFont("helvetica", "bold")
            pdf.setTextColor("#666666")
            pdf.text(codeBlockLanguage.toUpperCase(), margin, currentY + 12)
            currentY += 6
          }
          
          addCodeBlock(codeBlockLines)
          codeBlockLines = []
          codeBlockLanguage = ""
          continue
        }
      }
      
      // If we're in a code block, collect lines
      if (inCodeBlock) {
        codeBlockLines.push(line)
        continue
      }
      
      // Handle empty lines
      if (!line.trim()) {
        currentY += 5
        continue
      }

      // Headers
      if (line.startsWith("# ")) {
        addText(line.substring(2), 16, true)
      } else if (line.startsWith("## ")) {
        addText(line.substring(3), 14, true)
      } else if (line.startsWith("### ")) {
        addText(line.substring(4), 12, true)
      } else if (line.startsWith("#### ")) {
        addText(line.substring(5), 11, true)
      } else if (line.startsWith("##### ")) {
        addText(line.substring(6), 10, true)
      } else if (line.startsWith("###### ")) {
        addText(line.substring(7), 10, true)
      }
      // Bold text (basic support)
      else if (line.includes("**")) {
        const processedLine = line.replace(/\*\*(.*?)\*\*/g, "$1")
        addText(processedLine, 11, true)
      }
      // Italic text (treat as normal for PDF)
      else if (line.includes("*") && !line.startsWith("- ") && !line.startsWith("* ")) {
        const processedLine = line.replace(/\*(.*?)\*/g, "$1")
        addText(processedLine, 11)
      }
      // Inline code
      else if (line.includes("`")) {
        addInlineCode(line)
      }
      // Lists
      else if (line.startsWith("- ") || line.startsWith("* ")) {
        addText(`• ${line.substring(2)}`, 11)
      } else if (/^\d+\.\s/.test(line)) {
        addText(line, 11)
      }
      // Blockquotes
      else if (line.startsWith("> ")) {
        addText(line.substring(2), 11, false, "#666666")
      }
      // Regular text
      else {
        addText(line, 11)
      }
    }
    
    // Handle unclosed code block
    if (inCodeBlock && codeBlockLines.length > 0) {
      if (codeBlockLanguage) {
        pdf.setFontSize(8)
        pdf.setFont("helvetica", "bold")
        pdf.setTextColor("#666666")
        pdf.text(codeBlockLanguage.toUpperCase(), margin, currentY + 12)
        currentY += 6
      }
      addCodeBlock(codeBlockLines)
    }
  }

  // Process the content
  if (content.trim()) {
    processMarkdown(content)
  } else {
    addText("No content", 11, false, "#999999")
  }

  // Save the PDF
  const fileName = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`
  pdf.save(fileName)
}
