'use client';

import { Button } from '@/components/ui/button';
import { Calculator, ChevronRight, MessageSquare, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CalculationForm } from './_components/calculation-form';
import { FeedbackModal } from './_components/feedback-modal';
import { calculateCollegeMarks, getInitialDetails, loadModuleFeedback } from './actions';
import type {
    IAcademicYear,
    ICollegeBranch,
    ICollegeCourse,
    ICollegeExam,
    ICollegeSection,
    ICollegeSemester,
    IFeedbackQuestion
} from './types';

export default function ClgExamMarksCalculationPage() {
    // Dropdown Data States
    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [courses, setCourses] = useState<ICollegeCourse[]>([]);
    const [branches, setBranches] = useState<ICollegeBranch[]>([]);
    const [semesters, setSemesters] = useState<ICollegeSemester[]>([]);
    const [sections, setSections] = useState<ICollegeSection[]>([]);
    const [exams, setExams] = useState<ICollegeExam[]>([]);

    // Selected Form Values
    const [selectedYear, setSelectedYear] = useState<number | undefined>();
    const [selectedCourse, setSelectedCourse] = useState<number | undefined>();
    const [selectedBranch, setSelectedBranch] = useState<number | undefined>();
    const [selectedSemester, setSelectedSemester] = useState<number | undefined>();
    const [selectedSection, setSelectedSection] = useState<number | undefined>();
    const [selectedExam, setSelectedExam] = useState<number | undefined>();

    // Feedback States
    const [feedbackQuestions, setFeedbackQuestions] = useState<IFeedbackQuestion[]>([]);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    // Loading States
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);

    /**
     * Initial Load of All Dropdowns & Feedback
     */
    const bindInitialData = useCallback(async () => {
        setIsLoadingInitial(true);
        try {
            const res = await getInitialDetails();
            if (res.success && res.data) {
                setAcademicYears(res.data.yearlist || []);
                setCourses(res.data.courseslist || []);
                setSemesters(res.data.semesters || []);
                setBranches(res.data.branchlist || []);
                setExams(res.data.examlist || []);
                setSections(res.data.sectionlist || []);
            } else {
                toast.error(res.message || 'Failed to load initial details');
            }

            // Load feedback questions
            try {
                const fbRes = await loadModuleFeedback();
                if (fbRes.success && fbRes.data?.feedbackquestion && fbRes.data.feedbackquestion.length > 0) {
                    const questions = fbRes.data.feedbackquestion;
                    const options = fbRes.data.feedbackoption || [];

                    const mappedQuestions: IFeedbackQuestion[] = questions.map((fqe) => {
                        const relatedOptions = options.filter((fop) => fqe.fmtY_Id === fop.fmtY_Id && fqe.fmqE_Id === fop.fmqE_Id);
                        return {
                            ...fqe,
                            feedbackoptiondata: relatedOptions
                        };
                    });

                    setFeedbackQuestions(mappedQuestions);
                    setIsFeedbackOpen(true);
                }
            } catch {
                // Ignore feedback loading error silently
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
     * Execute Exam Marks Calculation
     */
    const handleCalculate = async () => {
        if (!selectedYear || !selectedCourse || !selectedBranch || !selectedSemester || !selectedSection || !selectedExam) {
            toast.error('Please select all required fields before calculation.');
            return;
        }

        const payload = {
            ASMAY_Id: selectedYear,
            AMCO_Id: selectedCourse,
            AMB_Id: selectedBranch,
            ACMS_Id: selectedSection,
            AMSE_Id: selectedSemester,
            EME_Id: selectedExam
        };

        setIsCalculating(true);
        try {
            const res = await calculateCollegeMarks(payload);
            if (res.success && res.data?.returnval === true) {
                toast.success('Marks Calculated Successfully');
            } else {
                toast.error(res.message || 'Marks Not Calculated !!!');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error executing marks calculation');
        } finally {
            setIsCalculating(false);
        }
    };

    /**
     * Reset Form
     */
    const handleReset = () => {
        setSelectedYear(undefined);
        setSelectedCourse(undefined);
        setSelectedBranch(undefined);
        setSelectedSemester(undefined);
        setSelectedSection(undefined);
        setSelectedExam(undefined);
        toast.info('Form cleared.');
    };

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
                    <span className='font-medium text-foreground'>Exam Marks Calculation</span>
                </nav>

                {/* Page Title Header */}
                <div className='flex flex-col justify-between gap-4 border-b pb-3 sm:flex-row sm:items-center'>
                    <div className='flex items-center space-x-3'>
                        <div className='rounded-xl bg-primary p-2.5 text-primary-foreground shadow-sm'>
                            <Calculator className='h-6 w-6' />
                        </div>
                        <div>
                            <h1 className='font-bold text-foreground text-xl tracking-tight sm:text-2xl'>College Exam Marks Calculation</h1>
                            <p className='text-muted-foreground text-xs sm:text-sm'>
                                Calculate and compute college examination marks, grades, and cumulative results
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center gap-2'>
                        {feedbackQuestions.length > 0 && (
                            <Button variant='outline' size='sm' onClick={() => setIsFeedbackOpen(true)} className='h-9 text-xs'>
                                <MessageSquare className='mr-1.5 h-3.5 w-3.5' />
                                Feedback
                            </Button>
                        )}
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={handleReset}
                            disabled={isLoadingInitial || isCalculating}
                            className='h-9 text-xs'>
                            <RefreshCw className='mr-1.5 h-3.5 w-3.5' />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {/* Calculation Form Card */}
            <CalculationForm
                academicYears={academicYears}
                courses={courses}
                branches={branches}
                semesters={semesters}
                sections={sections}
                exams={exams}
                selectedYear={selectedYear}
                selectedCourse={selectedCourse}
                selectedBranch={selectedBranch}
                selectedSemester={selectedSemester}
                selectedSection={selectedSection}
                selectedExam={selectedExam}
                onSelectYear={setSelectedYear}
                onSelectCourse={setSelectedCourse}
                onSelectBranch={setSelectedBranch}
                onSelectSemester={setSelectedSemester}
                onSelectSection={setSelectedSection}
                onSelectExam={setSelectedExam}
                onCalculate={handleCalculate}
                onReset={handleReset}
                isLoadingDropdowns={isLoadingInitial}
                isCalculating={isCalculating}
            />

            {/* Feedback Modal */}
            {feedbackQuestions.length > 0 && (
                <FeedbackModal open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} questions={feedbackQuestions} />
            )}
        </div>
    );
}
