'use server';

import zlib from 'zlib';
import Groq from 'groq-sdk';
import pdf from 'pdf-parse';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || process.env.note_Groq_api_key || ''
});

function extractTextFromDocx(buffer: Buffer): string {
    try {
        let offset = 0;
        while (offset < buffer.length - 46) {
            // Check for Central Directory File Header signature 'PK\x01\x02'
            if (buffer[offset] === 0x50 && buffer[offset + 1] === 0x4b && buffer[offset + 2] === 0x01 && buffer[offset + 3] === 0x02) {
                const compressionMethod = buffer.readUInt16LE(offset + 10);
                const compressedSize = buffer.readUInt32LE(offset + 20);
                const filenameLength = buffer.readUInt16LE(offset + 28);
                const extraFieldLength = buffer.readUInt16LE(offset + 30);
                const commentLength = buffer.readUInt16LE(offset + 32);
                const localHeaderOffset = buffer.readUInt32LE(offset + 42);

                const filename = buffer.toString('utf-8', offset + 46, offset + 46 + filenameLength);

                if (filename === 'word/document.xml' || filename.endsWith('/document.xml')) {
                    // Read local header to get filename & extra field lengths at localHeaderOffset
                    if (localHeaderOffset + 30 <= buffer.length) {
                        const localFilenameLen = buffer.readUInt16LE(localHeaderOffset + 26);
                        const localExtraFieldLen = buffer.readUInt16LE(localHeaderOffset + 28);
                        const dataOffset = localHeaderOffset + 30 + localFilenameLen + localExtraFieldLen;

                        if (dataOffset + compressedSize <= buffer.length) {
                            const compressedData = buffer.subarray(dataOffset, dataOffset + compressedSize);
                            let xmlText = '';
                            if (compressionMethod === 8) {
                                xmlText = zlib.inflateRawSync(compressedData).toString('utf-8');
                            } else if (compressionMethod === 0) {
                                xmlText = compressedData.toString('utf-8');
                            }

                            // Strip XML tags, specifically targeting <w:t> tags
                            const matches = xmlText.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
                            if (matches) {
                                return matches.map((m) => m.replace(/<[^>]+>/g, '')).join(' ');
                            }
                            return xmlText.replace(/<[^>]+>/g, ' ');
                        }
                    }
                }

                // Move to next Central Directory entry
                offset = offset + 46 + filenameLength + extraFieldLength + commentLength;
            } else {
                offset++;
            }
        }
    } catch (err) {
        console.error('Failed to parse docx natively:', err);
    }
    return '';
}

