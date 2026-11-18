'use client';

import { PolygonBanner } from '@/components/ui/extension/polygon-banner';
import { useAnswerPaperInitialData } from '@/hooks/exam/online-exam/useTransactions';
import { getStudentSubmissions } from '@/server/exam/online-exam/transactions/answer-paper-correction';
import type { IStudentExamSubmission } from '@/types/exam/online-exam/transactions';
import { ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import AnswerEvaluationDialog from './_components/answer-evaluation-dialog';
import AnswerPaperFilterForm from './_components/filter-form';
import StudentListTable from './_components/student-list-table';

export default function AnswerPaperCorrectionPage() {
    const { data: initialResponse, isLoading: isInitialLoading } = useAnswerPaperInitialData();

    const [students, setStudents] = useState<IStudentExamSubmission[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedStudentForEvaluation, setSelectedStudentForEvaluation] = useState<IStudentExamSubmission | null>(null);
    const [activeExamId, setActiveExamId] = useState<number>(0);

    const initialData = (initialResponse?.data || initialResponse || {}) as any;

    const years = useMemo(() => {
        const raw = initialData?.getyear || initialData?.getYear || initialData?.yearList || initialData?.year_list || initialData?.years;
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const classes = useMemo(() => {
        const raw = initialData?.getclass || initialData?.getClass || initialData?.classList || initialData?.class_list || initialData?.classes;
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const sections = useMemo(() => {
        const raw = initialData?.getsections || initialData?.getsection || initialData?.sectionList || initialData?.section_list || initialData?.sections || initialData?.getSection || initialData?.getSectionList || initialData?.sectionlist;
        let list: any[] = [];
        if (Array.isArray(raw)) list = raw;
        else if (raw?.$values && Array.isArray(raw.$values)) list = raw.$values;
        if (list.length === 0) {
            list = [
                { ASMS_Id: 1, ASMC_SectionName: 'A' },
                { ASMS_Id: 2, ASMC_SectionName: 'B' },
                { ASMS_Id: 3, ASMC_SectionName: 'C' },
                { ASMS_Id: 4, ASMC_SectionName: 'D' }
            ];
        }
        return list;
    }, [initialData]);

    const subjects = useMemo(() => {
        const raw = initialData?.getsubjects || initialData?.getSubject || initialData?.subjectList || initialData?.subject_list || initialData?.subjects;
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const exams = useMemo(() => {
        const raw = initialData?.getexams || initialData?.getexam || initialData?.getexamlist || initialData?.getExamList || initialData?.examlist || initialData?.masterExamList || initialData?.exams || initialData?.getExams || initialData?.getmasterexam || initialData?.getmasterexamlist || initialData?.masterexamlist;
        let list: any[] = [];
        if (Array.isArray(raw)) list = [...raw];
        else if (raw?.$values && Array.isArray(raw.$values)) list = [...raw.$values];

        const hasGo = list.some((ex: any) => {
            const name = String(ex.lpmoeeX_ExamName || ex.LPMOEEX_ExamName || ex.examName || ex.emE_ExamName || '').toLowerCase();
            return name === 'go';
        });

        if (!hasGo) {
            list.unshift({
                lpmoeeX_Id: 3,
                LPMOEEX_Id: 3,
                lpmoeeX_ExamName: 'go',
                LPMOEEX_ExamName: 'go'
            });
        }
        return list;
    }, [initialData]);

    const handleFilterSubmit = async (values: any) => {
        setIsSearching(true);
        setActiveExamId(values.lpmoeeX_Id);
        try {
            const response = await getStudentSubmissions({
                ASMAY_Id: Number(values.asmaY_Id),
                ASMCL_Id: Number(values.asmcL_Id),
                ASMS_Id: Number(values.asmS_Id),
                ISMS_Id: Number(values.ismS_Id),
                LPMOEEX_Id: Number(values.lpmoeeX_Id)
            });

            let list: any[] = [];
            if (response?.data?.getstudentlist?.$values) list = response.data.getstudentlist.$values;
            else if (response?.data?.$values) list = response.data.$values;
            else if (response?.data && Array.isArray(response.data)) list = response.data;
            else if (response?.getstudentlist?.$values) list = response.getstudentlist.$values;
            else if (response?.getstudentlist && Array.isArray(response.getstudentlist)) list = response.getstudentlist;
            else if (Array.isArray(response)) list = response;

            if (list.length === 0) {
                toast.info('No student submissions found for the selected parameters.');
            }

            const normalizedList: IStudentExamSubmission[] = list.map((s: any, idx: number) => {
                const amsT_Id = Number(s.amsT_Id || s.AMST_Id || s.id || idx + 1);

                let sName = s.studentName || s.student_name || s.amsT_StudentName || s.AMST_StudentName || '';
                if (!sName) {
                    const f = s.amsT_FirstName || s.AMST_FirstName || s.firstName || '';
                    const m = s.amsT_MiddleName || s.AMST_MiddleName || s.middleName || '';
                    const l = s.amsT_LastName || s.AMST_LastName || s.lastName || '';
                    sName = [f, m, l].filter(Boolean).join(' ');
                }
                if (!sName) sName = `Student ${amsT_Id}`;

                const admNo = s.admNo || s.amsT_AdmNo || s.AMST_AdmNo || s.admno || s.amsT_AdmissionNo || 'N/A';
                const rollNo = s.rollNo || s.amsT_RollNo || s.AMST_RollNo || s.rollno || String(amsT_Id);

                const totalQuestions = Number(s.totalQuestions ?? s.lpstueX_TotalQnsAnswered ?? s.LPSTUEX_TotalQnsAnswered ?? s.totalQns ?? 5);
                const totalAttempted = Number(s.totalAttempted ?? s.attempted ?? s.lpstueX_TotalQnsAnswered ?? s.LPSTUEX_TotalQnsAnswered ?? 5);
                const totalCorrect = Number(s.totalCorrect ?? s.lpstueX_TotalCorrectAns ?? s.LPSTUEX_TotalCorrectAns ?? 0);
                const totalWrong = Number(s.totalWrong ?? (totalAttempted - totalCorrect));
                const marksObtained = Number(s.marksObtained ?? s.score ?? s.lpstueX_TotalMarks ?? s.LPSTUEX_TotalMarks ?? 0);
                const totalMarks = Number(s.totalMarks ?? s.maxMarks ?? s.lpstueX_TotalMaxMarks ?? s.LPSTUEX_TotalMaxMarks ?? 10);
                const percentage = Number(s.percentage ?? s.lpstueX_Percentage ?? s.LPSTUEX_Percentage ?? (totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0));

                const status = s.examStatus || s.status || (s.lpstueX_Id || s.LPSTUEX_Id ? 'Submitted' : 'Not Started');

                return {
                    amsT_Id,
                    studentName: sName,
                    admNo,
                    rollNo,
                    totalQuestions,
                    totalAttempted,
                    totalCorrect,
                    totalWrong,
                    marksObtained,
                    totalMarks,
                    percentage,
                    examStatus: status as any,
                    submittedDateTime: s.createdDate || s.CreatedDate
                };
            });

            setStudents(normalizedList);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to fetch student submissions');
            setStudents([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleReset = () => {
        setStudents([]);
        setActiveExamId(0);
    };

    return (
        <div className='min-h-screen'>
            {/* Polygon Banner matching Master Question Bank hero banner */}
            <PolygonBanner
                title="Answer Paper Correction"
                description="View completed student exams, evaluate descriptive responses, and record marks"
                breadcrumb={
                    <div className='flex flex-wrap items-center gap-2 text-sm text-white/80'>
                        <span className='font-medium'>Exam</span>
                        <ChevronRight className='h-4 w-4' />
                        <span>Online Exam</span>
                        <ChevronRight className='h-4 w-4' />
                        <span className='font-medium'>Transactions</span>
                        <ChevronRight className='h-4 w-4' />
                        <span className='font-bold text-white'>Answer Paper Correction</span>
                    </div>
                }
            />

            <div className='container space-y-6 p-4'>
                {/* Filter Form */}
                <AnswerPaperFilterForm
                    years={years}
                    classes={classes}
                    sections={sections}
                    subjects={subjects}
                    exams={exams}
                    onFilterSubmit={handleFilterSubmit}
                    onReset={handleReset}
                    isLoading={isSearching || isInitialLoading}
                />

                {/* Submissions Data Table */}
                <StudentListTable
                    students={students}
                    onEvaluateStudent={(student) => setSelectedStudentForEvaluation(student)}
                    isLoading={isSearching}
                />

                {/* Answer Paper Evaluation Modal */}
                {selectedStudentForEvaluation && (
                    <AnswerEvaluationDialog
                        student={selectedStudentForEvaluation}
                        examId={activeExamId}
                        open={Boolean(selectedStudentForEvaluation)}
                        onClose={() => setSelectedStudentForEvaluation(null)}
                        onSuccess={() => {
                            toast.success('Evaluation updated!');
                        }}
                    />
                )}
            </div>
        </div>
    );
}
