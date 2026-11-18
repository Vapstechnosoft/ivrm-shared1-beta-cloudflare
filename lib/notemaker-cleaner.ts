/**
 * Utility to sanitize, standardize, and clean AI-generated Academic Notes and Summaries.
 * Fixes stray, unbalanced, or unwanted asterisks (* and **), converts chapter and section
 * headers to standard Markdown, standardizes bullet lists and dividers, and eliminates
 * any formatting artifacts that degrade readability.
 */

/**
 * Normalizes spaced-out characters resulting from PDF kerning/tracking extraction artifacts,
 * e.g., "R e t r i e v a l" -> "Retrieval", "r e a l   t i m e" -> "real time".
 */
export function normalizeSpacedLetters(text: string): string {
    if (!text) return '';
    // Fix spaced out characters from PDF tracking/kerning artifacts e.g. "R e t r i e v a l" -> "Retrieval"
    let res = text.replace(/\b([A-Za-z](?:\s[A-Za-z]){2,})\b/g, (m) => m.replace(/\s+/g, ''));
    // Fix spacing before punctuation e.g. "word ." -> "word."
    res = res.replace(/\s+([.,;:!?])/g, '$1');
    // Collapse consecutive spaces (preserving newlines)
    res = res.replace(/[^\S\r\n]{2,}/g, ' ');
    return res;
}

export function standardizeNoteMarkdown(content: string): string {
    if (!content) return '';

    let text = normalizeSpacedLetters(content.replace(/\r\n/g, '\n').replace(/\r/g, '\n'));

    // 1. Standardize major chapter headers wrapped in asterisks or symbols to standard H1
    // e.g. "*CHAPTER 1 – ...**", "**CHAPTER 1 – ...**", "***CHAPTER 1 – ...***", or starting with bullet dot "• *CHAPTER 1..."
    text = text.replace(/^(?:\s*[-*•\s]*)?\*{1,3}\s*((?:CHAPTER|UNIT|MODULE|LESSON)\s+[0-9IVXLCDM]+[^\n*]*?)\s*\*{1,3}(?:\s*)$/gim, '# $1');

    // Any line that starts with CHAPTER/UNIT/MODULE without a markdown heading
    text = text.replace(/^(?:\s*[-*•\s]*)((?:CHAPTER|UNIT|MODULE|LESSON)\s+[0-9IVXLCDM]+[:\s–—\-][^\n]+)$/gim, (_match, p1) => {
        const clean = p1
            .replace(/^[-*•\s]+/, '')
            .replace(/\*+/g, '')
            .trim();
        return `# ${clean}`;
    });

    // 2. Standardize dividers: e.g. "--", "---", "***", "___", or bullet with divider "• --"
    text = text.replace(/^(?:\s*[-*•\s]*)(?:-{2,}|\*{3,}|_{3,})(?:\s*)$/gm, '\n---\n');

    // 3. Standardize numbered major sections to H2
    // e.g. "**1. EXHAUSTIVE INTRODUCTION (~250 WORDS)**"
    // e.g. "1. **EXHAUSTIVE INTRODUCTION (~250 WORDS)**"
    // e.g. "1. EXHAUSTIVE INTRODUCTION (≈250 WORDS)"
    text = text.replace(/^(?:\s*)(?:##\s*)?\*{0,3}(\d+[\.\)]\s+[A-Z0-9\s\/\-_–—\(\):,≈~]+?)\*{0,3}(?:\s*)$/gm, (match, p1) => {
        const clean = p1.replace(/\*+/g, '').trim();
        // Only if it looks like a major section heading (uppercase words and reasonable length)
        if (clean.length < 90 && /[A-Z]{3,}/.test(clean)) {
            return `## ${clean}`;
        }
        return match;
    });

    // 4. Standalone sub-topic bold lines to H3
    // e.g. "**CONCEPTUAL DEEP-DIVE**" or "**CRITICAL ANALYSIS & EXAM PREP**"
    text = text.replace(/^(?:\s*)\*{2,3}([A-Z0-9\s\-_–—\(\):,]{4,60})\*{2,3}(?:\s*)$/gm, '### $1');

    // 5. Fix bullet points:
    // Only lines starting with a bullet marker followed by space
    text = text.replace(/^(?:\s*)(?:[\*\+\-•])\s+/gm, '- ');

    // 6. Fix internal whitespace in bold markers: "** text **" or "**text **" -> "**text**"
    // CommonMark disallows whitespace immediately following opening ** or preceding closing **.
    // Azure Translator frequently generates spaces inside bold markers.
    text = text.replace(/\*\*\s*([^*\n]+?)\s*\*\*/g, (_match, p1) => {
        const trimmed = p1.trim();
        return trimmed ? `**${trimmed}**` : '';
    });

    // 7. Fix internal whitespace in italic markers: "* text *" -> "*text*"
    text = text.replace(/(?<!\*)\*\s*([^*\n]+?)\s*\*(?!\*)/g, (_match, p1) => {
        const trimmed = p1.trim();
        return trimmed ? `*${trimmed}*` : '';
    });

    // 8. Fix unbalanced or malformed asterisks inside text across all Unicode scripts:
    // Pattern: "*word**" -> "**word**"
    text = text.replace(/(^|[^\*])\*(?!\*)([^*\n]{2,60})\*\*(?!\*)/gu, '$1**$2**');
    // Pattern: "**word*" -> "**word**"
    text = text.replace(/(^|[^\*])\*\*(?!\*)([^*\n]{2,60})\*(?!\*)/gu, '$1**$2**');

    // 9. Replace triple asterisks "***bold italic***" with clean bold "**bold italic**"
    text = text.replace(/\*\*\*([^*]+?)\*\*\*/g, '**$1**');

    // 10. Fix empty or corrupt bold tags: "****" or "** **"
    text = text.replace(/\*\*\s*\*\*/g, '');

    // 11. Remove stray isolated asterisks:
    // e.g. " * " or isolated asterisk surrounded by spaces
    text = text.replace(/(\s)\*(\s)/g, '$1$2');

    // 12. Clean markdown headings that still have bold markers inside them
    // e.g. "## **1. Introduction**" -> "## 1. Introduction"
    text = text.replace(/^(#{1,6}\s+)\*{1,3}(.*?)\*{1,3}$/gm, '$1$2');

    // 13. Ensure colon spacing is clean after bold term: e.g. "**Term** :" -> "**Term**:"
    text = text.replace(/\*\*([^*\n]+?)\*\*\s*:/g, '**$1**:');

    // 11. Repair any odd/unclosed bold tags per line so text doesn't leak raw asterisks
    const lines = text.split('\n');
    const processedLines = lines.map((line) => {
        // Skip code fences or dividers
        if (/^(---\s*|```)/.test(line.trim())) return line;

        // If line is a heading, strip remaining asterisks
        if (/^#{1,6}\s+/.test(line.trim())) {
            return line.replace(/\*+/g, '');
        }

        const boldMatches = line.match(/\*\*/g);
        if (boldMatches && boldMatches.length % 2 !== 0) {
            // Unmatched '**' on this line.
            // If it's a lead definition e.g. "- **Key Term: rest of explanation"
            const leadMatch = line.match(/^(\s*(?:-\s+)?)\*\*([^*:\n]+):?(.*)$/);
            if (leadMatch) {
                return `${leadMatch[1]}**${leadMatch[2].trim()}**: ${leadMatch[3].trim()}`;
            }
            // Otherwise remove the orphan '**'
            return line.replace(/\*\*/, '');
        }
        return line;
    });

    // 12. Collapse excessive consecutive blank lines (max 2)
    return processedLines
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