function cleanBinaryText(buffer: Buffer): string {
    const text = buffer.toString('utf-8');
    // Strip non-printable control characters, leaving readable text and standard punctuation
    return text
        .replace(/[^\x20-\x7E\u00A0-\u00FF\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function compareTwoStrings(first: string, second: string): number {
    first = first.replace(/\s+/g, '').toLowerCase();
    second = second.replace(/\s+/g, '').toLowerCase();

    if (first === second) return 1; // identical
    if (first.length < 2 || second.length < 2) return 0; // too short

    const firstBigrams = new Map<string, number>();
    for (let i = 0; i < first.length - 1; i++) {
        const bigram = first.substring(i, i + 2);
        const count = firstBigrams.has(bigram) ? (firstBigrams.get(bigram) || 0) + 1 : 1;
        firstBigrams.set(bigram, count);
    }

    let intersection = 0;
    for (let i = 0; i < second.length - 1; i++) {
        const bigram = second.substring(i, i + 2);
        const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) || 0 : 0;

        if (count > 0) {
            firstBigrams.set(bigram, count - 1);
            intersection++;
        }
    }

    return (2.0 * intersection) / (first.length + second.length - 2);
}

function findBestMatch(mainString: string, targetStrings: string[]) {
    if (!targetStrings || targetStrings.length === 0) {
        return { ratings: [], bestMatch: { target: '', rating: 0 }, bestMatchIndex: -1 };
    }

    const ratings = [];
    let bestMatchIndex = 0;

    for (let i = 0; i < targetStrings.length; i++) {
        const currentTargetString = targetStrings[i];
        const currentRating = compareTwoStrings(mainString, currentTargetString);
        ratings.push({ target: currentTargetString, rating: currentRating });
        if (currentRating > ratings[bestMatchIndex].rating) {
            bestMatchIndex = i;
        }
    }

    const bestMatch = ratings[bestMatchIndex];

    return { ratings: ratings, bestMatch: bestMatch, bestMatchIndex: bestMatchIndex };
}

async function extractTextFromFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name.toLowerCase();
    const mimeType = file.type.toLowerCase();

    // Check if it is a PDF (by extension, mime-type, or PDF header signature '%PDF')
    const isPDF = fileName.endsWith('.pdf') || mimeType === 'application/pdf' || buffer.toString('utf-8', 0, 4) === '%PDF';

    if (isPDF) {
        try {
            const data = await pdf(buffer);
            return data.text;
        } catch (err) {
            console.error('Error parsing PDF buffer:', err);
        }
    }

    // Check if it is a Word document
    const isWord =
        fileName.endsWith('.docx') ||
        fileName.endsWith('.doc') ||
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword';

    if (isWord) {
        try {
            // Attempt native zip decompression for docx
            const text = extractTextFromDocx(buffer);
            if (text) return text;
        } catch (err) {
            console.error('Error in Native Docx parser:', err);
        }
    }

    // Default fallback to string conversion with binary cleansing
    return cleanBinaryText(buffer);
}

async function extractMinExperienceFromJD(jdText: string): Promise<number> {
    try {
        // 1. Prioritize AI for context-aware extraction
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content:
                        'Extract the minimum years of experience required from the JD. Return ONLY the number (e.g. 3). If not mentioned or fresher is allowed, return 0.'
                },
                {
                    role: 'user',
                    content: jdText
                }
            ],
            model: 'openai/gpt-oss-120b',
            temperature: 0.1,
            max_tokens: 5
        });

        const content = response.choices[0]?.message?.content || '0';
        const match = content.match(/\d+/);
        const aiYears = match ? Number.parseInt(match[0], 10) : 0;
        if (aiYears > 0) {
            return aiYears;
        }

        // 2. Try simple regex as fallback
        const regexMatch = jdText.match(/(?:experience|required|min|minimum)?\s*[:\-\s]*(\d+)\+?\s*(?:years?|yrs?)/i);
        if (regexMatch && regexMatch[1]) {
            const parsedRegex = Number.parseInt(regexMatch[1], 10);
            if (parsedRegex < 30) {
                // sanity check for unrealistic numbers
                return parsedRegex;
            }
        }

        return 0;
    } catch (error) {
        console.error('Error extracting experience from JD:', error);
        return 0;
    }
}

async function extractEducationRequirementFromJD(jdText: string): Promise<string | null> {
    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content:
                        'Extract the minimum/required education degree or field (e.g. MCA, B.Tech, Computer Science Degree, Bachelor\'s, Master\'s) from the JD text. Return ONLY the degree/field name (e.g. "MCA" or "Bachelor\'s in Computer Science"). If no specific education requirement is mentioned, return "None".'
                },
                {
                    role: 'user',
                    content: jdText.substring(0, 3000)
                }
            ],
            model: 'openai/gpt-oss-120b',
            temperature: 0.1,
            max_tokens: 30
        });

        const content = response.choices[0]?.message?.content?.trim() || 'None';
        const sanitized = content.replace(/['"]+/g, '').trim();
        if (sanitized.toLowerCase() === 'none' || sanitized.toLowerCase() === 'no education requirement specified') {
            return null;
        }
        return sanitized;
    } catch (error) {
        console.error('Error extracting education requirement from JD:', error);
        return null;
    }
}

async function extractCandidateEducation(resumeText: string): Promise<string | null> {
    try {
        if (!resumeText || resumeText.trim().length < 50) {
            return null;
        }

        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a precise resume parser. Extract the highest education degree obtained by the candidate from their resume text. Return ONLY the degree name (e.g. "B.Tech in Computer Science", "MCA", "BCA", "M.Sc"). If no specific degree is found in the text, return "None". Do NOT default to any degree or hallucinate.'
                },
                {
                    role: 'user',
                    content: resumeText.substring(0, 4000)
                }
            ],
            model: 'openai/gpt-oss-120b',
            temperature: 0.0,
            max_tokens: 30
        });

        const content = response.choices[0]?.message?.content?.trim() || 'None';
        const sanitized = content.replace(/['"\.]+/g, '').trim();
        if (
            sanitized.toLowerCase() === 'none' ||
            sanitized.toLowerCase().includes('not found') ||
            sanitized.toLowerCase().includes('not specified') ||
            sanitized.length < 2
        ) {
            return null;
        }
        return sanitized;
    } catch (error) {
        console.error('Error extracting education from resume:', error);
        return null;
    }
}

