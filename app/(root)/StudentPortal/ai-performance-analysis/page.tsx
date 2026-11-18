'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { read, utils } from 'xlsx';
import { ClassAnalysisView } from './_components/class-analysis-view';
import { FileUploader } from './_components/file-uploader';
import { StudentAnalysisView } from './_components/student-analysis-view';

import {
    analyzeClassPerformance,
    analyzeStudentPerformance,
    extractStudentDataFromPdf
} from '@/server/exam/exam-module/ai-analysis_/ai-analysis';
import { formatAiErrorMessage } from '@/lib/ai-error-handler';
import type { ClassAnalysis, IndividualAnalysis, StudentPerformance, StudentSubject } from '@/types/exam/exam-module/ai-analysis';
import { StudentTable } from './_components/student-table';

export default function AiPerformanceAnalysisPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [allStudents, setAllStudents] = useState<StudentPerformance[]>([]);
    const [classAnalysis, setClassAnalysis] = useState<ClassAnalysis | null>(null);
    const [selectedStudentName, setSelectedStudentName] = useState<string>('');
    const [studentAnalysis, setStudentAnalysis] = useState<IndividualAnalysis | null>(null);
    const [isAnalyzingStudent, setIsAnalyzingStudent] = useState(false);

    const handleFileSelect = async (file: File) => {
        setIsLoading(true);
        try {
            let students: StudentPerformance[] = [];

            if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                // PDF HANDLING
                toast.info('Extracting data from PDF using AI. This may take a few seconds...');
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve, reject) => {
                    reader.onload = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        resolve(base64);
                    };
                    reader.onerror = reject;
                });
                reader.readAsDataURL(file);
                const base64 = await base64Promise;
                students = await extractStudentDataFromPdf(base64);
            } else {
                // EXCEL/CSV HANDLING
                const data = await file.arrayBuffer();
                const workbook = read(data);

                // Iterate through sheets until we find valid data
                for (const sheetName of workbook.SheetNames) {
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = utils.sheet_to_json(sheet, { header: 1 }) as any[][];
                    const parsed = parseStudentData(jsonData);

                    if (parsed.length > 0) {
                        students = parsed;
                        break; // Found valid data, stop searching
                    }
                }
            }

            if (students.length === 0) {
                toast.error('No valid student data found. Please check the file format.');
                return;
            }

            setAllStudents(students);
            toast.success(`Loaded ${students.length} student(s)`);

            // Reset previous analysis
            setClassAnalysis(null);
            setStudentAnalysis(null);

            // Auto-select if only one student found
            if (students.length === 1) {
                setSelectedStudentName(students[0].name);
            } else {
                setSelectedStudentName('');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(formatAiErrorMessage(error, 'Error processing file'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClassAnalysis = async () => {
        if (!allStudents.length) return;

        setIsLoading(true);
        try {
            const sortedStudents = [...allStudents].sort((a, b) => b.averageScore - a.averageScore);
            const top5 = sortedStudents.slice(0, 5);
            const weak5 = sortedStudents.slice(-5);

            const analysisData = {
                totalStudents: allStudents.length,
                topPerformers: top5,
                weakPerformers: weak5.reverse() // Show weakest first
            };

            const result = await analyzeClassPerformance(analysisData);
            setClassAnalysis(result);
            toast.success('Class analysis complete');
        } catch (error: any) {
            console.error(error);
            toast.error(formatAiErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleStudentAnalysis = async () => {
        const student = allStudents.find((s) => s.name === selectedStudentName);
        if (!student) return;

        setIsAnalyzingStudent(true);
        try {
            const reportData = {
                studentInfo: {
                    name: student.name,
                    averageScore: student.averageScore,
                    totalScore: student.totalScore
                },
                subjects: student.subjects
            };

            const result = await analyzeStudentPerformance(reportData);
            setStudentAnalysis(result);
            toast.success(`Analysis for ${student.name} complete`);
        } catch (error: any) {
            console.error(error);
            toast.error(formatAiErrorMessage(error));
        } finally {
            setIsAnalyzingStudent(false);
        }
    };

    // Helper to find data start row and subject columns (Advanced logic for School Sheets)
    const parseStudentData = (data: any[][]): StudentPerformance[] => {
        if (data.length < 2) return [];

        let headerRowIndex = -1;
        const subjectIndices: number[] = [];
        let nameIndex = -1;

        // 1. DYNAMIC HEADER DETECTION - CELL BY CELL SCAN
        // Scan first 50 rows to find the "Student Name" header cell explicitly
        outerLoop: for (let i = 0; i < Math.min(50, data.length); i++) {
            const row = data[i];
            if (!row) continue;

            for (let j = 0; j < row.length; j++) {
                const cell = String(row[j] || '')
                    .toLowerCase()
                    .trim();

                // Strong signal: Exact match or variations of "Student Name"
                if (cell === 'student name' || cell === 'name of student' || cell === 'candidate name' || cell === 'studentname') {
                    headerRowIndex = i;
                    nameIndex = j;
                    break outerLoop;
                }
            }
        }

        // Fallback: If no explicit "Student Name" cell found, find row with "Name" and "Total" or similar context
        if (headerRowIndex === -1) {
            for (let i = 0; i < Math.min(50, data.length); i++) {
                const rowStr = (data[i] || []).join(' ').toLowerCase();
                if (rowStr.includes('name') && (rowStr.includes('total') || rowStr.includes('class') || rowStr.includes('english'))) {
                    headerRowIndex = i;
                    // Try to find name col in this row
                    const row = data[i];
                    row.forEach((c, idx) => {
                        if (String(c).toLowerCase().includes('name') && nameIndex === -1) nameIndex = idx;
                    });
                    break;
                }
            }
        }

        if (headerRowIndex === -1) return []; // Can't parse

        // 2. IDENTIFY COLUMNS
        const headerRow = data[headerRowIndex];
        const excludeKeywords = [
            'sl',
            'no',
            'id',
            'rank',
            'total',
            'avg',
            'average',
            'grade',
            'result',
            'class',
            'section',
            'division',
            'percentage',
            'attendance',
            'remarks',
            'pass',
            'fail',
            'promoted'
        ];

        // If name index still not found but we have a header row, guess it (col 1 or 2, usually after Sl No)
        if (nameIndex === -1) {
            const firstCell = String(headerRow[0] || '').toLowerCase();
            nameIndex = firstCell.includes('sl') || firstCell.includes('no') ? 1 : 0;
        }

        headerRow.forEach((cell, idx) => {
            if (idx === nameIndex) return; // Skip name col
            if (!cell) return;

            const val = String(cell).toLowerCase().trim();
            const cleanVal = val.replace(/[^a-z]/g, ''); // strict check

            // Check against exclude list
            // We use cleaner matching: if the cell matches exactly a keyword, or "keyword no", or "keyword."
            const isExcluded = excludeKeywords.some(
                (ex) => val === ex || val === `${ex} no` || val === `${ex}.` || val === `${ex} .` || val === `student ${ex}`
            );

            // Also exclude generic mostly-empty headers or known metadata
            if (!isExcluded && cleanVal.length > 2) {
                subjectIndices.push(idx);
            }
        });

        // 3. EXTRACT STUDENT DATA
        const students: StudentPerformance[] = [];

        // Start parsing rows AFTER the header
        for (let i = headerRowIndex + 1; i < data.length; i++) {
            const row = data[i];
            if (!row || !row[nameIndex]) continue;

            // Check if this is a valid student row (and not a summary row at the bottom)
            const name = String(row[nameIndex]).trim();
            if (!name || name.toLowerCase().includes('total') || name.toLowerCase().includes('class average')) continue;

            const subjects: StudentSubject[] = [];

            subjectIndices.forEach((colIdx) => {
                const cellVal = row[colIdx];
                if (cellVal === undefined || cellVal === null || cellVal === '') return;

                let score = 0;
                let isValidScore = false;

                // Value handling: "59 | C", "59", "AB", "Abst", "59.5"
                const cellStr = String(cellVal).trim();

                // Skip absent/empty
                if (['ab', 'absent', '-', 'na', 'nil', 'abst'].includes(cellStr.toLowerCase())) return;

                // Regex to extract the first number found in the cell (integers or decimals)
                // This handles "59", "59.5", "59 | C", "59(A)", "59 [B]"
                // We use a boundary check or start check to avoid picking up random numbers in remarks
                const match = cellStr.match(/^([0-9]+(\.[0-9]+)?)/);

                if (match) {
                    score = Number.parseFloat(match[0]);
                    isValidScore = true;
                }

                if (isValidScore) {
                    // Normalize subject name
                    let subjectName = String(headerRow[colIdx])
                        .replace(/\(.*\)/g, '')
                        .replace(/\[.*\]/g, '')
                        .replace(/\|.*/g, '')
                        .trim();

                    // If subject name became empty (e.g. it was just "(Max 100)"), fallback
                    if (!subjectName || subjectName.length < 2) subjectName = `Subject ${colIdx}`;

                    // Sanity check: score shouldn't be ridiculous (unless it's out of >100, checking 0-200 to be safe for some boards)
                    if (score >= 0 && score <= 200) {
                        subjects.push({
                            subject: subjectName,
                            score: score,
                            maxScore: 100, // Assuming 100 for now, could infer from max valid score later
                            percentage: score > 100 ? score / 2 : score // Rough heuristic if out of 200
                        });
                    }
                }
            });

            if (subjects.length > 0) {
                const total = Number(subjects.reduce((sum, s) => sum + s.score, 0).toFixed(2));
                const avg = Number((total / subjects.length).toFixed(2));

                students.push({
                    name,
                    index: i,
                    subjects,
                    totalScore: total,
                    averageScore: avg,
                    subjectCount: subjects.length
                });
            }
        }

        return students;
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-4 md:p-6'>
                <Separator />

                {/* Introduction Section for Students/Parents */}
                <div className='space-y-1.5 rounded-lg border border-primary/10 bg-primary/5 p-3'>
                    <h2 className='flex items-center gap-2 font-semibold text-base text-primary'>
                        <span className='flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white'>?</span>
                        How to use this tool?
                    </h2>
                    <p className='text-muted-foreground text-xs leading-relaxed'>
                        Get detailed insights into your academic performance. Upload your report card to see strengths, areas for
                        improvement, and automated analysis. We support PDF reports and Excel/CSV files.
                    </p>
                </div>

                {/* Step 1: Upload */}
                <CollapsibleSection
                    title='1. Data Upload'
                    description='Upload your personal report card (PDF/Excel/CSV)'
                    defaultOpen={!allStudents.length}
                    contentClassName='pt-1'>
                    <div className='space-y-3 px-3 pt-0 pb-3'>
                        {/* Sample Format Info */}
                        {!allStudents.length && (
                            <div className='space-y-2 rounded-xl border border-slate-200 bg-slate-50/30 p-3'>
                                <h4 className='flex items-center gap-2 font-medium text-[11px] text-slate-700'>
                                    💡 Sample of correct file format:
                                </h4>
                                <div className='overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm'>
                                    <table className='min-w-full border-collapse text-[10px]'>
                                        <thead>
                                            <tr className='bg-slate-50/80'>
                                                <th className='w-[150px] border-r border-b p-1.5 text-left font-bold text-slate-950'>
                                                    Student Name
                                                </th>
                                                <th className='border-r border-b p-1.5 text-center font-bold text-slate-950'>English</th>
                                                <th className='border-r border-b p-1.5 text-center font-bold text-slate-950'>Hindi</th>
                                                <th className='border-r border-b p-1.5 text-center font-bold text-slate-950'>Maths</th>
                                                <th className='border-b p-1.5 text-center font-bold text-slate-950'>Science</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className='transition-colors hover:bg-slate-50/50'>
                                                <td className='border-r border-b p-1.5 font-medium text-slate-700'>Abhishek Kumar</td>
                                                <td className='border-r border-b p-1.5 text-center text-slate-600'>85</td>
                                                <td className='border-r border-b p-1.5 text-center text-slate-600'>78</td>
                                                <td className='border-r border-b p-1.5 text-center text-slate-600'>92</td>
                                                <td className='border-b p-1.5 text-center text-slate-600'>88</td>
                                            </tr>
                                            <tr>
                                                <td className='border-r p-1.5 font-medium text-slate-700'>Sneha Reddy</td>
                                                <td className='border-r p-1.5 text-center text-slate-600'>72</td>
                                                <td className='border-r p-1.5 text-center text-slate-600'>89</td>
                                                <td className='border-r p-1.5 text-center text-slate-600'>65</td>
                                                <td className='p-1.5 text-center text-slate-600'>80</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className='pl-1 text-[10px] text-muted-foreground italic'>
                                    Note: File must contain a "Student Name" column.
                                </p>
                            </div>
                        )}

                        <FileUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
                    </div>
                </CollapsibleSection>

                {allStudents.length > 0 && (
                    <div className='fade-in slide-in-from-bottom-4 animate-in space-y-6 duration-500'>
                        <div className='flex animate-bounce items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/20'>
                            <span className='font-medium text-green-600 text-sm dark:text-green-400'>
                                ✅ File uploaded successfully! Scroll down to see the data and start analysis.
                            </span>
                        </div>

                        <div className='space-y-4'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <h3 className='font-semibold text-lg'>
                                        {allStudents.length === 1 ? '📄 Report Card Detected' : '📄 Uploaded Report Data'}
                                    </h3>
                                    <p className='text-muted-foreground text-sm'>
                                        {allStudents.length === 1
                                            ? `Found report for ${allStudents[0].name}`
                                            : `${allStudents.length} students found in file`}
                                    </p>
                                </div>
                            </div>

                            {allStudents.length > 1 ? (
                                <div className='overflow-hidden rounded-xl border bg-card shadow-sm'>
                                    <StudentTable students={allStudents} />
                                </div>
                            ) : (
                                <div className='space-y-4'>
                                    <div className='flex items-center gap-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-900'>
                                        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'>
                                            <FileText className='h-8 w-8' />
                                        </div>
                                        <div className='flex-1'>
                                            <h4 className='font-bold text-xl'>{allStudents[0].name}</h4>
                                            <div className='mt-1 flex gap-4 text-muted-foreground text-sm'>
                                                <span>📊 {allStudents[0].subjects.length} Subjects</span>
                                                <span>📈 Average Score: {allStudents[0].averageScore}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subject-Wise Details Table */}
                                    <div className='overflow-hidden rounded-xl border bg-white shadow-sm'>
                                        <div className='flex items-center justify-between border-b bg-slate-50 px-4 py-2'>
                                            <span className='font-bold text-slate-700 text-xs uppercase'>Subject-Wise Extracted Marks</span>
                                            <span className='text-[10px] text-muted-foreground'>
                                                Total Score: {allStudents[0].totalScore}
                                            </span>
                                        </div>
                                        <div className='overflow-x-auto'>
                                            <table className='min-w-full text-sm'>
                                                <thead>
                                                    <tr className='bg-slate-50/50 text-[11px] text-slate-500 uppercase'>
                                                        <th className='border-r px-4 py-2 text-left font-semibold'>Subject</th>
                                                        <th className='px-4 py-2 text-center font-semibold'>Marks Obtainted</th>
                                                        <th className='px-4 py-2 text-center font-semibold'>Percentage</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {allStudents[0].subjects.map((sub, idx) => (
                                                        <tr key={idx} className='border-t transition-colors hover:bg-slate-50/30'>
                                                            <td className='border-r px-4 py-2 font-medium text-slate-700'>{sub.subject}</td>
                                                            <td className='px-4 py-2 text-center font-semibold text-purple-600'>
                                                                {sub.score}
                                                            </td>
                                                            <td className='px-4 py-2 text-center text-slate-500'>{sub.percentage}%</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className='flex justify-end border-t pt-4'>
                                {/* Only show Class Analysis if more than 1 student exists */}
                                {allStudents.length > 1 && (
                                    <Button
                                        onClick={handleClassAnalysis}
                                        disabled={isLoading}
                                        size='lg'
                                        className='w-full shadow-lg sm:w-auto'>
                                        {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                                        Analyze Class Performance
                                    </Button>
                                )}

                                {/* If single student, show 'Analyze My Performance' button */}
                                {allStudents.length === 1 && !studentAnalysis && (
                                    <Button
                                        onClick={handleStudentAnalysis}
                                        disabled={isAnalyzingStudent}
                                        size='lg'
                                        className='w-full bg-purple-600 shadow-lg hover:bg-purple-700 sm:w-auto'>
                                        {isAnalyzingStudent ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                                        Analyze My Performance
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Class Analysis (Optional, hidden for single user) */}
                {classAnalysis && allStudents.length > 1 && (
                    <CollapsibleSection
                        title='2. Class Performance Overview'
                        description='AI-generated insights for the entire class'
                        defaultOpen={true}>
                        <div className='p-4'>
                            <ClassAnalysisView analysis={classAnalysis} />
                        </div>
                    </CollapsibleSection>
                )}

                {/* Step 3: My Analysis (Individual) */}
                {allStudents.length > 0 && (
                    <CollapsibleSection
                        title={allStudents.length === 1 ? '🎓 Detailed Analysis' : '3. Individual Student Analysis'}
                        description={
                            allStudents.length === 1 ? 'Deep dive into performance' : 'Deep dive into specific student performance'
                        }
                        defaultOpen={true}>
                        <div className='space-y-4 p-4'>
                            {/* Only show select if > 1 student */}
                            {allStudents.length > 1 && (
                                <div className='flex items-end gap-4'>
                                    <div className='max-w-md flex-1 space-y-2'>
                                        {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                                        <label className='font-medium text-sm'>Select Student</label>
                                        <Select value={selectedStudentName} onValueChange={setSelectedStudentName}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Choose a student...' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allStudents.map((s, i) => (
                                                    <SelectItem key={i} value={s.name}>
                                                        {s.name} (Avg: {s.averageScore}%)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        onClick={handleStudentAnalysis}
                                        disabled={!selectedStudentName || isAnalyzingStudent}
                                        variant='secondary'>
                                        {isAnalyzingStudent ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                                        Get Individual Analysis
                                    </Button>
                                </div>
                            )}

                            {studentAnalysis && (
                                <div className={cn('mt-6 border-t pt-6', allStudents.length === 1 && 'border-t-0 pt-2')}>
                                    <StudentAnalysisView
                                        student={allStudents.find((s) => s.name === selectedStudentName) || allStudents[0]}
                                        analysis={studentAnalysis}
                                    />
                                </div>
                            )}
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
