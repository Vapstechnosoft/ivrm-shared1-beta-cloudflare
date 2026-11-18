'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Loader2, RotateCcw } from 'lucide-react';
import type { IAcademicYear, ICollegeBranch, ICollegeCourse, ICollegeExam, ICollegeSection, ICollegeSemester } from '../types';

interface CalculationFormProps {
    academicYears: IAcademicYear[];
    courses: ICollegeCourse[];
    branches: ICollegeBranch[];
    semesters: ICollegeSemester[];
    sections: ICollegeSection[];
    exams: ICollegeExam[];

    selectedYear: number | undefined;
    selectedCourse: number | undefined;
    selectedBranch: number | undefined;
    selectedSemester: number | undefined;
    selectedSection: number | undefined;
    selectedExam: number | undefined;

    onSelectYear: (id: number) => void;
    onSelectCourse: (id: number) => void;
    onSelectBranch: (id: number) => void;
    onSelectSemester: (id: number) => void;
    onSelectSection: (id: number) => void;
    onSelectExam: (id: number) => void;

    onCalculate: () => void;
    onReset: () => void;

    isLoadingDropdowns: boolean;
    isCalculating: boolean;
}

export function CalculationForm({
    academicYears,
    courses,
    branches,
    semesters,
    sections,
    exams,

    selectedYear,
    selectedCourse,
    selectedBranch,
    selectedSemester,
    selectedSection,
    selectedExam,

    onSelectYear,
    onSelectCourse,
    onSelectBranch,
    onSelectSemester,
    onSelectSection,
    onSelectExam,

    onCalculate,
    onReset,

    isLoadingDropdowns,
    isCalculating
}: CalculationFormProps) {
    const isFormValid = !!selectedYear && !!selectedCourse && !!selectedBranch && !!selectedSemester && !!selectedSection && !!selectedExam;

    return (
        <Card className='border-border/60 shadow-sm transition-all duration-200 hover:shadow-md'>
            <CardHeader className='border-b pb-4'>
                <div className='flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center'>
                    <div>
                        <CardTitle className='flex items-center gap-2 font-bold text-foreground text-xl tracking-tight'>
                            <Calculator className='h-5 w-5 text-primary' />
                            Exam Marks Calculation
                        </CardTitle>
                        <CardDescription className='mt-0.5 text-muted-foreground text-xs'>
                            Select the academic parameters to calculate and process college examination marks and grades
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='pt-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8'>
                    {/* Left Column */}
                    <div className='space-y-4'>
                        {/* Academic Year */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='year-select' className='font-semibold text-foreground text-xs'>
                                Academic Year <span className='text-destructive'>*</span>
                            </Label>
                            <Select
                                value={selectedYear ? String(selectedYear) : ''}
                                onValueChange={(val) => onSelectYear(Number(val))}
                                disabled={isLoadingDropdowns || academicYears.length === 0}>
                                <SelectTrigger id='year-select' className='w-full'>
                                    <SelectValue placeholder='-- Select Academic Year --' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYears.map((y) => (
                                        <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                            {y.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Branch */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='branch-select' className='font-semibold text-foreground text-xs'>
                                Branch <span className='text-destructive'>*</span>
                            </Label>
                            <Select
                                value={selectedBranch ? String(selectedBranch) : ''}
                                onValueChange={(val) => onSelectBranch(Number(val))}
                                disabled={isLoadingDropdowns || branches.length === 0}>
                                <SelectTrigger id='branch-select' className='w-full'>
                                    <SelectValue placeholder='-- Select Branch --' />
                                </SelectTrigger>
                                <SelectContent>
                                    {branches.map((b) => (
                                        <SelectItem key={b.amB_Id} value={String(b.amB_Id)}>
                                            {b.amB_BranchName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Section */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='sec-select' className='font-semibold text-foreground text-xs'>
                                Section <span className='text-destructive'>*</span>
                            </Label>
                            <Select
                                value={selectedSection ? String(selectedSection) : ''}
                                onValueChange={(val) => onSelectSection(Number(val))}
                                disabled={isLoadingDropdowns || sections.length === 0}>
                                <SelectTrigger id='sec-select' className='w-full'>
                                    <SelectValue placeholder='-- Select Section --' />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map((sec) => (
                                        <SelectItem key={sec.acmS_Id} value={String(sec.acmS_Id)}>
                                            {sec.acmS_SectionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className='space-y-4'>
                        {/* Course */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='course-select' className='font-semibold text-foreground text-xs'>
                                Course <span className='text-destructive'>*</span>
                            </Label>
                            <Select
                                value={selectedCourse ? String(selectedCourse) : ''}
                                onValueChange={(val) => onSelectCourse(Number(val))}
                                disabled={isLoadingDropdowns || courses.length === 0}>
                                <SelectTrigger id='course-select' className='w-full'>
                                    <SelectValue placeholder='-- Select Course --' />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((c) => (
                                        <SelectItem key={c.amcO_Id} value={String(c.amcO_Id)}>
                                            {c.amcO_CourseName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Semester */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='sem-select' className='font-semibold text-foreground text-xs'>
                                Semester <span className='text-destructive'>*</span>
                            </Label>
                            <Select
                                value={selectedSemester ? String(selectedSemester) : ''}
                                onValueChange={(val) => onSelectSemester(Number(val))}
                                disabled={isLoadingDropdowns || semesters.length === 0}>
                                <SelectTrigger id='sem-select' className='w-full'>
                                    <SelectValue placeholder='-- Select Semester --' />
                                </SelectTrigger>
                                <SelectContent>
                                    {semesters.map((s) => (
                                        <SelectItem key={s.amsE_Id} value={String(s.amsE_Id)}>
                                            {s.amsE_SEMName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Exam Name */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='exam-select' className='font-semibold text-foreground text-xs'>
                                Exam Name <span className='text-destructive'>*</span>
                            </Label>
                            <Select
                                value={selectedExam ? String(selectedExam) : ''}
                                onValueChange={(val) => onSelectExam(Number(val))}
                                disabled={isLoadingDropdowns || exams.length === 0}>
                                <SelectTrigger id='exam-select' className='w-full'>
                                    <SelectValue placeholder='-- Select Exam --' />
                                </SelectTrigger>
                                <SelectContent>
                                    {exams.map((ex) => (
                                        <SelectItem key={ex.emE_Id} value={String(ex.emE_Id)}>
                                            {ex.emE_ExamName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Form Action Buttons */}
                <div className='mt-6 flex flex-wrap items-center justify-center gap-3 border-t pt-6'>
                    <Button
                        type='button'
                        onClick={onCalculate}
                        disabled={!isFormValid || isCalculating || isLoadingDropdowns}
                        className='h-9 px-6 font-semibold text-xs shadow-sm'>
                        {isCalculating ? (
                            <>
                                <Loader2 className='mr-2 h-3.5 w-3.5 animate-spin' />
                                Calculating...
                            </>
                        ) : (
                            <>
                                <Calculator className='mr-2 h-3.5 w-3.5' />
                                Calculation
                            </>
                        )}
                    </Button>

                    <Button
                        type='button'
                        variant='outline'
                        onClick={onReset}
                        disabled={isCalculating}
                        className='h-9 px-4 font-medium text-xs'>
                        <RotateCcw className='mr-1.5 h-3.5 w-3.5' />
                        Clear
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
