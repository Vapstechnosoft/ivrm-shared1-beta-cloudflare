'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckSquare, FileText, Filter, Loader2, Printer, RotateCcw, Search, Square } from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
    IAcademicYear,
    ICollegeBranch,
    ICollegeCourse,
    ICollegeExam,
    ICollegeSection,
    ICollegeSemester,
    ISchemeType,
    IStudentCheckboxItem,
    ISubjectScheme
} from '../types';

interface ProgressCardFilterProps {
    academicYears: IAcademicYear[];
    courses: ICollegeCourse[];
    branches: ICollegeBranch[];
    semesters: ICollegeSemester[];
    sections: ICollegeSection[];
    subjectSchemes: ISubjectScheme[];
    schemeTypes: ISchemeType[];
    exams: ICollegeExam[];
    students: IStudentCheckboxItem[];

    selectedYear: number | undefined;
    selectedCourse: number | undefined;
    selectedBranch: number | undefined;
    selectedSemester: number | undefined;
    selectedSection: number | undefined;
    selectedSubjectScheme: number | undefined;
    selectedSchemeType: number | undefined;
    selectedExam: number | undefined;
    selectedStudentIds: number[];

    onSelectYear: (id: number) => void;
    onSelectCourse: (id: number) => void;
    onSelectBranch: (id: number) => void;
    onSelectSemester: (id: number) => void;
    onSelectSection: (id: number) => void;
    onSelectSubjectScheme: (id: number) => void;
    onSelectSchemeType: (id: number) => void;
    onSelectExam: (id: number) => void;
    onToggleStudent: (id: number, checked: boolean) => void;
    onToggleAllStudents: (select: boolean) => void;

    onSubmit: () => void;
    onReset: () => void;
    onPrint?: () => void;

    isLoadingDropdowns: boolean;
    isGeneratingReport: boolean;
    hasReportData: boolean;
}

export function ProgressCardFilter({
    academicYears,
    courses,
    branches,
    semesters,
    sections,
    subjectSchemes,
    schemeTypes,
    exams,
    students,

    selectedYear,
    selectedCourse,
    selectedBranch,
    selectedSemester,
    selectedSection,
    selectedSubjectScheme,
    selectedSchemeType,
    selectedExam,
    selectedStudentIds,

    onSelectYear,
    onSelectCourse,
    onSelectBranch,
    onSelectSemester,
    onSelectSection,
    onSelectSubjectScheme,
    onSelectSchemeType,
    onSelectExam,
    onToggleStudent,
    onToggleAllStudents,

    onSubmit,
    onReset,
    onPrint,

    isLoadingDropdowns,
    isGeneratingReport,
    hasReportData
}: ProgressCardFilterProps) {
    const [studentSearch, setStudentSearch] = useState('');

    const filteredStudents = useMemo(() => {
        if (!studentSearch.trim()) return students;
        const q = studentSearch.toLowerCase();
        return students.filter((s) => (s.studentname || '').toLowerCase().includes(q));
    }, [students, studentSearch]);

    const isAllStudentsSelected = useMemo(() => {
        if (filteredStudents.length === 0) return false;
        return filteredStudents.every((s) => selectedStudentIds.includes(s.amscT_Id));
    }, [filteredStudents, selectedStudentIds]);

    const handleSelectAllToggle = () => {
        if (isAllStudentsSelected) {
            onToggleAllStudents(false);
        } else {
            onToggleAllStudents(true);
        }
    };

    const isFormValid =
        !!selectedYear &&
        !!selectedCourse &&
        !!selectedBranch &&
        !!selectedSemester &&
        !!selectedSection &&
        !!selectedSubjectScheme &&
        !!selectedSchemeType &&
        !!selectedExam &&
        selectedStudentIds.length > 0;

    return (
        <Card className='border-border/60 shadow-sm transition-all duration-200 hover:shadow-md'>
            <CardHeader className='border-b pb-4'>
                <div className='flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center'>
                    <div>
                        <CardTitle className='flex items-center gap-2 font-bold text-foreground text-xl tracking-tight'>
                            <Filter className='h-5 w-5 text-primary' />
                            Progress Card Report Filters
                        </CardTitle>
                        <CardDescription className='mt-0.5 text-muted-foreground text-xs'>
                            Select academic criteria, examination, and students to generate progress card reports
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='pt-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8'>
                    {/* Left Column: Academic Structure & Exam */}
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
                    </div>

                    {/* Right Column: Student Multi-Select Checkbox Box */}
                    <div className='flex flex-col justify-between space-y-4'>
                        <div className='space-y-1.5'>
                            <div className='flex items-center justify-between'>
                                <Label className='font-semibold text-foreground text-xs'>
                                    Students <span className='text-destructive'>*</span>
                                    {selectedStudentIds.length > 0 && (
                                        <span className='ml-2 font-normal text-primary text-xs'>
                                            ({selectedStudentIds.length} of {students.length} selected)
                                        </span>
                                    )}
                                </Label>
                                {students.length > 0 && (
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        className='h-6 px-2 text-muted-foreground text-xs hover:text-foreground'
                                        onClick={handleSelectAllToggle}>
                                        {isAllStudentsSelected ? (
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

                            <div className='flex-1 rounded-md border border-input bg-card p-3 shadow-inner'>
                                {students.length > 5 && (
                                    <div className='relative mb-2'>
                                        <Search className='absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground' />
                                        <Input
                                            type='text'
                                            placeholder='Search student name...'
                                            value={studentSearch}
                                            onChange={(e) => setStudentSearch(e.target.value)}
                                            className='h-8 pl-8 text-xs'
                                        />
                                    </div>
                                )}
                                <div className='custom-scrollbar max-h-72 space-y-2 overflow-y-auto pr-1'>
                                    {filteredStudents.length === 0 ? (
                                        <div className='py-8 text-center text-muted-foreground text-xs'>
                                            {students.length === 0
                                                ? 'Please select Scheme Type & Section to load students'
                                                : 'No students matching search'}
                                        </div>
                                    ) : (
                                        filteredStudents.map((stu) => {
                                            const isChecked = selectedStudentIds.includes(stu.amscT_Id);
                                            return (
                                                <div
                                                    key={stu.amscT_Id}
                                                    className='flex items-center space-x-2.5 rounded px-1.5 py-1 transition-colors hover:bg-muted/50'>
                                                    <Checkbox
                                                        id={`stu-${stu.amscT_Id}`}
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => onToggleStudent(stu.amscT_Id, !!checked)}
                                                    />
                                                    <label
                                                        htmlFor={`stu-${stu.amscT_Id}`}
                                                        className='flex-1 cursor-pointer select-none font-medium text-foreground text-xs leading-none'>
                                                        {stu.studentname}
                                                    </label>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex flex-wrap items-center justify-end gap-2.5 border-t pt-4'>
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