async function extractRequiredSkillsFromJD(jdText: string): Promise<{ technical: string[]; soft: string[] }> {
    try {
        if (!jdText || jdText.trim().length < 10) {
            return { technical: [], soft: [] };
        }

        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a precise ATS skill extractor. Analyze the job description and extract a flat list of required skills. Split them into "technical" (languages, frameworks, databases, tools, platforms, deployment, cloud) and "soft" (communication, leadership, interpersonal, etc.). Return a clean JSON object: {"technical": string[], "soft": string[]}. Do NOT hallucinate.'
                },
                {
                    role: 'user',
                    content: jdText
                }
            ],
            model: 'openai/gpt-oss-120b',
            response_format: { type: 'json_object' },
            temperature: 0.0
        });

        const rawContent = response.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(rawContent);

        return {
            technical: Array.isArray(parsed.technical) ? parsed.technical.map((s: any) => String(s).trim().toLowerCase()) : [],
            soft: Array.isArray(parsed.soft) ? parsed.soft.map((s: any) => String(s).trim().toLowerCase()) : []
        };
    } catch (error) {
        console.error('Error extracting required skills from JD:', error);
        return { technical: [], soft: [] };
    }
}

async function extractCandidateSkillsFromResume(resumeText: string): Promise<{ technical: string[]; soft: string[] }> {
    try {
        if (!resumeText || resumeText.trim().length < 50) {
            return { technical: [], soft: [] };
        }

        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a precise resume parser. Extract all technical skills and soft skills mentioned in the candidate\'s resume text. Return a clean JSON object: {"technical": string[], "soft": string[]}. Do NOT hallucinate.'
                },
                {
                    role: 'user',
                    content: resumeText.substring(0, 4000)
                }
            ],
            model: 'openai/gpt-oss-120b',
            response_format: { type: 'json_object' },
            temperature: 0.0
        });

        const rawContent = response.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(rawContent);

        return {
            technical: Array.isArray(parsed.technical) ? parsed.technical.map((s: any) => String(s).trim().toLowerCase()) : [],
            soft: Array.isArray(parsed.soft) ? parsed.soft.map((s: any) => String(s).trim().toLowerCase()) : []
        };
    } catch (error) {
        console.error('Error extracting candidate skills from resume:', error);
        return { technical: [], soft: [] };
    }
}

function computeSkillMatching(candidateTechSkills: string[], requiredTechSkills: string[]) {
    const matched: string[] = [];
    const missing: string[] = [];

    const candNormalized = candidateTechSkills.map((s) => s.toLowerCase().trim()).filter(Boolean);

    for (const reqSkill of requiredTechSkills) {
        const normalizedReq = reqSkill.toLowerCase().trim();
        if (!normalizedReq) continue;

        let isMatched = false;
        for (const candSkill of candNormalized) {
            if (candSkill === normalizedReq || candSkill.includes(normalizedReq) || normalizedReq.includes(candSkill)) {
                isMatched = true;
                break;
            }
            const sim = compareTwoStrings(candSkill, normalizedReq);
            if (sim > 0.7) {
                isMatched = true;
                break;
            }
        }

        if (isMatched) {
            matched.push(reqSkill);
        } else {
            missing.push(reqSkill);
        }
    }

    const match_pct = requiredTechSkills.length > 0 ? Math.round((matched.length / requiredTechSkills.length) * 100) : 100;

    return { matched, missing, match_pct };
}

