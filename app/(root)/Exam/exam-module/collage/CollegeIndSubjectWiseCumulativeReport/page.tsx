'use client';

import { Button } from '@/components/ui/button';
import { Award, ChevronRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { IndReportFilter } from './_components/ind-report-filter';
import { IndReportTable } from './_components/ind-report-table';
import {
    getIndReport,
    getInitialDetails,
    onChangeBranch,
    onChangeCourse,
    onChangeSchemeType,
    onChangeSemester,
    onChangeSubjectScheme,
    onChangeYear
} from './actions';
import type {
    IAcademicYear,
    ICollegeBranch,
    ICollegeCourse,
    ICollegeExam,
    ICollegeSection,
    ICollegeSemester,
    ICollegeSubject,
    IIndStudentRecord,
    IReportConfig,
    IReportHeaderInst,
    ISchemeType,
    ISubjectScheme
} from './types';

export default function CollegeIndSubjectWiseCumulativeReportPage() {
    // Dropdown Data States
    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [courses, setCourses] = useState<ICollegeCourse[]>([]);
    const [branches, setBranches] = useState<ICollegeBranch[]>([]);
    const [semesters, setSemesters] = useState<ICollegeSemester[]>([]);
    const [sections, setSections] = useState<ICollegeSection[]>([]);
    const [subjectSchemes, setSubjectSchemes] = useState<ISubjectScheme[]>([]);
    const [schemeTypes, setSchemeTypes] = useState<ISchemeType[]>([]);
    const [exams, setExams] = useState<ICollegeExam[]>([]);
    const [subjects, setSubjects] = useState<ICollegeSubject[]>([]);

    // Filter Selection States
    const [selectedYear, setSelectedYear] = useState<number | undefined>();
    const [selectedCourse, setSelectedCourse] = useState<number | undefined>();
    const [selectedBranch, setSelectedBranch] = useState<number | undefined>();
    const [selectedSemester, setSelectedSemester] = useState<number | undefined>();
    const [selectedSection, setSelectedSection] = useState<number | undefined>();
    const [selectedSubjectScheme, setSelectedSubjectScheme] = useState<number | undefined>();
    const [selectedSchemeType, setSelectedSchemeType] = useState<number | undefined>();
    const [selectedExam, setSelectedExam] = useState<number | undefined>();
    const [selectedSubject, setSelectedSubject] = useState<number | undefined>();

    // Report Result States
    const [reportData, setReportData] = useState<IIndStudentRecord[]>([]);
    const [headerInst, setHeaderInst] = useState<IReportHeaderInst | undefined>();
    const [reportConfig, setReportConfig] = useState<IReportConfig | undefined>();
    const [maxMarks, setMaxMarks] = useState<number | string>('');
    const [hasSearched, setHasSearched] = useState(false);

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
                setAcademicYears(res.data.getyear || []);
            } else {
                toast.error(res.message || 'Failed to load academic years');
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
        setSelectedSubject(undefined);
        setReportData([]);
        setHasSearched(false);

        setCourses([]);
        setBranches([]);
        setSemesters([]);
        setSections([]);
        setSubjectSchemes([]);
        setSchemeTypes([]);
        setExams([]);
        setSubjects([]);

        setIsLoadingDropdowns(true);
        try {
            const res = await onChangeYear(yearId);
            if (res.success && res.data) {
                setCourses(res.data.getcourse || []);
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
        setSelectedSubject(undefined);
        setReportData([]);
        setHasSearched(false);

        setBranches([]);
        setSemesters([]);
        setSections([]);
        setSubjectSchemes([]);
        setSchemeTypes([]);
        setExams([]);
        setSubjects([]);

        setIsLoadingDropdowns(true);
        try {
            const res = await onChangeCourse({
                ASMAY_Id: selectedYear,
                AMCO_Id: courseId
            });
            if (res.success && res.data) {
                const fetchedBranches = res.data.getbranch || [];
                if (fetchedBranches.length > 0) {
                    setBranches(fetchedBranches);
                } else {
                    toast.info('No branches found for course');
                }
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
        setSelectedSubject(undefined);
        setReportData([]);
        setHasSearched(false);

        setSemesters([]);
        setSections([]);
        setSubjectSchemes([]);
        setSchemeTypes([]);
        setExams([]);
        setSubjects([]);

        setIsLoadingDropdowns(true);
        try {
            const res = await onChangeBranch({
                ASMAY_Id: selectedYear,
                AMCO_Id: selectedCourse,
                AMB_Id: branchId
            });
            if (res.success && res.data) {
                setSemesters(res.data.getsemester || []);
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
        setSelectedSubject(undefined);
        setReportData([]);
        setHasSearched(false);

        setSections([]);
        setSubjectSchemes([]);
        setSchemeTypes([]);
        setExams([]);
        setSubjects([]);

        setIsLoadingDropdowns(true);
        try {
            const res = await onChangeSemester({
                ASMAY_Id: selectedYear,
                AMCO_Id: selectedCourse,
                AMB_Id: selectedBranch,
                AMSE_Id: semId
            });
            if (res.success && res.data) {
                setSections(res.data.getsection || []);
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
        setSelectedSubject(undefined);
        setReportData([]);
        setHasSearched(false);

        setSchemeTypes([]);
        setExams([]);
        setSubjects([]);

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
        setSelectedSubject(undefined);
        setReportData([]);
        setHasSearched(false);

        setExams([]);
        setSubjects([]);

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
                setExams(res.data.getexam || []);
                setSubjects(res.data.getsubject || []);
            } else {
                toast.error(res.message || 'Failed to load exams & subjects');
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

    const handleSelectSubject = (subjectId: number) => {
        setSelectedSubject(subjectId);
    };

    /**
     * Generate Individual Subject Cumulative Report
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
            !selectedSubject ||
            !selectedExam
        ) {
            toast.error('Please select all required dropdown fields.');
            return;
        }

        const payload = {
            ASMAY_Id: selectedYear,
            AMCO_Id: selectedCourse,
            AMB_Id: selectedBranch,
            AMSE_Id: selectedSemester,
            ACMS_Id: selectedSection,
            ACSS_Id: selectedSubjectScheme,
            ACST_Id: selectedSchemeType,
            ISMS_Id: selectedSubject,
            EME_Id: selectedExam
        };

        setIsGeneratingReport(true);
        setReportData([]);
        setHasSearched(true);

        try {
            const res = await getIndReport(payload);
            if (res.success && res.data) {
                const records = res.data.reportinddata || [];
                if (records.length > 0) {
                    setReportData(records);
                    if (res.data.instname && res.data.instname.length > 0) {
                        setHeaderInst(res.data.instname[0]);
                    }
                    if (res.data.configuration && res.data.configuration.length > 0) {
                        setReportConfig(res.data.configuration[0]);
                    }
                    if (records[0].ecyseS_MaxMarks) {
                        setMaxMarks(records[0].ecyseS_MaxMarks);
                    } else {
                        setMaxMarks('');
                    }
                    toast.success(`Loaded report with ${records.length} records.`);
                } else {
                    setReportData([]);
                    toast.warning('No Records Found for the selected criteria.');
                }
            } else {
                toast.error(res.message || 'Failed to generate report.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error generating report');
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
        setSelectedSubject(undefined);

        setCourses([]);
        setBranches([]);
        setSemesters([]);
        setSections([]);
        setSubjectSchemes([]);
        setSchemeTypes([]);
        setExams([]);
        setSubjects([]);

        setReportData([]);
        setHeaderInst(undefined);
        setReportConfig(undefined);
        setMaxMarks('');
        setHasSearched(false);

        bindInitialData();
        toast.info('Form filters reset.');
    };

    // Label Helpers
    const selectedYearName = useMemo(() => {
        return academicYears.find((y) => y.asmaY_Id === selectedYear)?.asmaY_Year || '';
    }, [academicYears, selectedYear]);

    const selectedCourseName = useMemo(() => {
        return courses.find((c) => c.amcO_Id === selectedCourse)?.amcO_CourseName || '';
    }, [courses, selectedCourse]);

    const selectedBranchName = useMemo(() => {
        return branches.find((b) => b.amB_Id === selectedBranch)?.amB_BranchName || '';
    }, [branches, selectedBranch]);

    const selectedSemesterName = useMemo(() => {
        return semesters.find((s) => s.amsE_Id === selectedSemester)?.amsE_SEMName || '';
    }, [semesters, selectedSemester]);

    const selectedSectionName = useMemo(() => {
        return sections.find((s) => s.acmS_Id === selectedSection)?.acmS_SectionName || '';
    }, [sections, selectedSection]);

    const selectedExamName = useMemo(() => {
        return exams.find((e) => e.emE_Id === selectedExam)?.emE_ExamName || '';
    }, [exams, selectedExam]);

    const selectedSubjectName = useMemo(() => {
        const sub = subjects.find((s) => s.ismS_Id === selectedSubject);
        if (!sub) return '';
        return sub.ismS_SubjectCode ? `${sub.ismS_SubjectName} : ${sub.ismS_SubjectCode}` : sub.ismS_SubjectName;
    }, [subjects, selectedSubject]);

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
                    <span className='font-medium text-foreground'>Subject-Wise Cumulative Report</span>
                </nav>

                {/* Page Title Header */}
                <div className='flex flex-col justify-between gap-4 border-b pb-3 sm:flex-row sm:items-center'>
                    <div className='flex items-center space-x-3'>
                        <div className='rounded-xl bg-primary p-2.5 text-primary-foreground shadow-sm'>
                            <Award className='h-6 w-6' />
                        </div>
                        <div>
                            <h1 className='font-bold text-foreground text-xl tracking-tight sm:text-2xl'>
                                College Subject-Wise Cumulative Report
                            </h1>
                            <p className='text-muted-foreground text-xs sm:text-sm'>
                                Generate subject and exam-specific marks and attendance cumulative performance report
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
            <IndReportFilter
                academicYears={academicYears}
                courses={courses}
                branches={branches}
                semesters={semesters}
                sections={sections}
                subjectSchemes={subjectSchemes}
                schemeTypes={schemeTypes}
                exams={exams}
                subjects={subjects}
                selectedYear={selectedYear}
                selectedCourse={selectedCourse}
                selectedBranch={selectedBranch}
                selectedSemester={selectedSemester}
                selectedSection={selectedSection}
                selectedSubjectScheme={selectedSubjectScheme}
                selectedSchemeType={selectedSchemeType}
                selectedExam={selectedExam}
                selectedSubject={selectedSubject}
                onSelectYear={handleSelectYear}
                onSelectCourse={handleSelectCourse}
                onSelectBranch={handleSelectBranch}
                onSelectSemester={handleSelectSemester}
                onSelectSection={handleSelectSection}
                onSelectSubjectScheme={handleSelectSubjectScheme}
                onSelectSchemeType={handleSelectSchemeType}
                onSelectExam={handleSelectExam}
                onSelectSubject={handleSelectSubject}
                onSubmit={handleGenerateReport}
                onReset={handleReset}
                isLoadingDropdowns={isLoadingDropdowns}
                isGeneratingReport={isGeneratingReport}
                hasReportData={reportData.length > 0}
            />

            {/* Report Data Grid View */}
            {hasSearched && reportData.length > 0 && (
                <IndReportTable
                    reportData={reportData}
                    headerInst={headerInst}
                    config={reportConfig}
                    yearName={selectedYearName}
                    courseName={selectedCourseName}
                    branchName={selectedBranchName}
                    semesterName={selectedSemesterName}
                    sectionName={selectedSectionName}
                    examName={selectedExamName}
                    subjectName={selectedSubjectName}
                    maxMarks={maxMarks}
                />
            )}
        </div>
    );
}
