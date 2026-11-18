'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronRight, GraduationCap, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MarksFilterForm } from './_components/marks-filter-form';
import { StudentMarksTable } from './_components/student-marks-table';
import {
    getClgMarksEntryExams,
    getClgMarksEntryInitialData,
    getClgMarksEntrySubjectScheme,
    getClgMarksEntrySubjectSchemeType,
    getClgMarksEntrySubjects,
    onClgMarksEntryChangeBranch,
    onClgMarksEntryChangeCourse,
    onClgMarksEntryChangeYear,
    saveClgMarksEntry,
    searchClgMarksEntryStudents
} from './actions';
import type {
    IAcademicYear,
    ICollegeBranch,
    ICollegeCourse,
    ICollegeExam,
    ICollegeSection,
    ICollegeSemester,
    ICollegeSubject,
    IExamConfiguration,
    ISchemeType,
    IStudentMarksRecord,
    ISubjectScheme
} from './types';

export default function ClgMarksEntryPage() {
    // Dropdown States
    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [courses, setCourses] = useState<ICollegeCourse[]>([]);
    const [branches, setBranches] = useState<ICollegeBranch[]>([]);
    const [semesters, setSemesters] = useState<ICollegeSemester[]>([]);
    const [sections, setSections] = useState<ICollegeSection[]>([]);
    const [exams, setExams] = useState<ICollegeExam[]>([]);
    const [subjects, setSubjects] = useState<ICollegeSubject[]>([]);
    const [subjectSchemes, setSubjectSchemes] = useState<ISubjectScheme[]>([]);
    const [schemeTypes, setSchemeTypes] = useState<ISchemeType[]>([]);

    // Selected Values
    const [selectedYear, setSelectedYear] = useState<number | undefined>();
    const [selectedCourse, setSelectedCourse] = useState<number | undefined>();
    const [selectedBranchIds, setSelectedBranchIds] = useState<(number | string)[]>([]);
    const [selectedSemester, setSelectedSemester] = useState<number | undefined>();
    const [selectedSectionIds, setSelectedSectionIds] = useState<(number | string)[]>([]);
    const [selectedExam, setSelectedExam] = useState<number | undefined>();
    const [selectedSubject, setSelectedSubject] = useState<number | undefined>();
    const [selectedScheme, setSelectedScheme] = useState<number | undefined>();
    const [selectedSchemeType, setSelectedSchemeType] = useState<number | undefined>();
    const [markCalculation, setMarkCalculation] = useState<boolean>(false);

    // Grid / Student Data States
    const [studentList, setStudentList] = useState<IStudentMarksRecord[]>([]);
    const [subMorGFlag, setSubMorGFlag] = useState<'M' | 'G' | string>('M');
    const [gradName, setGradName] = useState<string[]>([]);
    const [examConfig, setExamConfig] = useState<IExamConfiguration[]>([]);
    const [marksDeleteFlag, setMarksDeleteFlag] = useState<string | boolean>('false');

    // Loading & UI States
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [showRecalculateWarningModal, setShowRecalculateWarningModal] = useState(false);

    /**
     * 1. Bind Initial Data (Academic Years)
     */
    const bindInitialData = useCallback(async () => {
        try {
            setIsLoadingInitial(true);
            const res = await getClgMarksEntryInitialData();
            if (res.success && res.data) {
                const years = res.data.getyear || res.data.yearlist || [];
                setAcademicYears(years);
            } else {
                toast.error(res.message || 'Failed to load academic years');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error fetching initial data');
        } finally {
            setIsLoadingInitial(false);
        }
    }, []);

    useEffect(() => {
        bindInitialData();
    }, [bindInitialData]);

    /**
     * Reset Downstream from Year
     */
    const handleSelectYear = async (yearId: number) => {
        setSelectedYear(yearId);
        // Clear all dependent state
        setCourses([]);
        setSelectedCourse(undefined);
        setBranches([]);
        setSelectedBranchIds([]);
        setSemesters([]);
        setSelectedSemester(undefined);
        setSections([]);
        setSelectedSectionIds([]);
        setExams([]);
        setSelectedExam(undefined);
        setSubjects([]);
        setSelectedSubject(undefined);
        setSubjectSchemes([]);
        setSelectedScheme(undefined);
        setSchemeTypes([]);
        setSelectedSchemeType(undefined);
        setStudentList([]);
        setHasSearched(false);

        try {
            setIsLoadingDropdowns(true);
            const res = await onClgMarksEntryChangeYear(yearId);
            if (res.success && res.data?.courseslist) {
                setCourses(res.data.courseslist);
            } else {
                toast.error(res.message || 'Failed to load courses for selected year');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error loading courses');
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    /**
     * Reset Downstream from Course
     */
    const handleSelectCourse = async (courseId: number) => {
        if (!selectedYear) return;
        setSelectedCourse(courseId);

        // Clear downstream
        setBranches([]);
        setSelectedBranchIds([]);
        setSemesters([]);
        setSelectedSemester(undefined);
        setSections([]);
        setSelectedSectionIds([]);
        setExams([]);
        setSelectedExam(undefined);
        setSubjects([]);
        setSelectedSubject(undefined);
        setSubjectSchemes([]);
        setSelectedScheme(undefined);
        setSchemeTypes([]);
        setSelectedSchemeType(undefined);
        setStudentList([]);
        setHasSearched(false);

        try {
            setIsLoadingDropdowns(true);
            const res = await onClgMarksEntryChangeCourse(selectedYear, courseId);
            if (res.success && res.data?.branchlist) {
                setBranches(res.data.branchlist);
            } else {
                toast.error(res.message || 'Failed to load branches for selected course');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error loading branches');
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    /**
     * Reset Downstream from Branch
     */
    const handleSelectBranches = async (branchIds: (number | string)[]) => {
        setSelectedBranchIds(branchIds);

        // Clear downstream
        setSemesters([]);
        setSelectedSemester(undefined);
        setSections([]);
        setSelectedSectionIds([]);
        setExams([]);
        setSelectedExam(undefined);
        setSubjects([]);
        setSelectedSubject(undefined);
        setSubjectSchemes([]);
        setSelectedScheme(undefined);
        setSchemeTypes([]);
        setSelectedSchemeType(undefined);
        setStudentList([]);
        setHasSearched(false);

        if (!selectedYear || !selectedCourse || branchIds.length === 0) return;

        try {
            setIsLoadingDropdowns(true);
            const payload = {
                ASMAY_Id: selectedYear,
                AMCO_Id: selectedCourse,
                marksbranch: branchIds.map((id) => ({ AMB_Id: Number(id) }))
            };
            const res = await onClgMarksEntryChangeBranch(payload);
            if (res.success && res.data) {
                const sems = res.data.semisters || res.data.semisters_list || [];
                setSemesters(sems);
            } else {
                toast.error(res.message || 'Failed to load semesters');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error loading semesters');
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    /**
     * Reset Downstream from Semester -> fetch Exams & Sections
     */
    const handleSelectSemester = async (semId: number) => {
        if (!selectedYear || !selectedCourse || selectedBranchIds.length === 0) return;
        setSelectedSemester(semId);

        // Clear downstream
        setSections([]);
        setSelectedSectionIds([]);
        setExams([]);
        setSelectedExam(undefined);
        setSubjects([]);
        setSelectedSubject(undefined);
        setSubjectSchemes([]);
        setSelectedScheme(undefined);
        setSchemeTypes([]);
        setSelectedSchemeType(undefined);
        setStudentList([]);
        setHasSearched(false);

        try {
            setIsLoadingDropdowns(true);
            const payload = {
                ASMAY_Id: selectedYear,
                AMCO_Id: selectedCourse,
                AMSE_Id: semId,
                marksbranch: selectedBranchIds.map((id) => ({ AMB_Id: Number(id) }))
            };
            const res = await getClgMarksEntryExams(payload);
            if (res.success && res.data) {
                setExams(res.data.examlist || []);
                setSections(res.data.sectionlist || []);
            } else {
                toast.error(res.message || 'Failed to load exams and sections');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error loading exams and sections');
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    /**
     * Select Sections
     */
    const handleSelectSections = (secIds: (number | string)[]) => {
        setSelectedSectionIds(secIds);
        setStudentList([]);
        setHasSearched(false);

        // If exam is already chosen, reload subjects for the new section set
        if (selectedExam) {
            loadSubjectsForExam(selectedExam, secIds);
        }
    };

    /**
     * Select Exam -> fetch Subjects
     */
    const handleSelectExam = (examId: number) => {
        setSelectedExam(examId);
        loadSubjectsForExam(examId, selectedSectionIds);
    };

    const loadSubjectsForExam = async (_examId: number, secIds: (number | string)[]) => {
        if (!selectedYear || !selectedCourse || !selectedSemester) return;

        // Clear downstream
        setSubjects([]);
        setSelectedSubject(undefined);
        setSubjectSchemes([]);
        setSelectedScheme(undefined);
        setSchemeTypes([]);
        setSelectedSchemeType(undefined);
        setStudentList([]);
        setHasSearched(false);

        try {
            setIsLoadingDropdowns(true);
            const payload = {
                ASMAY_Id: selectedYear,
                AMCO_Id: selectedCourse,
                AMSE_Id: selectedSemester,
                marksbranch: selectedBranchIds.map((id) => ({ AMB_Id: Number(id) })),
                markssection: secIds.map((id) => ({ ACMS_Id: Number(id) }))
            };
            const res = await getClgMarksEntrySubjects(payload);
            if (res.success && res.data) {
                setSubjects(res.data.subjectgroups || res.data.subject_list || []);
            } else {
                toast.error(res.message || 'Failed to load subjects');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error loading subjects');
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    /**
     * Select Subject -> fetch Subject Scheme
     */
    const handleSelectSubject = async (subjectId: number) => {
        if (!selectedYear || !selectedCourse || !selectedSemester || !selectedExam) return;
        setSelectedSubject(subjectId);

        // Clear downstream
        setSubjectSchemes([]);
        setSelectedScheme(undefined);
        setSchemeTypes([]);
        setSelectedSchemeType(undefined);
        setStudentList([]);
        setHasSearched(false);

        try {
            setIsLoadingDropdowns(true);
            const payload = {
                ASMAY_Id: selectedYear,
                AMCO_Id: selectedCourse,
                AMSE_Id: selectedSemester,
                marksbranch: selectedBranchIds.map((id) => ({ AMB_Id: Number(id) })),
                markssection: selectedSectionIds.map((id) => ({ ACMS_Id: Number(id) })),
                ISMS_Id: subjectId,
                EME_Id: selectedExam
            };
            const res = await getClgMarksEntrySubjectScheme(payload);
            if (res.success && res.data) {
                setSubjectSchemes(res.data.getsubjectschemetype || res.data.subjectsheme || []);
            } else {
                toast.error(res.message || 'Failed to load subject scheme');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error loading subject scheme');
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    /**
     * Select Scheme -> fetch Scheme Type
     */
    const handleSelectScheme = async (schemeId: number) => {
        if (!selectedYear || !selectedCourse || !selectedSemester || !selectedExam || !selectedSubject) return;
        setSelectedScheme(schemeId);

        // Clear downstream
        setSchemeTypes([]);
        setSelectedSchemeType(undefined);
        setStudentList([]);
        setHasSearched(false);

        try {
            setIsLoadingDropdowns(true);
            const payload = {
                ASMAY_Id: selectedYear,
                AMCO_Id: selectedCourse,
                AMSE_Id: selectedSemester,
                marksbranch: selectedBranchIds.map((id) => ({ AMB_Id: Number(id) })),
                markssection: selectedSectionIds.map((id) => ({ ACMS_Id: Number(id) })),
                ISMS_Id: selectedSubject,
                ACSS_Id: schemeId,
                EME_Id: selectedExam
            };
            const res = await getClgMarksEntrySubjectSchemeType(payload);
            if (res.success && res.data) {
                setSchemeTypes(res.data.getschemetype || res.data.subjectshemetype || []);
            } else {
                toast.error(res.message || 'Failed to load scheme types');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error loading scheme type');
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    /**
     * Search Students for Marks Entry
     */
    const handleSearch = async () => {
        if (
            !selectedYear ||
            !selectedCourse ||
            selectedBranchIds.length === 0 ||
            !selectedSemester ||
            selectedSectionIds.length === 0 ||
            !selectedExam ||
            !selectedSubject ||
            !selectedScheme ||
            !selectedSchemeType
        ) {
            toast.error('Please select all required search fields.');
            return;
        }

        try {
            setIsSearching(true);
            const payload = {
                ASMAY_Id: selectedYear,
                AMCO_Id: selectedCourse,
                AMSE_Id: selectedSemester,
                marksbranch: selectedBranchIds.map((id) => ({ AMB_Id: Number(id) })),
                markssection: selectedSectionIds.map((id) => ({ ACMS_Id: Number(id) })),
                EME_Id: selectedExam,
                ISMS_Id: selectedSubject,
                ACSS_Id: selectedScheme,
                ACST_Id: selectedSchemeType
            };

            const res = await searchClgMarksEntryStudents(payload);

            if (res.success && res.data) {
                const students = res.data.studentList || [];
                setSubMorGFlag(res.data.subMorGFlag || 'M');
                setGradName(res.data.gradname || []);
                setExamConfig(res.data.configuration || []);
                setMarksDeleteFlag(res.data.marksdeleteflag || 'false');
                setStudentList(students);
                setHasSearched(true);

                if (students.length === 0) {
                    toast.info('No student records found for the selected criteria.');
                } else {
                    toast.success(`Found ${students.length} student(s).`);
                }
            } else {
                toast.error(res.message || 'Failed to load students for marks entry');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error executing search');
        } finally {
            setIsSearching(false);
        }
    };

    /**
     * Save Marks - initiates validation & check if recalculate warning needed
     */
    const handleInitiateSave = () => {
        if (studentList.length === 0) {
            toast.warning('No student records to save.');
            return;
        }

        // If marks were already calculated previously, warn user before saving
        if (String(marksDeleteFlag).toLowerCase() === 'true') {
            setShowRecalculateWarningModal(true);
        } else {
            executeSave();
        }
    };

    /**
     * Execute Save to API
     */
    const executeSave = async () => {
        if (
            !selectedYear ||
            !selectedCourse ||
            !selectedSemester ||
            !selectedExam ||
            !selectedSubject ||
            !selectedScheme ||
            !selectedSchemeType
        ) {
            toast.error('Invalid search context for saving.');
            return;
        }

        try {
            setIsSaving(true);
            const payload = {
                ASMAY_Id: selectedYear,
                AMCO_Id: selectedCourse,
                AMSE_Id: selectedSemester,
                marksbranch: selectedBranchIds.map((id) => ({ AMB_Id: Number(id) })),
                markssection: selectedSectionIds.map((id) => ({ ACMS_Id: Number(id) })),
                EME_Id: selectedExam,
                ISMS_Id: selectedSubject,
                ACSS_Id: selectedScheme,
                ACST_Id: selectedSchemeType,
                marksdeleteflag: marksDeleteFlag,
                detailsList: studentList,
                message: markCalculation ? 'Autocalculate' : ''
            };

            const res = await saveClgMarksEntry(payload);
            if (res.success && (res.data?.messagesaveupdate === 'true' || res.data?.returnval === true)) {
                toast.success('Marks saved and updated successfully!');
                // Re-fetch search results or reset
                handleSearch();
            } else {
                toast.error(res.message || 'Failed to save/update student marks.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error saving marks');
        } finally {
            setIsSaving(false);
            setShowRecalculateWarningModal(false);
        }
    };

    /**
     * Reset / Cancel
     */
    const handleReset = () => {
        setSelectedYear(undefined);
        setSelectedCourse(undefined);
        setCourses([]);
        setSelectedBranchIds([]);
        setBranches([]);
        setSelectedSemester(undefined);
        setSemesters([]);
        setSelectedSectionIds([]);
        setSections([]);
        setSelectedExam(undefined);
        setExams([]);
        setSelectedSubject(undefined);
        setSubjects([]);
        setSelectedScheme(undefined);
        setSubjectSchemes([]);
        setSelectedSchemeType(undefined);
        setSchemeTypes([]);
        setMarkCalculation(false);
        setStudentList([]);
        setHasSearched(false);
        bindInitialData();
        toast.info('Form filters reset.');
    };

    return (
        <div className='fade-in container mx-auto max-w-7xl animate-in space-y-6 p-4 duration-300 sm:p-6 lg:p-8'>
            {/* Breadcrumb Navigation */}
            <div className='flex flex-col gap-2'>
                <nav aria-label='Breadcrumb' className='flex items-center space-x-1.5 text-xs text-muted-foreground'>
                    <Link href='/Exam' className='hover:text-foreground transition-colors'>
                        Exam
                    </Link>
                    <ChevronRight className='h-3.5 w-3.5 opacity-60' />
                    <Link href='/Exam/exam-module' className='hover:text-foreground transition-colors'>
                        Exam Module
                    </Link>
                    <ChevronRight className='h-3.5 w-3.5 opacity-60' />
                    <Link href='/Exam/exam-module/collage' className='hover:text-foreground transition-colors'>
                        College
                    </Link>
                    <ChevronRight className='h-3.5 w-3.5 opacity-60' />
                    <span className='font-medium text-foreground'>Marks Entry</span>
                </nav>

                {/* Page Title Header */}
                <div className='flex flex-col justify-between gap-4 border-b pb-2 sm:flex-row sm:items-center'>
                    <div className='flex items-center space-x-3'>
                        <div className='rounded-xl bg-primary p-2.5 text-primary-foreground shadow-sm'>
                            <GraduationCap className='h-6 w-6' />
                        </div>
                        <div>
                            <h1 className='font-bold text-foreground text-xl tracking-tight sm:text-2xl'>College Marks Entry</h1>
                            <p className='text-muted-foreground text-xs sm:text-sm'>
                                Record and calculate college subject marks, grades, and student assessment performance
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center gap-2'>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={handleReset}
                            disabled={isLoadingInitial || isSearching || isSaving}
                            className='h-9 text-xs'>
                            <RefreshCw className='mr-1.5 h-3.5 w-3.5' />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filter Criteria Section */}
            <MarksFilterForm
                academicYears={academicYears}
                courses={courses}
                branches={branches}
                semesters={semesters}
                sections={sections}
                exams={exams}
                subjects={subjects}
                subjectSchemes={subjectSchemes}
                schemeTypes={schemeTypes}
                selectedYear={selectedYear}
                selectedCourse={selectedCourse}
                selectedBranchIds={selectedBranchIds}
                selectedSemester={selectedSemester}
                selectedSectionIds={selectedSectionIds}
                selectedExam={selectedExam}
                selectedSubject={selectedSubject}
                selectedScheme={selectedScheme}
                selectedSchemeType={selectedSchemeType}
                markCalculation={markCalculation}
                onSelectYear={handleSelectYear}
                onSelectCourse={handleSelectCourse}
                onSelectBranches={handleSelectBranches}
                onSelectSemester={handleSelectSemester}
                onSelectSections={handleSelectSections}
                onSelectExam={handleSelectExam}
                onSelectSubject={handleSelectSubject}
                onSelectScheme={handleSelectScheme}
                onSelectSchemeType={setSelectedSchemeType}
                onToggleMarkCalculation={setMarkCalculation}
                onSearch={handleSearch}
                onReset={handleReset}
                isLoadingDropdowns={isLoadingDropdowns}
                isSearching={isSearching}
                hasSearched={hasSearched}
            />

            {/* Student Marks Details Table */}
            {hasSearched && studentList.length > 0 && (
                <div className='fade-in-50 animate-in duration-300'>
                    <StudentMarksTable
                        students={studentList}
                        subMorGFlag={subMorGFlag}
                        gradname={gradName}
                        configuration={examConfig}
                        isSaving={isSaving}
                        onUpdateMarks={setStudentList}
                        onSave={handleInitiateSave}
                        onCancel={() => {
                            setStudentList([]);
                            setHasSearched(false);
                        }}
                    />
                </div>
            )}

            {/* Recalculate Warning Alert Dialog */}
            <AlertDialog open={showRecalculateWarningModal} onOpenChange={setShowRecalculateWarningModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='flex items-center gap-2 text-amber-600'>
                            <AlertCircle className='h-5 w-5' />
                            <span>Recalculation Required</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription className='space-y-2 pt-2 text-xs'>
                            <p>
                                Marks have already been calculated for this exam and section. If you update marks now, you will need to
                                recalculate them again.
                            </p>
                            <p className='font-medium text-foreground'>Do you wish to continue and save the changes?</p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='pt-3'>
                        <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                executeSave();
                            }}
                            disabled={isSaving}
                            className='bg-amber-600 text-white hover:bg-amber-700'>
                            Yes, Update & Save
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
