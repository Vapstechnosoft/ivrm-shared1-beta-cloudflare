import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { normalizeSpacedLetters, standardizeNoteMarkdown } from './notemaker-cleaner';

export interface NoteMakerPdfOptions {
    chapter?: string;
    summary?: string;
    notes?: string;
    language?: string;
    fileName?: string;
    previewElement?: HTMLElement | null;
}

/**
 * Normalizes all special/Unicode punctuation into standard ASCII equivalents
 * so that standard PDF Type-1 Helvetica font can render them without falling
 * back to Courier, triggering character spacing bugs, or overflowing margins.
 */
export function sanitizeNoteText(str: string): string {
    if (!str) return '';
    let normalized = str
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Em dashes, en dashes, horizontal bars, minus
        .replace(/[\u2014\u2015]/g, ' - ')
        .replace(/[\u2012\u2013]/g, '-')
        .replace(/[\u2212]/g, '-')
        // Curly & smart double quotes
        .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')
        // Curly single quotes & apostrophes
        .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
        // Ellipsis
        .replace(/\u2026/g, '...')
        // Bullets & bullet-like symbols
        .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, ' - ')
        // Tilde & math equivalents
        .replace(/[\u007E\u223C]/g, '~')
        // Non-breaking spaces and zero-width spaces
        .replace(/[\u00A0\u1680\u202F\u205F\u3000]/g, ' ');

    normalized = normalizeSpacedLetters(normalized);

    // Filter control characters cleanly without control regex
    const cleanChars: string[] = [];
    for (let i = 0; i < normalized.length; i++) {
        const code = normalized.charCodeAt(i);
        // Disallow invisible control codes (except \n, \t)
        if (code === 10 || code === 9 || (code >= 32 && code !== 127)) {
            // Remove zero-width spaces
            if (code !== 0x200b && code !== 0x200c && code !== 0x200d && code !== 0xfeff) {
                cleanChars.push(normalized[i]);
            }
        }
    }
    return cleanChars.join('');
}

/**
 * Detects if the text contains non-Latin scripts (e.g. Hindi, Kannada, Tamil, etc.)
 * that require complex font shaping and HTML-based canvas rendering.
 */
export function containsComplexScript(text: string): boolean {
    if (!text) return false;
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        // Beyond basic Latin & Latin Extended (e.g. Devanagari 0x0900+, Kannada 0x0C80+, Arabic 0x0600+)
        if (code > 0x024f && !(code >= 0x2000 && code <= 0x206f)) {
            return true;
        }
    }
    return false;
}

interface MarkdownBlock {
    type: 'h1' | 'h2' | 'h3' | 'bullet' | 'lead_bold' | 'paragraph' | 'divider';
    text: string;
    leadBold?: string;
}

