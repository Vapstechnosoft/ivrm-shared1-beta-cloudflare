'use client';

import { Button } from '@/components/ui/button';
import { Award, ChevronRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ProgressCardFilter } from './_components/progress-card-filter';
import { ProgressCardView } from './_components/progress-card-view';
import {
    getInitialDetails,
    getProgressCardReport,
    onChangeBranch,
    onChangeCourse,
    onChangeSchemeType,
    onChangeSemester,
    onChangeSubjectScheme,
    onChangeYear
} from './actions';
import type {
    IAcademicYear,
    IAttendanceMonthlyItem,
    ICollegeBranch,
    ICollegeCourse,
    ICollegeExam,
    ICollegeSection,
    ICollegeSemester,
    ISchemeType,
    IStudentCheckboxItem,
    IStudentProgressCard,
    ISubjectScheme
} from './types';

export default function CollegeExamWiseProgressCardReportPage() {
    // Dropdown Data States
    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [courses, setCourses] = useState<ICollegeCourse[]>([]);
    const [branches, setBranches] = useState<ICollegeBranch[]>([]);
    const [semesters, setSemesters] = useState<ICollegeSemester[]>([]);
    const [sections, setSections] = useState<ICollegeSection[]>([]);
    const [subjectSchemes, setSubjectSchemes] = useState<ISubjectScheme[]>([]);
    const [schemeTypes, setSchemeTypes] = useState<ISchemeType[]>([]);
    const [exams, setExams] = useState<ICollegeExam[]>([]);
    const [students, setStudents] = useState<IStudentCheckboxItem[]>([]);

    // Filter Selection States
    const [selectedYear, setSelectedYear] = useState<number | undefined>();
    const [selectedCourse, setSelectedCourse] = useState<number | undefined>();
    const [selectedBranch, setSelectedBranch] = useState<number | undefined>();
    const [selectedSemester, setSelectedSemester] = useState<number | undefined>();
    const [selectedSection, setSelectedSection] = useState<number | undefined>();
    const [selectedSubjectScheme, setSelectedSubjectScheme] = useState<number | undefined>();
    const [selectedSchemeType, setSelectedSchemeType] = useState<number | undefined>();
    const [selectedExam, setSelectedExam] = useState<number | undefined>();
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

    // Report Result States
    const [studentCards, setStudentCards] = useState<IStudentProgressCard[]>([]);
    const [workAttendance, setWorkAttendance] = useState<IAttendanceMonthlyItem[]>([]);
    const [presentAttendance, setPresentAttendance] = useState<IAttendanceMonthlyItem[]>([]);
    const [hasSearched, setHasSearched] = useState<boolean>(false);

    // Loading States
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    /**
     * Bind Initial Data (Academic Years)
     */
    const bindInitialData = useCallback(async () => {
        setIsLoadingInitial(true);
        try {
            const res = await getInitialDetails();
            if (res.success && res.data) {
                setAcademicYears(res.data.yearlist || []);
            } else {
                toast.error(res.message || 'Failed to load initial academic years');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error loading initial details');
        } finally {
            setIsLoadingInitial(false);
        }
    }, []);

    useEffect(() => {
        bindInitialData();
    }, [bindInitialData]);

    /**
     * Cascading Dropdown Handlers
     */
    const handleSelectYear = async (yearId: number) => {
        setSelectedYear(yearId);
        setSelectedCourse(undefined);
        setSelectedBranch(undefined);
        setSelectedSemester(undefined);
        setSelectedSection(undefined);
        setSelectedSubjectScheme(undefined);
        setSelectedSchemeType(undefined);
        setSelectedExam(undefined);
        setSelectedStudentIds([]);
        setStudentCards([]);
        setWorkAttendance([]);
        setPresentAttendance([]);
        setHasSearched(false);

        setCourses([]);
        setBranches([]);
        setSemesters([]);
        setSections([]);
        setSubjectSchemes([]);
        setSchemeTypes([]);
        setExams([]);
        setStudents([]);

        setIsLoadingDropdowns(true);
        try {
            const res = await onChangeYear(yearId);
            if (res.success && res.data) {
                setCourses(res.data.courseslist || []);
            } else {
                toast.error(res.message || 'Failed to load courses');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error changing academic year');
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    const handleSelectCourse = async (courseId: number) => {
        if (!selectedYear) return;
        setSelectedCourse(courseId);
        setSelectedBranch(undefined);
        setSelectedSemester(undefined);
        setSelectedSection(undefined);
        setSelectedSubjectScheme(undefined);
        setSelectedSchemeType(undefined);
        setSelectedExam(undefined);
        setSelectedStudentIds([]);
        setStudentCards([]);
        setWorkAttendance([]);
        setPresentAttendance([]);
        setHasSearched(false);

        setBranches([]);
        setSemesters([]);
        setSections([]);
        setSubjectSchemes([]);
        setSchemeTypes([]);
        setExams([]);
        setStudents([]);

        setIsLoadingDropdowns(true);
        try {
            const res = await onChangeCourse({
                ASMAY_Id: selectedYear,
                AMCO_Id: courseId
            });
            if (res.success && res.data) {
                setBranches(res.data.branchlist || []);
            } else {
                toast.error(res.message || 'Failed to load branches');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error changing course');
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    const handleSelectBranch = async (branchId: number) => {
        if (!selectedYear || !selectedCourse) return;
        setSelectedBranch(branchId);
        setSelectedSemester(undefined);
        setSelectedSection(undefined);
        setSelectedSubjectScheme(undefined);
        setSelectedSchemeType(undefined);
        setSelectedExam(undefined);
        setSelectedStudentIds([]);
        setStudentCards([]);
        setWorkAttendance([]);
        setPresentAttendance([]);
        setHasSearched(false);

        setSemesters([]);
        setSections([]);
        setSubjectSchemes([]);
        setSchemeTypes([]);
        setExams([]);
        setStudents([]);

        setIsLoadingDropdowns(true);
        try {
            const res = await onChangeBranch({
                ASMAY_Id: selectedYear,
                AMCO_Id: selectedCourse,
                AMB_Id: branchId
            });
            if (res.success && res.data) {
                setSemesters(res.data.semisters || []);
            } else {
                toast.error(res.message || 'Failed to load semesters');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error changing branch');
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    const handleSelectSemester = async (semId: number) => {
        if (!selectedYear || !selectedCourse || !selectedBranch) return;
        setSelectedSemester(semId);
        setSelectedSection(undefined);
        setSelectedSubjectScheme(undefined);
        setSelectedSchemeType(undefined);
        setSelectedExam(undefined);
        setSelectedStudentIds([]);
        setStudentCards([]);
        setWorkAttendance([]);
        setPresentAttendance([]);
        setHasSearched(false);

        setSections([]);
        setSubjectSchemes([]);
        setSchemeTypes([]);
        setExams([]);
        setStudents([]);

        setIsLoadingDropdowns(true);
        try {
            const res = await onChangeSemester({
                ASMAY_Id: selectedYear,
                AMCO_Id: selectedCourse,
                AMB_Id: selectedBranch,
                AMSE_Id: semId
            });
            if (res.success && res.data) {
                setSections(res.data.sections || []);
                setSubjectSchemes(res.data.subjectshemalist || []);
            } else {
                toast.error(res.message || 'Failed to load sections & schemes');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error changing semester');
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    const handleSelectSection = (secId: number) => {
        setSelectedSection(secId);
    };

    const handleSelectSubjectScheme = async (schemeId: number) => {
        if (!selectedYear || !selectedCourse || !selectedBranch || !selectedSemester) return;
        setSelectedSubjectScheme(schemeId);
        setSelectedSchemeType(undefined);
        setSelectedExam(undefined);
        setSelectedStudentIds([]);
        setStudentCards([]);
        setWorkAttendance([]);
        setPresentAttendance([]);
        setHasSearched(false);

        setSchemeTypes([]);
        setExams([]);
        setStudents([]);

        setIsLoadingDropdowns(true);
        try {
            const res = await onChangeSubjectScheme({
                ASMAY_Id: selectedYear,
                AMCO_Id: selectedCourse,
                AMB_Id: selectedBranch,
                AMSE_Id: selectedSemester,
                ACSS_Id: schemeId
            });
            if (res.success && res.data) {
                setSchemeTypes(res.data.schmetypelist || []);
            } else {
                toast.error(res.message || 'Failed to load scheme types');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error changing subject scheme');
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    const handleSelectSchemeType = async (schemeTypeId: number) => {
        if (!selectedYear || !selectedCourse || !selectedBranch || !selectedSemester || !selectedSubjectScheme) return;

        setSelectedSchemeType(schemeTypeId);
        setSelectedExam(undefined);
        setSelectedStudentIds([]);
        setStudentCards([]);
        setWorkAttendance([]);
        setPresentAttendance([]);
        setHasSearched(false);

        setExams([]);
        setStudents([]);

        setIsLoadingDropdowns(true);
        try {
            const res = await onChangeSchemeType({
                ASMAY_Id: selectedYear,
                AMCO_Id: selectedCourse,
                AMB_Id: selectedBranch,
                AMSE_Id: selectedSemester,
                ACSS_Id: selectedSubjectScheme,
                ACST_Id: schemeTypeId,
                ACMS_Id: selectedSection || 0
            });
            if (res.success && res.data) {
                const examList = res.data.exmstdlist || [];
                const studentList = res.data.studentlist || [];
                setExams(examList);
                setStudents(studentList);
                // Preselect all students by default matching Angular behavior
                setSelectedStudentIds(studentList.map((s) => s.amscT_Id));
            } else {
                toast.error(res.message || 'Failed to load exams and students');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error changing scheme type');
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    const handleSelectExam = (examId: number) => {
        setSelectedExam(examId);
    };

    const handleToggleStudent = (studentId: number, checked: boolean) => {
        if (checked) {
            setSelectedStudentIds((prev) => [...prev, studentId]);
        } else {
            setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
        }
    };

    const handleToggleAllStudents = (select: boolean) => {
        if (select) {
            setSelectedStudentIds(students.map((s) => s.amscT_Id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    /**
     * Generate Progress Card Report
     */
    const handleGenerateReport = async () => {
        if (
            !selectedYear ||
            !selectedCourse ||
            !selectedBranch ||
            !selectedSemester ||
            !selectedSection ||
            !selectedSubjectScheme ||
            !selectedSchemeType ||
            !selectedExam
        ) {
            toast.error('Please fill in all required dropdown fields.');
            return;
        }

        if (selectedStudentIds.length === 0) {
            toast.error('Please select at least one student.');
            return;
        }

        const payload = {
            EME_ID: selectedExam,
            AMCO_Id: selectedCourse,
            AMB_Id: selectedBranch,
            ACSS_Id: selectedSubjectScheme,
            ACST_Id: selectedSchemeType,
            ACMS_Id: selectedSection,
            AMSE_Id: selectedSemester,
            ASMAY_Id: selectedYear,
            Studentlist_temp: selectedStudentIds.map((id) => ({ AMCST_Id: id }))
        };

        setIsGeneratingReport(true);
        setStudentCards([]);
        setWorkAttendance([]);
        setPresentAttendance([]);
        setHasSearched(true);

        try {
            const res = await getProgressCardReport(payload);
            if (res.success && res.data) {
                const rawList = res.data.getProgressCardReportList || [];
                const workAtt = res.data.work_attendence || [];
                const presAtt = res.data.present_attendence || [];

                if (rawList.length > 0) {
                    setWorkAttendance(workAtt);
                    setPresentAttendance(presAtt);

                    // Group flat rawList records into distinct student cards
                    const cardMap = new Map<number, IStudentProgressCard>();

                    rawList.forEach((item) => {
                        const sId = item.AMCST_Id;
                        if (!cardMap.has(sId)) {
                            cardMap.set(sId, {
                                AMCST_Id: item.AMCST_Id,
                                StudentName: item.StudentName,
                                AMCST_RegistrationNo: item.AMCST_RegistrationNo,
                                AMCST_AdmNo: item.AMCST_AdmNo,
                                EME_ExamName: item.EME_ExamName,
                                AMCO_CourseName: item.AMCO_CourseName,
                                AMB_BranchName: item.AMB_BranchName,
                                AMSE_SEMName: item.AMSE_SEMName,
                                ACMS_SectionName: item.ACMS_SectionName,
                                ECSTMP_TotalObtMarks: item.ECSTMP_TotalObtMarks,
                                ECSTMP_Percentage: item.ECSTMP_Percentage,
                                ECSTMP_TotalGrade: item.ECSTMP_TotalGrade,
                                ECSTMP_SectionRank: item.ECSTMP_SectionRank,
                                ECSTMP_SemRank: item.ECSTMP_SemRank,
                                ECSTMP_TotalMaxMarks: item.ECSTMP_TotalMaxMarks,
                                ECSTMP_Result: item.ECSTMP_Result,
                                subject: []
                            });
                        }

                        // Add subject record if present
                        if (item.ISMS_Id) {
                            const currentCard = cardMap.get(sId)!;
                            currentCard.subject.push({
                                AMCST_Id: item.AMCST_Id,
                                ISMS_Id: item.ISMS_Id,
                                ISMS_SubjectName: item.ISMS_SubjectName,
                                ISMS_SubjectCode: item.ISMS_SubjectCode,
                                ECYSES_AplResultFlg: item.ECYSES_AplResultFlg,
                                ECSTMPS_MaxMarks: item.ECSTMPS_MaxMarks,
                                ECSTMPS_ObtainedMarks: item.ECSTMPS_ObtainedMarks,
                                ECSTMPS_ObtainedGrade: item.ECSTMPS_ObtainedGrade,
                                ECSTMPS_SemAverage: item.ECSTMPS_SemAverage,
                                ECSTMPS_SectionAverage: item.ECSTMPS_SectionAverage,
                                ECSTMPS_SemHighest: item.ECSTMPS_SemHighest,
                                ECSTMPS_SectionHighest: item.ECSTMPS_SectionHighest,
                                ECSTMPS_PassFailFlg: item.ECSTMPS_PassFailFlg
                            });
                        }
                    });

                    const cards = Array.from(cardMap.values());
                    setStudentCards(cards);
                    toast.success(`Generated progress cards for ${cards.length} student(s).`);
                } else {
                    setStudentCards([]);
                    toast.warning('No Records Found');
                }
            } else {
                toast.error(res.message || 'Failed to generate progress card report');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error generating progress card report');
        } finally {
            setIsGeneratingReport(false);
        }
    };

    /**
     * Reset Page
     */
    const handleReset = () => {
        setSelectedYear(undefined);
        setSelectedCourse(undefined);
        setSelectedBranch(undefined);
        setSelectedSemester(undefined);
        setSelectedSection(undefined);
        setSelectedSubjectScheme(undefined);
        setSelectedSchemeType(undefined);
        setSelectedExam(undefined);
        setSelectedStudentIds([]);

        setCourses([]);
        setBranches([]);
        setSemesters([]);
        setSections([]);
        setSubjectSchemes([]);
        setSchemeTypes([]);
        setExams([]);
        setStudents([]);

        setStudentCards([]);
        setWorkAttendance([]);
        setPresentAttendance([]);
        setHasSearched(false);

        bindInitialData();
        toast.info('Form filters reset.');
    };

    const selectedExamName = useMemo(() => {
        return exams.find((e) => e.emE_Id === selectedExam)?.emE_ExamName || 'Exam';
    }, [exams, selectedExam]);

    return (
        <div className='fade-in container mx-auto max-w-7xl animate-in space-y-6 p-4 duration-300 sm:p-6 lg:p-8'>
            {/* Breadcrumb Navigation */}
            <div className='flex flex-col gap-2'>
                <nav aria-label='Breadcrumb' className='flex items-center space-x-1.5 text-muted-foreground text-xs'>
                    <Link href='/Exam' className='transition-colors hover:text-foreground'>
                        Exam
                    </Link>
                    <ChevronRight className='h-3.5 w-3.5 opacity-60' />
                    <Link href='/Exam/exam-module' className='transition-colors hover:text-foreground'>
                        Exam Module
                    </Link>
                    <ChevronRight className='h-3.5 w-3.5 opacity-60' />
                    <Link href='/Exam/exam-module/collage' className='transition-colors hover:text-foreground'>
                        College
                    </Link>
                    <ChevronRight className='h-3.5 w-3.5 opacity-60' />
                    <span className='font-medium text-foreground'>Progress Card Report</span>
                </nav>

                {/* Page Title Header */}
                <div className='flex flex-col justify-between gap-4 border-b pb-3 sm:flex-row sm:items-center'>
                    <div className='flex items-center space-x-3'>
                        <div className='rounded-xl bg-primary p-2.5 text-primary-foreground shadow-sm'>
                            <Award className='h-6 w-6' />
                        </div>
                        <div>
                            <h1 className='font-bold text-foreground text-xl tracking-tight sm:text-2xl'>College Progress Card Report</h1>
                            <p className='text-muted-foreground text-xs sm:text-sm'>
                                Generate student examination transcripts, mark sheets, and monthly attendance reports
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center gap-2'>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={handleReset}
                            disabled={isLoadingInitial || isLoadingDropdowns || isGeneratingReport}
                            className='h-9 text-xs'>
                            <RefreshCw className='mr-1.5 h-3.5 w-3.5' />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filter Form Card */}
            <ProgressCardFilter
                academicYears={academicYears}
                courses={courses}
                branches={branches}
                semesters={semesters}
                sections={sections}
                subjectSchemes={subjectSchemes}
                schemeTypes={schemeTypes}
                exams={exams}
                students={students}
                selectedYear={selectedYear}
                selectedCourse={selectedCourse}
                selectedBranch={selectedBranch}
                selectedSemester={selectedSemester}
                selectedSection={selectedSection}
                selectedSubjectScheme={selectedSubjectScheme}
                selectedSchemeType={selectedSchemeType}
                selectedExam={selectedExam}
                selectedStudentIds={selectedStudentIds}
                onSelectYear={handleSelectYear}
                onSelectCourse={handleSelectCourse}
                onSelectBranch={handleSelectBranch}
                onSelectSemester={handleSelectSemester}
                onSelectSection={handleSelectSection}
                onSelectSubjectScheme={handleSelectSubjectScheme}
                onSelectSchemeType={handleSelectSchemeType}
                onSelectExam={handleSelectExam}
                onToggleStudent={handleToggleStudent}
                onToggleAllStudents={handleToggleAllStudents}
                onSubmit={handleGenerateReport}
                onReset={handleReset}
                isLoadingDropdowns={isLoadingDropdowns}
                isGeneratingReport={isGeneratingReport}
                hasReportData={studentCards.length > 0}
            />

            {/* Progress Card View */}
            {hasSearched && studentCards.length > 0 && (
                <ProgressCardView
                    studentCards={studentCards}
                    workAttendance={workAttendance}
                    presentAttendance={presentAttendance}
                    examName={selectedExamName}
                />
            )}
        </div>
    );
}
