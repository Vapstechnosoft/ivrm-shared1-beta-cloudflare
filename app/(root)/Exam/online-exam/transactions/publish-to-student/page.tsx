'use client';

import { PolygonBanner } from '@/components/ui/extension/polygon-banner';
import { usePublishInitialData } from '@/hooks/exam/online-exam/useTransactions';
import { getPublishStudentList, savePublishToStudent } from '@/server/exam/online-exam/transactions/publish-to-student';
import type { IPublishToStudentList } from '@/types/exam/online-exam/transactions';
import { ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import PublishFilterForm from './_components/filter-form';
import PublishTable from './_components/publish-table';

export default function PublishToStudentPage() {
    const { data: initialResponse, isLoading: isInitialLoading } = usePublishInitialData();

    const [students, setStudents] = useState<IPublishToStudentList[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
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
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const subjects = useMemo(() => {
        const raw = initialData?.getsubjects || initialData?.getSubject || initialData?.subjectList || initialData?.subject_list || initialData?.subjects;
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const exams = useMemo(() => {
        const raw = initialData?.getexams || initialData?.getexam || initialData?.getexamlist || initialData?.getExamList || initialData?.examlist || initialData?.masterExamList || initialData?.exams || initialData?.getExams || initialData?.getmasterexam || initialData?.getmasterexamlist || initialData?.masterexamlist;
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const handleFilterSubmit = async (values: any) => {
        setIsSearching(true);
        setActiveExamId(values.lpmoeeX_Id);
        setSelectedStudentIds([]);
        try {
            const response: any = await getPublishStudentList({
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
            else if (response?.studentlist && Array.isArray(response.studentlist)) list = response.studentlist;
            else if (response?.studentlist?.$values) list = response.studentlist.$values;
            else if (Array.isArray(response)) list = response;

            if (list.length === 0) {
                toast.info('No student evaluation records found for the selected parameters.');
            }

            const normalizedList: IPublishToStudentList[] = list.map((s: any, idx: number) => {
                const amsT_Id = Number(s.amsT_Id || s.AMST_Id || s.id || idx + 101);

                let studentName = s.studentName || s.student_name || s.amsT_StudentName || s.AMST_StudentName || '';
                if (!studentName) {
                    const first = s.amsT_FirstName || s.AMST_FirstName || s.firstName || '';
                    const middle = s.amsT_MiddleName || s.AMST_MiddleName || s.middleName || '';
                    const last = s.amsT_LastName || s.AMST_LastName || s.lastName || '';
                    studentName = [first, middle, last].filter(Boolean).join(' ');
                }
                if (!studentName) studentName = `Student ${amsT_Id}`;

                const admNo = s.admNo || s.amsT_AdmNo || s.AMST_AdmNo || s.admno || s.amsT_AdmissionNo || 'N/A';
                const rollNo = s.rollNo || s.amsT_RollNo || s.AMST_RollNo || s.rollno || 'N/A';
                const className = s.className || s.asmcL_ClassName || s.ASMCL_ClassName || '';
                const sectionName = s.sectionName || s.asmC_SectionName || s.ASMC_SectionName || '';
                const examName = s.examName || s.lpmoeeX_ExamName || s.LPMOEEX_ExamName || '';
                const subjectName = s.subjectName || s.ismS_SubjectName || s.ISMS_SubjectName || '';

                const marksObtained = Number(s.marksObtained ?? s.score ?? s.lpstueX_TotalMarks ?? s.LPSTUEX_TotalMarks ?? s.marks ?? 0);
                const totalMarks = Number(s.totalMarks ?? s.maxMarks ?? s.lpstueX_TotalMaxMarks ?? s.LPSTUEX_TotalMaxMarks ?? s.total ?? 100);
                const percentage = Number(s.percentage ?? s.lpstueX_Percentage ?? s.LPSTUEX_Percentage ?? (totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0));

                const isPass = s.resultStatus === 'Pass' || s.result === 'Pass' || s.resultStatus === 'PASS' || s.result === 'PASS' || (s.resultStatus !== 'Fail' && s.result !== 'Fail' && percentage >= 35);
                const resultStatus: 'Pass' | 'Fail' = isPass ? 'Pass' : 'Fail';

                const isPublished = Boolean(s.isPublished ?? s.published ?? s.publishStatus ?? s.lpmoeE_PublishFlag ?? false);

                return {
                    amsT_Id,
                    studentName,
                    admNo,
                    rollNo,
                    className,
                    sectionName,
                    examName,
                    subjectName,
                    totalMarks,
                    marksObtained,
                    percentage,
                    resultStatus,
                    isPublished
                };
            });

            setStudents(normalizedList);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to fetch student results');
            setStudents([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleToggleSelectStudent = (id: number) => {
        setSelectedStudentIds((prev) => (prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]));
    };

    const handleSelectAll = () => {
        if (selectedStudentIds.length === students.length) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(students.map((s) => s.amsT_Id));
        }
    };

    const handleBulkPublish = async (publishStatus: boolean) => {
        if (selectedStudentIds.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                LPMOEEX_Id: activeExamId || 501,
                studentIds: selectedStudentIds,
                publishStatus
            };

            const response = await savePublishToStudent(payload);
            if (response?.success || response?.returnval === true || !response?.error) {
                toast.success(`Results successfully ${publishStatus ? 'published to' : 'unpublished from'} student portal!`);
                setStudents((prev) => prev.map((s) => (selectedStudentIds.includes(s.amsT_Id) ? { ...s, isPublished: publishStatus } : s)));
                setSelectedStudentIds([]);
            } else {
                toast.error(response?.message || 'Failed to update publish status');
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setStudents([]);
        setSelectedStudentIds([]);
        setActiveExamId(0);
    };

    return (
        <div className='min-h-screen'>
            {/* Polygon Banner matching Master Question Bank hero banner */}
            <PolygonBanner
                title="Online Exam Publish To Student Portal"
                description="Verify student evaluation results and publish exam reports directly to the student portal"
                breadcrumb={
                    <div className='flex flex-wrap items-center gap-2 text-sm text-white/80'>
                        <span className='font-medium'>Exam</span>
                        <ChevronRight className='h-4 w-4' />
                        <span>Online Exam</span>
                        <ChevronRight className='h-4 w-4' />
                        <span className='font-medium'>Transaction</span>
                        <ChevronRight className='h-4 w-4' />
                        <span className='font-bold text-white'>Online Exam Publish To Student</span>
                    </div>
                }
            />

            <div className='container space-y-6 p-4'>
                {/* Filter Form */}
                <PublishFilterForm
                    years={years}
                    classes={classes}
                    sections={sections}
                    subjects={subjects}
                    exams={exams}
                    onFilterSubmit={handleFilterSubmit}
                    onReset={handleReset}
                    isLoading={isSearching || isInitialLoading}
                />

                {/* Candidates Publish Table */}
                <PublishTable
                    students={students}
                    selectedStudentIds={selectedStudentIds}
                    onToggleSelectStudent={handleToggleSelectStudent}
                    onSelectAll={handleSelectAll}
                    onBulkPublish={handleBulkPublish}
                    isLoading={isSearching}
                    isSaving={isSaving}
                />
            </div>
        </div>
    );
}