export function parseMarkdownBlocks(content: string): MarkdownBlock[] {
    const cleanContent = standardizeNoteMarkdown(content || '');
    const lines = cleanContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const blocks: MarkdownBlock[] = [];
    let currentParagraph: string[] = [];

    function flushParagraph() {
        if (currentParagraph.length > 0) {
            const text = currentParagraph.join(' ').trim();
            if (text) {
                const leadMatch = text.match(/^\*\*(.*?)\*\*[:\s-]*(.*)$/);
                if (leadMatch && leadMatch[1].length < 60) {
                    blocks.push({ type: 'lead_bold', leadBold: leadMatch[1], text: leadMatch[2] });
                } else {
                    blocks.push({ type: 'paragraph', text });
                }
            }
            currentParagraph = [];
        }
    }

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) {
            flushParagraph();
            continue;
        }

        if (/^(\-{3,}|\*{3,}|_{3,})$/.test(line)) {
            flushParagraph();
            blocks.push({ type: 'divider', text: '' });
            continue;
        }

        if (line.startsWith('# ')) {
            flushParagraph();
            blocks.push({ type: 'h1', text: line.replace(/^#\s+/, '') });
            continue;
        }
        if (line.startsWith('## ')) {
            flushParagraph();
            blocks.push({ type: 'h2', text: line.replace(/^##\s+/, '') });
            continue;
        }
        if (line.startsWith('### ')) {
            flushParagraph();
            blocks.push({ type: 'h3', text: line.replace(/^###\s+/, '') });
            continue;
        }

        // Check numbered major section, e.g.: "1. EXHAUSTIVE INTRODUCTION (~240 words)"
        const numHeadingMatch = line.match(/^(\d+[\.\)]\s+[A-Z0-9\s\/\-_–—\(\)]+)(.*)$/);
        if (numHeadingMatch && line.length < 80) {
            flushParagraph();
            blocks.push({ type: 'h2', text: line });
            continue;
        }

        // Check bullet points
        const bulletMatch = line.match(/^[\*\-\+•]\s+(.*)$/);
        if (bulletMatch) {
            flushParagraph();
            const bText = bulletMatch[1].trim();
            const bLeadMatch = bText.match(/^\*\*(.*?)\*\*[:\s-]*(.*)$/);
            if (bLeadMatch && bLeadMatch[1].length < 60) {
                blocks.push({ type: 'bullet', leadBold: bLeadMatch[1], text: bLeadMatch[2] });
            } else {
                blocks.push({ type: 'bullet', text: bText });
            }
            continue;
        }

        currentParagraph.push(line);
    }
    flushParagraph();
    return blocks;
}

/**
 * Builds a vector-sharp, professional study notes PDF using jsPDF.
 */
function buildVectorPdf(options: NoteMakerPdfOptions): jsPDF {
    const { chapter, summary, notes } = options;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    const maxTextWidth = contentWidth - 4; // 170 mm (leaves safe buffer before right margin)
    const bulletIndent = 6;
    const maxBulletWidth = maxTextWidth - bulletIndent; // 164 mm
    const bottomLimit = pageHeight - 20;
    let yPos = 20;

    function addNewPage() {
        doc.addPage();
        yPos = 22;
    }

    function checkPageBreak(requiredHeight: number) {
        if (yPos + requiredHeight > bottomLimit) {
            addNewPage();
            return true;
        }
        return false;
    }

    // --- COVER / HEADER CARD (Page 1) ---
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(margin, yPos, contentWidth, 26, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, yPos, contentWidth, 26, 2, 2, 'S');

    // Accent left stripe
    doc.setFillColor(37, 99, 235); // blue-600
    doc.rect(margin, yPos, 4, 26, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(30, 41, 59);
    doc.text('AI STUDY NOTES & EXAM GUIDE', margin + 8, yPos + 10);

    // Subtitle & Chapter badge
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    const chapterText = sanitizeNoteText(chapter || 'Entire Document');
    const dateStr = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    doc.text(`Chapter / Subject: ${chapterText}   |   Date: ${dateStr}   |   IVRM Next Academic System`, margin + 8, yPos + 18);

    yPos += 34;

    function renderSectionTitle(title: string, isMajor = false) {
        checkPageBreak(18);
        yPos += 3;

        // Background banner
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(margin, yPos, contentWidth, 9, 1.5, 1.5, 'F');
        doc.setFillColor(37, 99, 235);
        doc.rect(margin, yPos, 3, 9, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(isMajor ? 12 : 11);
        doc.setTextColor(30, 41, 59);
        doc.text(sanitizeNoteText(title.toUpperCase()), margin + 6, yPos + 6.2);

        yPos += 13;
    }

    function renderBlocks(blocks: MarkdownBlock[]) {
        for (const block of blocks) {
            if (block.type === 'divider') {
                checkPageBreak(10);
                yPos += 2;
                doc.setDrawColor(226, 232, 240);
                doc.setLineWidth(0.3);
                doc.line(margin, yPos, pageWidth - margin, yPos);
                yPos += 5;
            } else if (block.type === 'h1' || block.type === 'h2') {
                checkPageBreak(18);
                yPos += 3;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11.5);
                doc.setTextColor(29, 78, 216); // blue-700

                const headingText = sanitizeNoteText(block.text.replace(/\*\*/g, ''));
                const splitHeading = doc.splitTextToSize(headingText, maxTextWidth);
                for (const hLine of splitHeading) {
                    checkPageBreak(8);
                    doc.text(hLine, margin, yPos);
                    yPos += 5.5;
                }
                // Underline accent
                doc.setDrawColor(191, 219, 254); // blue-200
                doc.setLineWidth(0.4);
                doc.line(margin, yPos - 1.5, margin + 40, yPos - 1.5);
                yPos += 4;
            } else if (block.type === 'h3') {
                checkPageBreak(14);
                yPos += 2;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10.5);
                doc.setTextColor(51, 65, 85);
                const h3Text = sanitizeNoteText(block.text.replace(/\*\*/g, ''));
                const splitH3 = doc.splitTextToSize(h3Text, maxTextWidth);
                for (const line of splitH3) {
                    checkPageBreak(7);
                    doc.text(line, margin, yPos);
                    yPos += 5;
                }
                yPos += 2;
            } else if (block.type === 'bullet') {
                checkPageBreak(10);
                // Draw vector bullet circle
                doc.setFillColor(37, 99, 235);
                doc.circle(margin + 2.5, yPos - 1.2, 0.75, 'F');

                if (block.leadBold) {
                    const cleanLead = `${sanitizeNoteText(block.leadBold)}: `;
                    const cleanText = sanitizeNoteText(block.text.replace(/\*\*/g, ''));

                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(9.5);
                    const leadWidth = doc.getTextWidth(cleanLead);

                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9.5);

                    const firstLineAvail = maxBulletWidth - leadWidth;
                    const words = cleanText.trim().split(/\s+/).filter(Boolean);
                    const line0Words: string[] = [];
                    let remainingWords: string[] = [];
                    let packed = false;

                    if (firstLineAvail >= 20) {
                        for (let i = 0; i < words.length; i++) {
                            const testStr = line0Words.length === 0 ? words[i] : `${line0Words.join(' ')} ${words[i]}`;
                            if (doc.getTextWidth(testStr) <= firstLineAvail) {
                                line0Words.push(words[i]);
                            } else {
                                remainingWords = words.slice(i);
                                packed = true;
                                break;
                            }
                        }
                        if (!packed) remainingWords = [];
                    } else {
                        remainingWords = words;
                    }

                    // Render Line 0: bold lead + first batch of normal text
                    checkPageBreak(6);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(30, 41, 59);
                    doc.text(cleanLead, margin + bulletIndent, yPos);

                    const l0Text = line0Words.join(' ');
                    if (l0Text) {
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(51, 65, 85);
                        doc.text(l0Text, margin + bulletIndent + leadWidth, yPos);
                    }
                    yPos += 4.8;

                    // Render remaining lines wrapped strictly to maxBulletWidth
                    if (remainingWords.length > 0) {
                        const rest = remainingWords.join(' ');
                        const subLines = doc.splitTextToSize(rest, maxBulletWidth);
                        for (const sLine of subLines) {
                            checkPageBreak(6);
                            doc.setFont('helvetica', 'normal');
                            doc.setTextColor(51, 65, 85);
                            doc.text(sLine, margin + bulletIndent, yPos);
                            yPos += 4.8;
                        }
                    }
                } else {
                    const cleanText = sanitizeNoteText(block.text.replace(/\*\*/g, ''));
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9.5);
                    doc.setTextColor(51, 65, 85);
                    const lines = doc.splitTextToSize(cleanText, maxBulletWidth);
                    for (const line of lines) {
                        checkPageBreak(6);
                        doc.text(line, margin + bulletIndent, yPos);
                        yPos += 4.8;
                    }
                }
                yPos += 2.2;
            } else if (block.type === 'lead_bold') {
                checkPageBreak(12);
                const cleanLead = `${sanitizeNoteText(block.leadBold)}: `;
                const cleanText = sanitizeNoteText(block.text.replace(/\*\*/g, ''));

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9.5);
                const leadWidth = doc.getTextWidth(cleanLead);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9.5);

                const firstLineAvail = maxTextWidth - leadWidth;
                const words = cleanText.trim().split(/\s+/).filter(Boolean);
                const line0Words: string[] = [];
                let remainingWords: string[] = [];
                let packed = false;

                if (firstLineAvail >= 20) {
                    for (let i = 0; i < words.length; i++) {
                        const testStr = line0Words.length === 0 ? words[i] : `${line0Words.join(' ')} ${words[i]}`;
                        if (doc.getTextWidth(testStr) <= firstLineAvail) {
                            line0Words.push(words[i]);
                        } else {
                            remainingWords = words.slice(i);
                            packed = true;
                            break;
                        }
                    }
                    if (!packed) remainingWords = [];
                } else {
                    remainingWords = words;
                }

                // Render Line 0: bold lead + first batch of normal text
                checkPageBreak(6);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(30, 41, 59);
                doc.text(cleanLead, margin, yPos);

                const l0Text = line0Words.join(' ');
                if (l0Text) {
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(51, 65, 85);
                    doc.text(l0Text, margin + leadWidth, yPos);
                }
                yPos += 5;

                // Render remaining lines wrapped strictly to maxTextWidth
                if (remainingWords.length > 0) {
                    const rest = remainingWords.join(' ');
                    const subLines = doc.splitTextToSize(rest, maxTextWidth);
                    for (const sLine of subLines) {
                        checkPageBreak(6);
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(51, 65, 85);
                        doc.text(sLine, margin, yPos);
                        yPos += 5;
                    }
                }
                yPos += 3;
            } else {
                // Regular paragraph
                checkPageBreak(12);
                const cleanText = sanitizeNoteText(block.text.replace(/\*\*/g, ''));
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9.5);
                doc.setTextColor(51, 65, 85);
                const lines = doc.splitTextToSize(cleanText, maxTextWidth);
                for (const line of lines) {
                    checkPageBreak(6);
                    doc.text(line, margin, yPos);
                    yPos += 5;
                }
                yPos += 3.5;
            }
        }
    }

    if (summary) {
        renderSectionTitle('EXECUTIVE SUMMARY', true);
        const summaryBlocks = parseMarkdownBlocks(summary);
        renderBlocks(summaryBlocks);
        yPos += 6;
    }

    if (notes) {
        renderSectionTitle('STRUCTURED STUDY MATERIAL', true);
        const notesBlocks = parseMarkdownBlocks(notes);
        renderBlocks(notesBlocks);
    }

    // --- TWO-PASS HEADER & FOOTER ON ALL PAGES ---
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);

        // Running header on pages 2+
        if (p > 1) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184); // slate-400
            doc.text(`AI NoteMaker  |  ${sanitizeNoteText(chapter || 'Notes')}`, margin, 12);
            doc.text('IVRM Next Study Portal', pageWidth - margin, 12, { align: 'right' });
            doc.setDrawColor(241, 245, 249);
            doc.setLineWidth(0.2);
            doc.line(margin, 14, pageWidth - margin, 14);
        }

        // Running footer on all pages
        const footerY = 286;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.25);
        doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('Generated by IVRM AI NoteMaker  |  Confidential & Educational Use', margin, footerY);
        doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
    }

    return doc;
}

