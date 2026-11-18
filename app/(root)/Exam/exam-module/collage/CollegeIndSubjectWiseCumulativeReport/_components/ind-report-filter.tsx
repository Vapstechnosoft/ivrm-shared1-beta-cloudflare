'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, FileText, Filter, Loader2, Printer, RotateCcw } from 'lucide-react';
import type {
    IAcademicYear,
    ICollegeBranch,
    ICollegeCourse,
    ICollegeExam,
    ICollegeSection,
    ICollegeSemester,
    ICollegeSubject,
    ISchemeType,
    ISubjectScheme
} from '../types';

interface IndReportFilterProps {
    academicYears: IAcademicYear[];
    courses: ICollegeCourse[];
    branches: ICollegeBranch[];
    semesters: ICollegeSemester[];
    sections: ICollegeSection[];
    subjectSchemes: ISubjectScheme[];
    schemeTypes: ISchemeType[];
    exams: ICollegeExam[];
    subjects: ICollegeSubject[];

    selectedYear: number | undefined;
    selectedCourse: number | undefined;
    selectedBranch: number | undefined;
    selectedSemester: number | undefined;
    selectedSection: number | undefined;
    selectedSubjectScheme: number | undefined;
    selectedSchemeType: number | undefined;
    selectedExam: number | undefined;
    selectedSubject: number | undefined;

    onSelectYear: (id: number) => void;
    onSelectCourse: (id: number) => void;
    onSelectBranch: (id: number) => void;
    onSelectSemester: (id: number) => void;
    onSelectSection: (id: number) => void;
    onSelectSubjectScheme: (id: number) => void;
    onSelectSchemeType: (id: number) => void;
    onSelectExam: (id: number) => void;
    onSelectSubject: (id: number) => void;

    onSubmit: () => void;
    onReset: () => void;
    onExportExcel?: () => void;
    onPrint?: () => void;

    isLoadingDropdowns: boolean;
    isGeneratingReport: boolean;
    hasReportData: boolean;
}

