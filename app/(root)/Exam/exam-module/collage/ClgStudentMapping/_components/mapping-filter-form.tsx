'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Loader2, RotateCcw, Search } from 'lucide-react';
import type { IAcademicYear, ICollegeBranch, ICollegeCourse, ICollegeSection, ICollegeSemester, ISubjectGroup } from '../types';

interface MappingFilterFormProps {
    academicYears: IAcademicYear[];
    courses: ICollegeCourse[];
    branches: ICollegeBranch[];
    semesters: ICollegeSemester[];
    sections: ICollegeSection[];
    subjectGroups: ISubjectGroup[];

    selectedYear: number | undefined;
    selectedCourse: number | undefined;
    selectedBranch: number | undefined;
    selectedSemester: number | undefined;
    selectedSection: number | undefined;
    selectedSubjectGroup: number | undefined;

    maxApplicableSubs?: number;
    minApplicableSubs?: number;

    onSelectYear: (id: number) => void;
    onSelectCourse: (id: number) => void;
    onSelectBranch: (id: number) => void;
    onSelectSemester: (id: number) => void;
    onSelectSection: (id: number) => void;
    onSelectSubjectGroup: (id: number) => void;

    onSearch: () => void;
    onReset: () => void;

    isLoadingDropdowns: boolean;
    isSearching: boolean;
}

export function MappingFilterForm({
    academicYears,
    courses,
    branches,
    semesters,
    sections,
    subjectGroups,

    selectedYear,
    selectedCourse,
    selectedBranch,
    selectedSemester,
    selectedSection,
    selectedSubjectGroup,

    maxApplicableSubs,
    minApplicableSubs,

    onSelectYear,
    onSelectCourse,
    onSelectBranch,
    onSelectSemester,
    onSelectSection,
    onSelectSubjectGroup,

    onSearch,
    onReset,

    isLoadingDropdowns,
    isSearching
}: MappingFilterFormProps) {
    const isFormValid =
        !!selectedYear && !!selectedCourse && !!selectedBranch && !!selectedSemester && !!selectedSection && !!selectedSubjectGroup;

    return (
        <Card className='border-border/60 shadow-sm transition-all duration-200 hover:shadow-md'>
            <CardHeader className='border-b pb-4'>
                <div className='flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center'>
                    <div>
                        <CardTitle className='flex items-center gap-2 font-bold text-foreground text-xl tracking-tight'>
                            <Filter className='h-5 w-5 text-primary' />
                            Student Subject Mapping Criteria
                        </CardTitle>
                        <CardDescription className='mt-0.5 text-muted-foreground text-xs'>
                            Select academic course, branch, semester, section, and subject group to map student subjects
                        </CardDescription>
                    </div>

                    {selectedSubjectGroup && (maxApplicableSubs !== undefined || minApplicableSubs !== undefined) && (
                        <div className='flex items-center gap-2 pt-1 sm:pt-0'>
                            {minApplicableSubs !== undefined && (
                                <Badge
                                    variant='outline'
                                    className='border-amber-500/40 bg-amber-50/50 font-medium text-amber-600 text-xs dark:bg-amber-950/20 dark:text-amber-400'>
                                    Min Subjects: {minApplicableSubs}
                                </Badge>
                            )}
                            {maxApplicableSubs !== undefined && (
                                <Badge
                                    variant='outline'
                                    className='border-emerald-500/40 bg-emerald-50/50 font-medium text-emerald-600 text-xs dark:bg-emerald-950/20 dark:text-emerald-400'>
                                    Max Subjects: {maxApplicableSubs}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className='pt-6'>
                <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
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
                                <SelectValue placeholder='-- Select Year --' />
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

                    {/* Subject Group */}
                    <div className='space-y-1.5'>
                        <Label htmlFor='sgrp-select' className='font-semibold text-foreground text-xs'>
                            Subject Group <span className='text-destructive'>*</span>
                        </Label>
                        <Select
                            value={selectedSubjectGroup ? String(selectedSubjectGroup) : ''}
                            onValueChange={(val) => onSelectSubjectGroup(Number(val))}
                            disabled={isLoadingDropdowns || !selectedSemester || subjectGroups.length === 0}>
                            <SelectTrigger id='sgrp-select' className='w-full'>
                                <SelectValue placeholder='-- Select Subject Group --' />
                            </SelectTrigger>
                            <SelectContent>
                                {subjectGroups.map((grp) => (
                                    <SelectItem key={grp.emG_Id} value={String(grp.emG_Id)}>
                                        {grp.emG_GroupName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Form Buttons */}
                <div className='mt-6 flex flex-wrap items-center justify-end gap-2.5 border-t pt-6'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={onReset}
                        disabled={isSearching || isLoadingDropdowns}
                        className='h-9 px-4 font-medium text-xs'>
                        <RotateCcw className='mr-1.5 h-3.5 w-3.5' />
                        Cancel
                    </Button>

                    <Button
                        type='button'
                        onClick={onSearch}
                        disabled={!isFormValid || isSearching || isLoadingDropdowns}
                        className='h-9 px-5 font-semibold text-xs shadow-sm'>
                        {isSearching ? (
                            <>
                                <Loader2 className='mr-2 h-3.5 w-3.5 animate-spin' />
                                Searching...
                            </>
                        ) : (
                            <>
                                <Search className='mr-2 h-3.5 w-3.5' />
                                Search Students
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