async function checkEducationMatch(candidateEdu: string, requiredEdu: string): Promise<boolean> {
    const cand = candidateEdu.toLowerCase().trim();
    const req = requiredEdu.toLowerCase().trim();

    // 1. Direct matches & substring check
    if (cand === req || cand.includes(req) || req.includes(cand)) {
        return true;
    }

    // 2. Acronym/Common degree expansions (e.g. "MCA" <=> "Master of Computer Applications")
    const degreeAbbreviations: Record<string, string[]> = {
        mca: ['master of computer applications', 'master in computer applications', 'm.c.a.'],
        btech: ['bachelor of technology', 'b.tech', 'b. tech', 'btech'],
        be: ['bachelor of engineering', 'b.e.', 'b. e.', 'be'],
        mtech: ['master of technology', 'm.tech', 'm. tech', 'mtech'],
        mba: ['master of business administration', 'm.b.a.', 'mba'],
        bsc: ['bachelor of science', 'b.sc', 'bsc'],
        msc: ['master of science', 'm.sc', 'msc'],
        bca: ['bachelor of computer applications', 'b.c.a.', 'bca']
    };

    // Check abbreviation matching
    for (const [abbr, terms] of Object.entries(degreeAbbreviations)) {
        const hasAbbrReq = req === abbr || req.includes(abbr) || terms.some((t) => req.includes(t));
        const hasAbbrCand = cand === abbr || cand.includes(abbr) || terms.some((t) => cand.includes(t));
        if (hasAbbrReq && hasAbbrCand) {
            return true;
        }
    }

    // 3. String-Similarity Match (Dice's Coefficient)
    const score = compareTwoStrings(cand, req);
    if (score > 0.6) {
        return true;
    }

    // 4. Fallback to AI for semantic equivalence (e.g. CSE degree vs Computer Science Degree)
    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content:
                        'Determine if the candidate\'s education degree/field meets or is equivalent to or higher than the required education for the job. For example, if MCA is required and candidate has MCA, that meets. Return ONLY "YES" or "NO".'
                },
                {
                    role: 'user',
                    content: `Candidate Education: ${candidateEdu}\nRequired Education: ${requiredEdu}`
                }
            ],
            model: 'openai/gpt-oss-120b',
            temperature: 0.1,
            max_tokens: 5
        });

        const content = response.choices[0]?.message?.content?.trim()?.toUpperCase() || 'NO';
        return content.includes('YES');
    } catch (error) {
        console.error('Error checking education match:', error);
        return false;
    }
}

async function extractCandidateFallback(resumeText: string): Promise<any> {
    try {
        if (!resumeText || resumeText.trim().length < 50) {
            return null;
        }

        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a precise resume parser. Extract candidate details from the resume text in JSON format: {"name": string, "years": number, "education": string}. For "years", calculate total professional experience years. For "education", extract the highest degree obtained. If fresher/student, return 0 for years. Do NOT default to any degree or name unless explicitly written in the text.'
                },
                {
                    role: 'user',
                    content: resumeText.substring(0, 4000)
                }
            ],
            model: 'openai/gpt-oss-120b',
            response_format: { type: 'json_object' },
            temperature: 0.0
        });

        const rawContent = response.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(rawContent);

        // Normalize keys case-insensitively
        let name = '';
        let years = 0;
        let education = '';

        for (const key of Object.keys(parsed)) {
            const lowerKey = key.toLowerCase();
            const val = parsed[key];
            if (lowerKey.includes('name')) {
                name = String(val);
            } else if (lowerKey.includes('year') || lowerKey.includes('exp') || lowerKey.includes('work')) {
                years = Number(val) || 0;
            } else if (
                lowerKey.includes('edu') ||
                lowerKey.includes('degree') ||
                lowerKey.includes('field') ||
                lowerKey.includes('qualification')
            ) {
                education = String(val);
            }
        }

        // 2. Try a quick regex fallback if AI did not find years
        let regexYears = 0;
        if (years === 0) {
            const expMatch = resumeText.match(/(?:total|overall|work)?\s*experience\s*[:\-\s]*(\d+)\+?\s*(?:years?|yrs?)/i);
            regexYears = expMatch ? Number.parseInt(expMatch[1], 10) : 0;
        }

        let cleanEdu = education || parsed.education || '';
        const lowerEdu = cleanEdu.toLowerCase();
        if (lowerEdu === 'none' || lowerEdu.includes('not found') || lowerEdu.includes('not specified') || cleanEdu.length < 2) {
            cleanEdu = '';
        }

        return {
            name: name || parsed.name || '',
            years: Math.max(regexYears, years),
            education: cleanEdu
        };
    } catch (e) {
        console.error('Local fallback extraction failed:', e);
        return null;
    }
}