function escapeHtml(str: string): string {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatInlineMarkdown(str: string): string {
    if (!str) return '';
    let text = escapeHtml(str);

    // Bold: **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700; color: #0f172a;">$1</strong>');

    // Italic: *text* (not surrounded by other asterisks)
    text = text.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em style="font-style: italic; color: #334155;">$1</em>');

    // Inline code: `code`
    text = text.replace(
        /`([^`]+)`/g,
        '<code style="background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-size: 11.5px; color: #0f172a;">$1</code>'
    );

    return text;
}

export function renderMarkdownToAcademicHtml(content: string): string {
    if (!content) return '';

    const cleanContent = standardizeNoteMarkdown(content);
    const lines = cleanContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    let html = '';
    let inList = false;
    let inOrderedList = false;

    function closeLists() {
        if (inList) {
            html += '</ul>\n';
            inList = false;
        }
        if (inOrderedList) {
            html += '</ol>\n';
            inOrderedList = false;
        }
    }

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const line = rawLine.trim();

        if (!line) {
            closeLists();
            continue;
        }

        // Horizontal divider
        if (/^(\-{3,}|\*{3,}|_{3,})$/.test(line)) {
            closeLists();
            html += '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 18px 0;" />\n';
            continue;
        }

        // H1 Heading
        if (line.startsWith('# ')) {
            closeLists();
            const text = line.replace(/^#\s+/, '').replace(/\*\*/g, '');
            html += `<h1 style="font-size: 18px; color: #0f172a; font-weight: 800; margin: 20px 0 8px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">${escapeHtml(text)}</h1>\n`;
            continue;
        }

        // H2 Heading
        if (line.startsWith('## ') || (/^\d+[\.\)]\s+[A-Z0-9\s\/\-_–—\(\):,≈~]+$/.test(line) && line.length < 80)) {
            closeLists();
            const text = line.replace(/^##\s+/, '').replace(/\*\*/g, '');
            html += `<h2 style="font-size: 14.5px; color: #1d4ed8; font-weight: 700; margin: 16px 0 6px 0;">${escapeHtml(text)}</h2>\n`;
            continue;
        }

        // H3 Heading
        if (line.startsWith('### ')) {
            closeLists();
            const text = line.replace(/^###\s+/, '').replace(/\*\*/g, '');
            html += `<h3 style="font-size: 13.5px; color: #334155; font-weight: 700; margin: 12px 0 4px 0;">${escapeHtml(text)}</h3>\n`;
            continue;
        }

        // Unordered Bullet point (- or * or +)
        const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
        if (bulletMatch) {
            if (inOrderedList) {
                html += '</ol>\n';
                inOrderedList = false;
            }
            if (!inList) {
                html += '<ul style="list-style: none; padding: 0; margin: 6px 0 10px 0;">\n';
                inList = true;
            }
            const bulletBody = formatInlineMarkdown(bulletMatch[1]);
            html += `  <li style="display: flex; align-items: flex-start; margin-bottom: 6px; font-size: 12.5px; line-height: 1.6; color: #334155;">\n    <span style="display: inline-block; width: 5px; height: 5px; background-color: #2563eb; border-radius: 50%; margin-top: 7px; margin-right: 9px; flex-shrink: 0;"></span>\n    <span style="flex: 1;">${bulletBody}</span>\n  </li>\n`;
            continue;
        }

        // Ordered List (1. 2. etc.)
        const orderedMatch = line.match(/^(\d+)[\.\)]\s+(.*)$/);
        if (orderedMatch) {
            if (inList) {
                html += '</ul>\n';
                inList = false;
            }
            if (!inOrderedList) {
                html += '<ol style="padding-left: 20px; margin: 6px 0 10px 0; font-size: 12.5px; color: #334155;">\n';
                inOrderedList = true;
            }
            const itemBody = formatInlineMarkdown(orderedMatch[2]);
            html += `  <li style="margin-bottom: 6px; line-height: 1.6;">${itemBody}</li>\n`;
            continue;
        }

        // Blockquote
        if (line.startsWith('>')) {
            closeLists();
            const quoteText = line.replace(/^>\s*/, '');
            html += `<blockquote style="border-left: 3px solid #2563eb; background: #f8fafc; padding: 8px 14px; margin: 10px 0; font-style: italic; color: #475569; font-size: 12.5px;">${formatInlineMarkdown(quoteText)}</blockquote>\n`;
            continue;
        }

        // Regular paragraph
        closeLists();
        const paragraphBody = formatInlineMarkdown(line);
        html += `<p style="font-size: 12.5px; line-height: 1.65; color: #334155; margin: 0 0 8px 0;">${paragraphBody}</p>\n`;
    }

    closeLists();
    return html;
}

/**
 * Renders notes using html2canvas for complex/Indic scripts (Hindi, Kannada, Punjabi, etc.).
 * Always generates a dedicated, publication-grade academic A4 document DOM rather than
 * screenshotting interactive web UI widgets.
 */
async function buildHtmlCanvasPdf(options: NoteMakerPdfOptions): Promise<jsPDF> {
    const { chapter, summary, notes } = options;

    const dateStr = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const cleanChapter = escapeHtml(chapter || 'Entire Document');

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.top = '-99999px';
    tempContainer.style.left = '-99999px';
    tempContainer.style.width = '794px';
    tempContainer.style.background = '#ffffff';
    tempContainer.style.color = '#1e293b';
    tempContainer.style.padding = '36px 44px';
    tempContainer.style.fontFamily =
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", "Noto Sans Gurmukhi", "Noto Sans Devanagari", "Noto Sans Malayalam", "Noto Sans Kannada", "Noto Sans Tamil", sans-serif';
    tempContainer.style.boxSizing = 'border-box';

    let innerHtml = `
        <div style="border: 1px solid #e2e8f0; border-left: 5px solid #2563eb; background: #f8fafc; border-radius: 6px; padding: 16px 20px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 11px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.05em;">IVRM Next Academic Study Portal</span>
                <span style="font-size: 11px; color: #64748b;">${dateStr}</span>
            </div>
            <h1 style="margin: 0 0 6px 0; font-size: 20px; color: #0f172a; font-weight: 800; letter-spacing: -0.01em;">AI STUDY NOTES & EXAM GUIDE</h1>
            <p style="margin: 0; font-size: 12.5px; color: #475569; font-weight: 500;">
                Chapter / Subject: <strong style="color: #1e293b;">${cleanChapter}</strong>
            </p>
        </div>
    `;

    if (summary) {
        innerHtml += `
            <div style="margin-bottom: 24px;">
                <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 7px 12px; border-radius: 4px; margin-bottom: 12px;">
                    <h2 style="margin: 0; font-size: 13.5px; color: #1e3a8a; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em;">EXECUTIVE SUMMARY</h2>
                </div>
                <div>
                    ${renderMarkdownToAcademicHtml(summary)}
                </div>
            </div>
        `;
    }

    if (notes) {
        innerHtml += `
            <div style="margin-bottom: 24px;">
                <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 7px 12px; border-radius: 4px; margin-bottom: 12px;">
                    <h2 style="margin: 0; font-size: 13.5px; color: #1e3a8a; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em;">STRUCTURED STUDY MATERIAL</h2>
                </div>
                <div>
                    ${renderMarkdownToAcademicHtml(notes)}
                </div>
            </div>
        `;
    }

    innerHtml += `
        <div style="margin-top: 32px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8;">
            <span>Generated by IVRM AI NoteMaker | Confidential & Educational Use</span>
            <span>IVRM Next Academic Portal</span>
        </div>
    `;

    tempContainer.innerHTML = innerHtml;
    document.body.appendChild(tempContainer);

    try {
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Add subsequent pages if content exceeds 1 page
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        return pdf;
    } finally {
        if (tempContainer?.parentNode) {
            tempContainer.parentNode.removeChild(tempContainer);
        }
    }
}

/**
 * Main function to export/download NoteMaker PDF.
 * Selects the optimal rendering engine based on language script.
 */
export async function exportNoteMakerPdf(options: NoteMakerPdfOptions): Promise<void> {
    const sanitizedSummary = standardizeNoteMarkdown(options.summary || '');
    const sanitizedNotes = standardizeNoteMarkdown(options.notes || '');
    const sanitizedOptions: NoteMakerPdfOptions = {
        ...options,
        summary: sanitizedSummary,
        notes: sanitizedNotes
    };
    const combinedContent = `${sanitizedSummary}\n${sanitizedNotes}`;
    const needsComplexShaping =
        (sanitizedOptions.language && sanitizedOptions.language.toLowerCase() !== 'english') || containsComplexScript(combinedContent);

    let doc: jsPDF;
    if (needsComplexShaping) {
        doc = await buildHtmlCanvasPdf(sanitizedOptions);
    } else {
        doc = buildVectorPdf(sanitizedOptions);
    }

    const cleanChapter = (options.chapter || 'Document').replace(/[^a-zA-Z0-9_\-]/g, '_');
    const finalFileName = options.fileName || `notes-${cleanChapter}-${Date.now()}.pdf`;
    doc.save(finalFileName);
}

/**
 * Helper to trigger clean browser print for the current notes.
 */
export function printNoteMakerContent(options: NoteMakerPdfOptions): void {
    const { chapter } = options;
    const summary = standardizeNoteMarkdown(options.summary || '');
    const notes = standardizeNoteMarkdown(options.notes || '');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const title = `AI Study Notes - ${chapter || 'Chapter'}`;
    const dateStr = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const cleanChapter = escapeHtml(chapter || 'Entire Document');

    let summaryHtml = '';
    if (summary) {
        summaryHtml = `
            <div class="section-banner">EXECUTIVE SUMMARY</div>
            <div>${renderMarkdownToAcademicHtml(summary)}</div>
        `;
    }

    let notesHtml = '';
    if (notes) {
        notesHtml = `
            <div class="section-banner">STRUCTURED STUDY MATERIAL</div>
            <div>${renderMarkdownToAcademicHtml(notes)}</div>
        `;
    }

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                @page {
                    size: A4;
                    margin: 18mm;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", "Noto Sans Gurmukhi", "Noto Sans Devanagari", "Noto Sans Malayalam", "Noto Sans Kannada", "Noto Sans Tamil", sans-serif;
                    color: #1e293b;
                    background: #ffffff;
                    margin: 0;
                    padding: 0;
                    line-height: 1.6;
                }
                .header-card {
                    border: 1px solid #e2e8f0;
                    border-left: 5px solid #2563eb;
                    background: #f8fafc;
                    border-radius: 6px;
                    padding: 16px 20px;
                    margin-bottom: 24px;
                }
                .header-card h1 {
                    margin: 0 0 4px 0;
                    font-size: 20px;
                    color: #0f172a;
                }
                .header-card p {
                    margin: 0;
                    font-size: 12px;
                    color: #64748b;
                }
                .section-banner {
                    background: #eff6ff;
                    border-left: 4px solid #2563eb;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-weight: bold;
                    font-size: 14px;
                    color: #1e40af;
                    margin: 24px 0 12px 0;
                    page-break-after: avoid;
                    break-after: avoid;
                }
                @media print {
                    body { margin: 0; }
                    .section-banner { break-after: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="header-card">
                <h1>AI STUDY NOTES & EXAM GUIDE</h1>
                <p>Chapter: ${cleanChapter}  |  Date: ${dateStr}  |  IVRM Next Academic System</p>
            </div>
            ${summaryHtml}
            ${notesHtml}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 1000);
                };
            </script>
        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
}
