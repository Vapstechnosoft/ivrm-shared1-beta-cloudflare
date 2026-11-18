'use client';

import { Button } from '@/components/ui/button';
import { PolygonBanner } from '@/components/ui/extension/polygon-banner';
import { useOnlineExamReportInitialData } from '@/hooks/exam/online-exam/useReports';
import { getOnlineExamReportData } from '@/server/exam/online-exam/reports/online-exam-report';
import type { IOnlineExamReportRow } from '@/types/exam/online-exam/reports';
import { ChevronRight, Download, Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import OnlineExamReportFilterForm from './_components/filter-form';
import ReportPrintView from './_components/report-print-view';
import OnlineExamReportTable from './_components/report-table';

export default function OnlineExamReportPage() {
    const { data: initialResponse } = useOnlineExamReportInitialData();

    const [reportData, setReportData] = useState<IOnlineExamReportRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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
        const raw = initialData?.getsections || initialData?.getsection || initialData?.sectionList || initialData?.section_list || initialData?.sections || initialData?.getSection || initialData?.getSectionList || initialData?.getSectionlist || initialData?.sectionlist;
        if (Array.isArray(raw) && raw.length > 0) return raw;
        if (raw?.$values && Array.isArray(raw.$values) && raw.$values.length > 0) return raw.$values;
        return [];
    }, [initialData]);

    const subjects = useMemo(() => {
        const raw = initialData?.getsubjects || initialData?.getSubject || initialData?.subjectList || initialData?.subject_list || initialData?.subjects;
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const exams = useMemo(() => {
        const raw = initialData?.getexams || initialData?.getexam || initialData?.getexamlist || initialData?.getExamList || initialData?.examlist || initialData?.masterExamList || initialData?.exams || initialData?.getExams;
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const handleFilterSubmit = async (values: any) => {
        setIsLoading(true);
        try {
            const response = await getOnlineExamReportData({
                ASMAY_Id: values.asmaY_Id,
                asmaY_Id: values.asmaY_Id,
                ASMCL_Id: values.asmcL_Id,
                asmcL_Id: values.asmcL_Id,
                ASMS_Id: values.asmS_Id || undefined,
                asmS_Id: values.asmS_Id || undefined,
                ISMS_Id: values.ismS_Id || undefined,
                ismS_Id: values.ismS_Id || undefined,
                LPMOEEX_Id: values.lpmoeeX_Id,
                lpmoeeX_Id: values.lpmoeeX_Id,
                fromDate: values.fromDate,
                toDate: values.toDate
            });

            let rawList: any[] = [];
            // Backend returns { status, success, data: [...] } where data is the student list
            if (Array.isArray(response)) {
                rawList = response;
            } else if (Array.isArray(response?.data)) {
                rawList = response.data;
            } else if (response?.data?.$values && Array.isArray(response.data.$values)) {
                rawList = response.data.$values;
            } else if (Array.isArray(response?.getexamreport)) {
                rawList = response.getexamreport;
            } else if (Array.isArray(response?.getexamreport?.$values)) {
                rawList = response.getexamreport.$values;
            } else if (Array.isArray(response?.$values)) {
                rawList = response.$values;
            }

            const normalized: IOnlineExamReportRow[] = rawList.map((item: any, idx: number) => {
                const sName = item.studentName || item.studentname || (item.AMST_FirstName ? `${item.AMST_FirstName || ''} ${item.AMST_MiddleName || ''} ${item.AMST_LastName || ''}`.trim() : 'N/A');
                const admNo = item.admNo || item.AMST_AdmNo || item.admno || '-';
                const rollNo = item.rollNo || item.AMST_RollNo || item.rollno || '-';
                const className = item.className || item.ASMCL_ClassName || item.classname || '-';
                const sectionName = item.sectionName || item.ASMC_SectionName || item.sectionname || '-';
                const examName = item.examName || item.LPMOEEX_ExamName || item.examname || '-';
                const subjectName = item.subjectName || item.ISMS_SubjectName || item.subjectname || '-';
                const totalQuestions = Number(item.totalQuestions ?? item.TotalQuestions ?? item.TotalQns ?? item.totalQns ?? 0);
                const attemptedQuestions = Number(item.attemptedQuestions ?? item.AttemptedQuestions ?? item.AttemptedQns ?? item.attemptedQns ?? 0);
                const correctAnswers = Number(item.correctAnswers ?? item.CorrectAnswers ?? item.CorrectAns ?? item.correctAns ?? 0);
                const wrongAnswers = Number(item.wrongAnswers ?? item.WrongAnswers ?? item.WrongAns ?? item.wrongAns ?? 0);
                const maxMarks = Number(item.maxMarks ?? item.TotalMaxMarks ?? item.MaxMarks ?? item.maxmarks ?? 0);
                const marksObtained = Number(item.marksObtained ?? item.TotalMarksObtained ?? item.MarksObtained ?? item.ObtainedMarks ?? 0);
                const percentage = Number(item.percentage ?? item.Percentage ?? (maxMarks > 0 ? Math.round((marksObtained / maxMarks) * 100) : 0));
                const resultStatus = item.resultStatus || item.Result || item.ResultStatus || (percentage >= 40 ? 'Pass' : 'Fail');
                const rank = item.rank || item.Rank || undefined;

                return {
                    slNo: idx + 1,
                    studentName: sName,
                    admNo,
                    rollNo,
                    className,
                    sectionName,
                    examName,
                    subjectName,
                    totalQuestions,
                    attemptedQuestions,
                    correctAnswers,
                    wrongAnswers,
                    maxMarks,
                    marksObtained,
                    percentage,
                    resultStatus,
                    rank
                };
            });

            let finalRows = normalized;
            setReportData(finalRows);
            if (finalRows.length > 0) {
                toast.success(`Report generated (${finalRows.length} student records)`);
            } else {
                toast.info('No student exam records found in database for selected filter');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch report data');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = async () => {
        if (reportData.length === 0) {
            toast.error('No report data to export');
            return;
        }

        try {
            const xlsx = await import('xlsx');
            const exportRows = reportData.map((row, idx) => ({
                'Sl.No': idx + 1,
                'Student Name': row.studentName,
                'Admission No': row.admNo,
                'Roll No': row.rollNo,
                Class: row.className,
                Section: row.sectionName,
                'Exam Name': row.examName,
                Subject: row.subjectName,
                'Total Questions': row.totalQuestions,
                Attempted: row.attemptedQuestions,
                'Correct Answers': row.correctAnswers,
                'Wrong Answers': row.wrongAnswers,
                'Max Marks': row.maxMarks,
                'Marks Obtained': row.marksObtained,
                'Percentage (%)': row.percentage,
                Result: row.resultStatus,
                Rank: row.rank || '-'
            }));

            const worksheet = xlsx.utils.json_to_sheet(exportRows);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Online Exam Report');
            xlsx.writeFile(workbook, `Online_Exam_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
            toast.success('Excel report downloaded successfully!');
        } catch (_error: any) {
            toast.error('Failed to export Excel report');
        }
    };

    const handleReset = () => {
        setReportData([]);
    };

    return (
        <div className='min-h-screen'>
            {/* Polygon Banner Header */}
            <PolygonBanner
                title='ONLINE EXAM REPORT'
                description='Comprehensive student assessment results, accuracy breakdown, and academic ranking'
                breadcrumb={
                    <div className='flex flex-wrap items-center gap-2 text-sm text-white/80'>
                        <span className='font-medium'>Exam</span>
                        <ChevronRight className='h-4 w-4' />
                        <span>Online Exam</span>
                        <ChevronRight className='h-4 w-4' />
                        <span className='font-medium'>Reports</span>
                        <ChevronRight className='h-4 w-4' />
                        <span className='font-bold text-white'>Online Exam Report</span>
                    </div>
                }
            />

            <div className='container space-y-6 p-4'>
                {/* Filter Form */}
                <OnlineExamReportFilterForm
                    years={years}
                    classes={classes}
                    sections={sections}
                    subjects={subjects}
                    exams={exams}
                    onFilterSubmit={handleFilterSubmit}
                    onReset={handleReset}
                    isLoading={isLoading}
                    onExportExcel={handleExportExcel}
                    onPrint={handlePrint}
                    hasData={reportData.length > 0}
                />

                {/* Report Table */}
                <OnlineExamReportTable reportData={reportData} isLoading={isLoading} />

                {/* Print View Hidden in DOM, visible during print */}
                <ReportPrintView reportData={reportData} />
            </div>
        </div>
    );
}
