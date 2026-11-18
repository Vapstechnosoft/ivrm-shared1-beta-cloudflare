'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckSquare, FileSpreadsheet, FileText, Filter, Loader2, RotateCcw, Search, Square } from 'lucide-react';
import { useMemo, useState } from 'react';
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

interface CumulativeReportFilterProps {
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
    selectedExamIds: number[];
    selectedSubject: number | undefined;
    reportType: 'Average' | 'Best';
    bestCount: string;

    onSelectYear: (id: number) => void;
    onSelectCourse: (id: number) => void;
    onSelectBranch: (id: number) => void;
    onSelectSemester: (id: number) => void;
    onSelectSection: (id: number) => void;
    onSelectSubjectScheme: (id: number) => void;
    onSelectSchemeType: (id: number) => void;
    onToggleExam: (id: number, checked: boolean) => void;
    onToggleAllExams: (select: boolean) => void;
    onSelectSubject: (id: number) => void;
    onSelectReportType: (type: 'Average' | 'Best') => void;
    onChangeBestCount: (value: string) => void;

    onSubmit: () => void;
    onReset: () => void;
    onExportExcel?: () => void;

    isLoadingDropdowns: boolean;
    isGeneratingReport: boolean;
    hasReportData: boolean;
}

export function CumulativeReportFilter({
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
    selectedExamIds,
    selectedSubject,
    reportType,
    bestCount,

    onSelectYear,
    onSelectCourse,
    onSelectBranch,
    onSelectSemester,
    onSelectSection,
    onSelectSubjectScheme,
    onSelectSchemeType,
    onToggleExam,
    onToggleAllExams,
    onSelectSubject,
    onSelectReportType,
    onChangeBestCount,

    onSubmit,
    onReset,
    onExportExcel,

    isLoadingDropdowns,
    isGeneratingReport,
    hasReportData
}: CumulativeReportFilterProps) {
    const [examSearch, setExamSearch] = useState('');

    const filteredExams = useMemo(() => {
        if (!examSearch.trim()) return exams;
        const q = examSearch.toLowerCase();
        return exams.filter((e) => (e.emE_ExamName || '').toLowerCase().includes(q));
    }, [exams, examSearch]);

    const isAllExamsSelected = useMemo(() => {
        if (filteredExams.length === 0) return false;
        return filteredExams.every((e) => selectedExamIds.includes(e.emE_Id));
    }, [filteredExams, selectedExamIds]);

    const handleSelectAllToggle = () => {
        if (isAllExamsSelected) {
            onToggleAllExams(false);
        } else {
            onToggleAllExams(true);
        }
    };

    return (
        <Card className='border-border/60 shadow-sm transition-all duration-200 hover:shadow-md'>
            <CardHeader className='border-b pb-4'>
                <div className='flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center'>
                    <div>
                        <CardTitle className='flex items-center gap-2 font-bold text-foreground text-xl tracking-tight'>
                            <Filter className='h-5 w-5 text-primary' />
                            Cumulative Report Filters
                        </CardTitle>
                        <CardDescription className='mt-0.5 text-muted-foreground text-xs'>
                            Select academic criteria to generate the college cumulative average and best marks report
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='pt-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8'>
                    {/* Left Column: Academic Structure */}
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
                    </div>

                    {/* Right Column: Exams, Subject, and Report Parameters */}
                    <div className='space-y-4'>
                        {/* Exams Multi-Select Box */}
                        <div className='space-y-1.5'>
                            <div className='flex items-center justify-between'>
                                <Label className='font-semibold text-foreground text-xs'>
                                    Exam <span className='text-destructive'>*</span>
                                    {selectedExamIds.length > 0 && (
                                        <span className='ml-2 font-normal text-primary text-xs'>({selectedExamIds.length} selected)</span>
                                    )}
                                </Label>
                                {exams.length > 0 && (
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        className='h-6 px-2 text-muted-foreground text-xs hover:text-foreground'
                                        onClick={handleSelectAllToggle}>
                                        {isAllExamsSelected ? (
                                            <>
                                                <Square className='mr-1 h-3.5 w-3.5' /> Deselect All
                                            </>
                                        ) : (
                                            <>
                                                <CheckSquare className='mr-1 h-3.5 w-3.5' /> Select All
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>

                            <div className='rounded-md border border-input bg-card p-3 shadow-inner'>
                                {exams.length > 5 && (
                                    <div className='relative mb-2'>
                                        <Search className='absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground' />
                                        <Input
                                            type='text'
                                            placeholder='Search exams...'
                                            value={examSearch}
                                            onChange={(e) => setExamSearch(e.target.value)}
                                            className='h-8 pl-8 text-xs'
                                        />
                                    </div>
                                )}
                                <div className='custom-scrollbar max-h-36 space-y-2 overflow-y-auto pr-1'>
                                    {filteredExams.length === 0 ? (
                                        <div className='py-4 text-center text-muted-foreground text-xs'>
                                            {exams.length === 0
                                                ? 'Please select Scheme Type & Section to load exams'
                                                : 'No exams matching search'}
                                        </div>
                                    ) : (
                                        filteredExams.map((exam) => {
                                            const isChecked = selectedExamIds.includes(exam.emE_Id);
                                            return (
                                                <div
                                                    key={exam.emE_Id}
                                                    className='flex items-center space-x-2.5 rounded px-1.5 py-1 transition-colors hover:bg-muted/50'>
                                                    <Checkbox
                                                        id={`exam-${exam.emE_Id}`}
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => onToggleExam(exam.emE_Id, !!checked)}
                                                    />
                                                    <label
                                                        htmlFor={`exam-${exam.emE_Id}`}
                                                        className='flex-1 cursor-pointer select-none font-medium text-foreground text-xs leading-none'>
                                                        {exam.emE_ExamName}
                                                    </label>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
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

                        {/* Report Type */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='report-type-select' className='font-semibold text-foreground text-xs'>
                                Report Type <span className='text-destructive'>*</span>
                            </Label>
                            <Select value={reportType} onValueChange={(val: 'Average' | 'Best') => onSelectReportType(val)}>
                                <SelectTrigger id='report-type-select' className='w-full'>
                                    <SelectValue placeholder='-- Select Report Type --' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='Average'>Average</SelectItem>
                                    <SelectItem value='Best'>Best</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Best Count */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='best-count-input' className='font-semibold text-foreground text-xs'>
                                Best <span className='text-destructive'>{reportType === 'Best' ? '*' : ''}</span>
                            </Label>
                            <Input
                                id='best-count-input'
                                type='text'
                                placeholder={reportType === 'Best' ? 'Enter Best count (e.g. 2)' : 'Disabled for Average'}
                                value={bestCount}
                                maxLength={2}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    onChangeBestCount(val);
                                }}
                                disabled={reportType === 'Average'}
                                className='h-9 text-xs'
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className='flex flex-wrap items-center justify-end gap-2.5 pt-3'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={onReset}
                                disabled={isGeneratingReport || isLoadingDropdowns}
                                className='h-9 px-4 font-medium text-xs'>
                                <RotateCcw className='mr-1.5 h-3.5 w-3.5' />
                                Cancel
                            </Button>

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
                                disabled={
                                    isGeneratingReport ||
                                    isLoadingDropdowns ||
                                    !selectedYear ||
                                    !selectedCourse ||
                                    !selectedBranch ||
                                    !selectedSemester ||
                                    !selectedSection ||
                                    !selectedSubjectScheme ||
                                    !selectedSchemeType ||
                                    !selectedSubject ||
                                    selectedExamIds.length === 0 ||
                                    (reportType === 'Best' && !bestCount)
                                }
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