export function IndReportFilter({
    academicYears,
    courses,
    branches,
    semesters,
    sections,
    subjectSchemes,
    schemeTypes,
    exams,
    subjects,

    selectedYear,
    selectedCourse,
    selectedBranch,
    selectedSemester,
    selectedSection,
    selectedSubjectScheme,
    selectedSchemeType,
    selectedExam,
    selectedSubject,

    onSelectYear,
    onSelectCourse,
    onSelectBranch,
    onSelectSemester,
    onSelectSection,
    onSelectSubjectScheme,
    onSelectSchemeType,
    onSelectExam,
    onSelectSubject,

    onSubmit,
    onReset,
    onExportExcel,
    onPrint,

    isLoadingDropdowns,
    isGeneratingReport,
    hasReportData
}: IndReportFilterProps) {
    const isFormValid =
        !!selectedYear &&
        !!selectedCourse &&
        !!selectedBranch &&
        !!selectedSemester &&
        !!selectedSection &&
        !!selectedSubjectScheme &&
        !!selectedSchemeType &&
        !!selectedExam &&
        !!selectedSubject;

    return (
        <Card className='border-border/60 shadow-sm transition-all duration-200 hover:shadow-md'>
            <CardHeader className='border-b pb-4'>
                <div className='flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center'>
                    <div>
                        <CardTitle className='flex items-center gap-2 font-bold text-foreground text-xl tracking-tight'>
                            <Filter className='h-5 w-5 text-primary' />
                            Subject-Wise Cumulative Report Filters
                        </CardTitle>
                        <CardDescription className='mt-0.5 text-muted-foreground text-xs'>
                            Select academic criteria, individual exam, and subject to generate the cumulative student performance report
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
                                disabled={isLoadingDropdowns || !selectedCourse || branches.length === 0}>
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
                                disabled={isLoadingDropdowns || !selectedSemester || sections.length === 0}>
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

                        {/* Scheme Type */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='schemetype-select' className='font-semibold text-foreground text-xs'>
                                Scheme Type <span className='text-destructive'>*</span>
                            </Label>
                            <Select
                                value={selectedSchemeType ? String(selectedSchemeType) : ''}
                                onValueChange={(val) => onSelectSchemeType(Number(val))}
                                disabled={isLoadingDropdowns || !selectedSubjectScheme || schemeTypes.length === 0}>
                                <SelectTrigger id='schemetype-select' className='w-full'>
                                    <SelectValue placeholder='-- Select Scheme Type --' />
                                </SelectTrigger>
                                <SelectContent>
                                    {schemeTypes.map((st) => (
                                        <SelectItem key={st.acsT_Id} value={String(st.acsT_Id)}>
                                            {st.acsT_SchmeType}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Subject */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='subject-select' className='font-semibold text-foreground text-xs'>
                                Subject <span className='text-destructive'>*</span>
                            </Label>
                            <Select
                                value={selectedSubject ? String(selectedSubject) : ''}
                                onValueChange={(val) => onSelectSubject(Number(val))}
                                disabled={isLoadingDropdowns || !selectedSchemeType || subjects.length === 0}>
                                <SelectTrigger id='subject-select' className='w-full'>
                                    <SelectValue placeholder='-- Select Subject --' />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map((sub) => (
                                        <SelectItem key={sub.ismS_Id} value={String(sub.ismS_Id)}>
                                            {sub.ismS_SubjectName} {sub.ismS_SubjectCode ? `: ${sub.ismS_SubjectCode}` : ''}
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
                                disabled={isLoadingDropdowns || !selectedYear || courses.length === 0}>
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
                                disabled={isLoadingDropdowns || !selectedBranch || semesters.length === 0}>
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

                        {/* Subject Scheme */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='scheme-select' className='font-semibold text-foreground text-xs'>
                                Subject Scheme <span className='text-destructive'>*</span>
                            </Label>
                            <Select
                                value={selectedSubjectScheme ? String(selectedSubjectScheme) : ''}
                                onValueChange={(val) => onSelectSubjectScheme(Number(val))}
                                disabled={isLoadingDropdowns || !selectedSemester || subjectSchemes.length === 0}>
                                <SelectTrigger id='scheme-select' className='w-full'>
                                    <SelectValue placeholder='-- Select Subject Scheme --' />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjectSchemes.map((ss) => (
                                        <SelectItem key={ss.acsS_Id} value={String(ss.acsS_Id)}>
                                            {ss.acsS_SchmeName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Exam (Single Select) */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='exam-select' className='font-semibold text-foreground text-xs'>
                                Exam <span className='text-destructive'>*</span>
                            </Label>
                            <Select
                                value={selectedExam ? String(selectedExam) : ''}
                                onValueChange={(val) => onSelectExam(Number(val))}
                                disabled={isLoadingDropdowns || !selectedSchemeType || exams.length === 0}>
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

                        {/* Action Buttons */}
                        <div className='flex flex-wrap items-center justify-end gap-2.5 pt-4'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={onReset}
                                disabled={isGeneratingReport || isLoadingDropdowns}
                                className='h-9 px-4 font-medium text-xs'>
                                <RotateCcw className='mr-1.5 h-3.5 w-3.5' />
                                Cancel
                            </Button>

                            {hasReportData && onPrint && (
                                <Button type='button' variant='outline' onClick={onPrint} className='h-9 px-3 font-medium text-xs'>
                                    <Printer className='mr-1.5 h-3.5 w-3.5' />
                                    Print
                                </Button>
                            )}

                            {hasReportData && onExportExcel && (
                                <Button
                                    type='button'
                                    variant='secondary'
                                    onClick={onExportExcel}
                                    className='h-9 bg-emerald-600 px-4 font-medium text-white text-xs hover:bg-emerald-700'>
                                    <FileSpreadsheet className='mr-1.5 h-3.5 w-3.5' />
                                    Excel
                                </Button>
                            )}

                            <Button
                                type='button'
                                onClick={onSubmit}
                                disabled={!isFormValid || isGeneratingReport || isLoadingDropdowns}
                                className='h-9 px-5 font-semibold text-xs shadow-sm'>
                                {isGeneratingReport ? (
                                    <>
                                        <Loader2 className='mr-2 h-3.5 w-3.5 animate-spin' />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileText className='mr-2 h-3.5 w-3.5' />
                                        Report
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