export async function analyzeResume(formData: FormData) {
    try {
        const resumeFile = formData.get('resume') as File | null;
        const jdFile = formData.get('jd_file') as File | null;
        const jdText = formData.get('jd_text') as string | null;

        if (!resumeFile) {
            return { success: false, error: 'Resume file is required.' };
        }

        // 1. Extract JD Text and Resume Text for our local AI pre-processing
        let finalJdText = jdText || '';
        if (jdFile && jdFile.size > 0) {
            try {
                finalJdText = await extractTextFromFile(jdFile);
            } catch (err) {
                console.error('Error parsing JD file:', err);
            }
        }

        let resumeText = '';
        try {
            resumeText = await extractTextFromFile(resumeFile);
            console.log(`Local Resume Text Extracted: Length=${resumeText.length} characters`);
            if (resumeText.length > 0) {
                console.log(`First 150 chars: ${resumeText.substring(0, 150).replace(/\s+/g, ' ')}`);
            }
        } catch (err) {
            console.error('Error parsing resume file:', err);
        }

        // 2. Use local AI to extract min_experience and education requirements accurately
        const extractedMinExp = await extractMinExperienceFromJD(finalJdText);
        console.log(`AI Extracted Min Experience from JD: ${extractedMinExp} years`);

        const extractedEducationReq = await extractEducationRequirementFromJD(finalJdText);
        console.log(`AI Extracted Education Requirement from JD: ${extractedEducationReq}`);

        let localExtractedCandidateEdu: string | null = null;
        if (resumeText && resumeText.length > 50) {
            localExtractedCandidateEdu = await extractCandidateEducation(resumeText);
            console.log(`AI Extracted Candidate Education from resume: ${localExtractedCandidateEdu}`);
        }

        const localJdSkills = await extractRequiredSkillsFromJD(finalJdText);
        console.log(`AI Extracted JD Skills:`, localJdSkills);

        let localCandidateSkills: { technical: string[]; soft: string[] } = { technical: [], soft: [] };
        if (resumeText && resumeText.length > 50) {
            localCandidateSkills = await extractCandidateSkillsFromResume(resumeText);
            console.log(`AI Extracted Candidate Skills:`, localCandidateSkills);
        }

        // 3. Prepare for Backend API call
        const backendFormData = new FormData();
        backendFormData.append('resume', resumeFile);

        if (jdFile && jdFile.size > 0) {
            backendFormData.append('jd', jdFile);
        } else {
            const jdContent = finalJdText || 'No job description provided.';
            const jdBlob = new Blob([jdContent], { type: 'text/plain' });
            backendFormData.append('jd', jdBlob, 'jd.txt');
        }

        console.log('Sending request to ATS backend...');

        const response = await fetch('https://ats-aivrm.onrender.com/analyze', {
            method: 'POST',
            body: backendFormData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            return { success: false, error: `Backend API error: ${response.status}` };
        }

        const data = await response.json();
        console.log('Backend response received:', !!data.candidate);

        // --- Aggressive Normalization & Fallback Layer ---
        // 1. Ensure data.candidate exists even if backend failed completely
        if (!data.candidate) {
            data.candidate = { name: 'Unknown Candidate', experience_years: 0, skills: { technical: [], soft: [] } };
        }

        const c = data.candidate;

        // 2. Run local AI candidate extraction ALWAYS if resume text is available, to compare/improve results
        let fallback: any = null;
        try {
            if (resumeText && resumeText.length > 50) {
                console.log('Triggering aggressive local AI extraction to cross-verify backend...');
                fallback = await extractCandidateFallback(resumeText);
                console.log('Local AI candidate extraction completed:', fallback);
            }
        } catch (e) {
            console.error('Local fallback extraction failed:', e);
        }

        // 3. Final Normalization & Smart Merging
        // Name override: if backend has Unknown or very short, use local
        c.name = c.name || c.full_name || c.candidate_name || 'Unknown Candidate';
        if (fallback?.name && (c.name === 'Unknown Candidate' || c.name.toLowerCase().includes('unknown') || c.name.length < 3)) {
            c.name = fallback.name;
        }

        // Normalize Contact
        c.email = c.email || c.email_address || 'Not extracted';
        c.phone = c.phone || c.phone_number || c.contact || 'Not extracted';

        // Normalize Experience: Override if backend is 0 or extremely low compared to local extraction
        let exp = c.experience_years ?? c.years_of_experience ?? c.total_experience ?? 0;
        if (typeof exp === 'string') {
            exp = Number.parseInt(exp.replace(/[^0-9.]/g, ''), 10) || 0;
        }
        c.experience_years = Number(exp);

        if (fallback?.years > 0 && (c.experience_years === 0 || fallback.years > c.experience_years)) {
            console.log(`Overriding candidate experience: backend had ${c.experience_years}, using local AI: ${fallback.years}`);
            c.experience_years = fallback.years;
        }

        // Normalize Education: Always prioritize the unbiased local AI's extracted degree from the resume text.
        // The remote backend suffers from a JD-bias bug (it copies the JD's education requirement as the candidate's education).
        const backendEdu = c.education?.field || c.education?.degree || (typeof c.education === 'string' ? c.education : null);
        const isGarbageBackendEdu =
            !backendEdu ||
            backendEdu.toLowerCase().includes('knowledge') ||
            backendEdu.toLowerCase().includes('experience') ||
            backendEdu.toLowerCase().includes('designing') ||
            backendEdu.toLowerCase().includes('unknown') ||
            backendEdu.toLowerCase().includes('not specified');

        let candidateEdu = localExtractedCandidateEdu;
        if (!candidateEdu && fallback?.education) {
            candidateEdu = fallback.education;
        }

        if (candidateEdu && candidateEdu.length > 1) {
            console.log(`Overriding candidate education: backend had "${backendEdu}", using local unbiased AI: "${candidateEdu}"`);
            c.education = { field: candidateEdu };
        } else if (backendEdu && !isGarbageBackendEdu) {
            c.education = { field: backendEdu };
        } else {
            c.education = { field: 'Not specified' };
        }

        // Normalize Skills (Handle array vs object)
        if (Array.isArray(c.skills)) {
            c.skills = { technical: c.skills, soft: [] };
        } else if (!c.skills) {
            c.skills = { technical: [], soft: [] };
        } else {
            // Technical
            if (!c.skills.technical && c.skills.technical_skills) {
                c.skills.technical = c.skills.technical_skills;
            } else if (!c.skills.technical) {
                c.skills.technical = [];
            }
            // Soft
            if (!c.skills.soft && c.skills.soft_skills) {
                c.skills.soft = c.skills.soft_skills;
            } else if (!c.skills.soft) {
                c.skills.soft = [];
            }
        }

        // Merge candidate technical and soft skills with our local AI's high-precision extraction
        if (localCandidateSkills?.technical?.length > 0) {
            c.skills.technical = Array.from(
                new Set([
                    ...c.skills.technical.map((s: string) => s.toLowerCase().trim()),
                    ...localCandidateSkills.technical.map((s: string) => s.toLowerCase().trim())
                ])
            ).filter(Boolean);
        }
        if (localCandidateSkills?.soft?.length > 0) {
            c.skills.soft = Array.from(
                new Set([
                    ...c.skills.soft.map((s: string) => s.toLowerCase().trim()),
                    ...localCandidateSkills.soft.map((s: string) => s.toLowerCase().trim())
                ])
            ).filter(Boolean);
        }

        // 4. Augment backend response with our accurately extracted experience
        if (!data.job) data.job = {};
        if (extractedMinExp > 0 || !data.job.min_experience) {
            data.job.min_experience = extractedMinExp;
        }

        const finalMinExp = data.job.min_experience || 0;

        // Ensure job has required_skills structure for summary
        if (!data.job.required_skills) {
            data.job.required_skills = { technical: [], soft: [] };
        }

        // Update experience breakdown
        if (!data.score) data.score = { value: 0, decision: 'NEEDS REVIEW', breakdown: {} };
        if (!data.score.breakdown) data.score.breakdown = {};

        data.score.breakdown.experience = {
            required: finalMinExp,
            meets: (data.candidate?.experience_years || 0) >= finalMinExp,
            note: finalMinExp === 0 ? 'No minimum specified' : `${finalMinExp}+ years required`
        };

        // Update education breakdown
        let meetsEducation = true;
        let educationNote = 'No education requirement specified';

        if (extractedEducationReq) {
            const currentCandidateEdu = c.education?.field || c.education?.degree || null;
            if (currentCandidateEdu && currentCandidateEdu !== 'Not specified') {
                meetsEducation = await checkEducationMatch(currentCandidateEdu, extractedEducationReq);
                educationNote = meetsEducation
                    ? `Meets requirement: candidate has ${currentCandidateEdu} (${extractedEducationReq} required)`
                    : `Does not meet requirement: candidate has ${currentCandidateEdu} (${extractedEducationReq} required)`;
            } else {
                meetsEducation = false;
                educationNote = `Requires ${extractedEducationReq} (Not found in resume)`;
            }
        }

        data.score.breakdown.education = {
            meets: meetsEducation,
            note: educationNote,
            candidate: c.education?.field || null,
            required: extractedEducationReq
        };

        // Compute and override required_technical_skills breakdown using our high-precision Dice matching
        const finalJdTechSkills = localJdSkills.technical.length > 0 ? localJdSkills.technical : data.job?.required_skills?.technical || [];

        const skillMatchResult = computeSkillMatching(c.skills?.technical || [], finalJdTechSkills);

        data.score.breakdown.required_technical_skills = {
            matched: skillMatchResult.matched,
            missing: skillMatchResult.missing,
            match_pct: skillMatchResult.match_pct
        };

        // Update technical and soft skills under job.required_skills
        data.job.required_skills = {
            technical: finalJdTechSkills,
            soft: localJdSkills.soft.length > 0 ? localJdSkills.soft : data.job?.required_skills?.soft || []
        };

        // 5. Handle Report/Summary Fallback
        if ((!data.report?.text || data.report?.error) && groq.apiKey) {
            try {
                console.log('Backend report failed or missing, generating local AI summary...');
                const summaryPrompt = `
                    Provide a deep, 3-part analysis of this candidate's suitability for the role:
                    
                    1. EXECUTIVE SUMMARY: A professional overview of the match.
                    2. KEY STRENGTHS: List the top 2-3 technical or soft skills they possess that align with the JD.
                    3. CRITICAL GAPS: List the specific skills or experience they are missing.

                    CANDIDATE DATA:
                    Score: ${data.score?.value}/100
                    Name: ${data.candidate?.name}
                    Skills: ${data.candidate?.skills?.technical?.join(', ') || 'None listed'}
                    JD Requirements: ${data.job?.required_skills?.technical?.join(', ') || 'None listed'}
                    Experience: ${data.candidate?.experience_years || 0} years vs ${finalMinExp} years required.
                    Education: Candidate has "${c.education?.field || 'Not specified'}" vs Required Education "${extractedEducationReq || 'No specific education requirement specified'}".
                `;

                const reportResponse = await groq.chat.completions.create({
                    messages: [
                        {
                            role: 'system',
                            content:
                                'You are an Elite AI Recruitment Analyst. Provide a structured report with three sections: EXECUTIVE SUMMARY, KEY STRENGTHS, and CRITICAL GAPS. Be direct and professional. Use simple capital headers for sections. Do not use asterisks or hashes.'
                        },
                        {
                            role: 'user',
                            content: summaryPrompt
                        }
                    ],
                    model: 'openai/gpt-oss-120b',
                    temperature: 0.7,
                    max_tokens: 1024
                });

                data.report = {
                    text: reportResponse.choices[0]?.message?.content || 'Summary generation failed.',
                    model: 'openai/gpt-oss-120b',
                    success: true
                };
            } catch (err) {
                console.error('Failed to generate local report:', err);
            }
        }

        // Clean up any markdown artifacts from the report text
        if (data.report?.text) {
            data.report.text = data.report.text.replace(/\*\*/g, '').replace(/#/g, '').trim();
        }

        return { success: true, data };
    } catch (error: any) {
        console.error('Server action error:', error);
        return { success: false, error: error.message || 'Failed to connect to the analysis server.' };
    }
}
