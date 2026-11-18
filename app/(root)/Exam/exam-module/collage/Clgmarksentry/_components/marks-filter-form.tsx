'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Filter, HelpCircle, Loader2, RotateCcw, Search } from 'lucide-react';
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
import { MultiSelectSearch } from './multi-select-search';

interface MarksFilterFormProps {
    academicYears: IAcademicYear[];
    courses: ICollegeCourse[];
    branches: ICollegeBranch[];
    semesters: ICollegeSemester[];
    sections: ICollegeSection[];
    exams: ICollegeExam[];
    subjects: ICollegeSubject[];
    subjectSchemes: ISubjectScheme[];
    schemeTypes: ISchemeType[];

    selectedYear: number | undefined;
    selectedCourse: number | undefined;
    selectedBranchIds: (number | string)[];
    selectedSemester: number | undefined;
    selectedSectionIds: (number | string)[];
    selectedExam: number | undefined;
    selectedSubject: number | undefined;
    selectedScheme: number | undefined;
    selectedSchemeType: number | undefined;
    markCalculation: boolean;

    onSelectYear: (id: number) => void;
    onSelectCourse: (id: number) => void;
    onSelectBranches: (ids: (number | string)[]) => void;
    onSelectSemester: (id: number) => void;
    onSelectSections: (ids: (number | string)[]) => void;
    onSelectExam: (id: number) => void;
    onSelectSubject: (id: number) => void;
    onSelectScheme: (id: number) => void;
    onSelectSchemeType: (id: number) => void;
    onToggleMarkCalculation: (checked: boolean) => void;

    onSearch: () => void;
    onReset: () => void;

    isLoadingDropdowns: boolean;
    isSearching: boolean;
    hasSearched: boolean;
}

export function MarksFilterForm({
    academicYears,
    courses,
    branches,
    semesters,
    sections,
    exams,
    subjects,
    subjectSchemes,
    schemeTypes,

    selectedYear,
    selectedCourse,
    selectedBranchIds,
    selectedSemester,
    selectedSectionIds,
    selectedExam,
    selectedSubject,
    selectedScheme,
    selectedSchemeType,
    markCalculation,

    onSelectYear,
    onSelectCourse,
    onSelectBranches,
    onSelectSemester,
    onSelectSections,
    onSelectExam,
    onSelectSubject,
    onSelectScheme,
    onSelectSchemeType,
    onToggleMarkCalculation,

    onSearch,
    onReset,

    isLoadingDropdowns,
    isSearching
}: MarksFilterFormProps) {
    const isSearchDisabled =
        !selectedYear ||
        !selectedCourse ||
        selectedBranchIds.length === 0 ||
        !selectedSemester ||
        selectedSectionIds.length === 0 ||
        !selectedExam ||
        !selectedSubject ||
        !selectedScheme ||
        !selectedSchemeType ||
        isSearching;

    return (
        <Card className='border bg-card shadow-sm'>
            <CardHeader className='border-b bg-muted/20 pb-4'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                        <div className='rounded-lg bg-primary/10 p-2 text-primary'>
                            <Filter className='h-4 w-4' />
                        </div>
                        <div>
                            <CardTitle className='font-semibold text-base'>Search Criteria</CardTitle>
                            <CardDescription className='text-xs'>
                                Select the academic hierarchy and subject details to load students for marks entry
                            </CardDescription>
                        </div>
                    </div>
                    {isLoadingDropdowns && (
                        <div className='flex animate-pulse items-center space-x-1.5 text-muted-foreground text-xs'>
                            <Loader2 className='h-3.5 w-3.5 animate-spin text-primary' />
                            <span>Loading options...</span>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className='p-4 sm:p-6'>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!isSearchDisabled) onSearch();
                    }}>
                    <div className='grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2'>
                        {/* LEFT COLUMN */}
                        <div className='space-y-4'>
                            {/* Academic Year */}
                            <div className='grid grid-cols-1 items-center gap-2 sm:grid-cols-12'>
                                <Label className='font-medium text-foreground text-xs sm:col-span-4'>
                                    Academic Year <span className='text-destructive'>*</span>
                                </Label>
                                <div className='sm:col-span-8'>
                                    <Select
                                        value={selectedYear ? String(selectedYear) : ''}
                                        onValueChange={(val) => onSelectYear(Number(val))}>
                                        <SelectTrigger className='h-9 text-xs'>
                                            <SelectValue placeholder='-- Select Academic Year --' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYears.map((item) => (
                                                <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)} className='text-xs'>
                                                    {item.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Course */}
                            <div className='grid grid-cols-1 items-center gap-2 sm:grid-cols-12'>
                                <Label className='font-medium text-foreground text-xs sm:col-span-4'>
                                    Course <span className='text-destructive'>*</span>
                                </Label>
                                <div className='sm:col-span-8'>
                                    <Select
                                        disabled={!selectedYear || courses.length === 0}
                                        value={selectedCourse ? String(selectedCourse) : ''}
                                        onValueChange={(val) => onSelectCourse(Number(val))}>
                                        <SelectTrigger className='h-9 text-xs'>
                                            <SelectValue
                                                placeholder={
                                                    !selectedYear
                                                        ? 'Select year first'
                                                        : courses.length === 0
                                                          ? 'No courses available'
                                                          : '-- Select Course --'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((item) => (
                                                <SelectItem key={item.amcO_Id} value={String(item.amcO_Id)} className='text-xs'>
                                                    {item.amcO_CourseName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Branch (Multi-select) */}
                            <div className='grid grid-cols-1 items-center gap-2 sm:grid-cols-12'>
                                <Label className='font-medium text-foreground text-xs sm:col-span-4'>
                                    Branch <span className='text-destructive'>*</span>
                                </Label>
                                <div className='sm:col-span-8'>
                                    <MultiSelectSearch
                                        title='Branches'
                                        placeholder={
                                            !selectedCourse
                                                ? 'Select course first'
                                                : branches.length === 0
                                                  ? 'No branches found'
                                                  : '-- Select Branch(es) --'
                                        }
                                        disabled={!selectedCourse || branches.length === 0}
                                        options={branches.map((b) => ({
                                            id: b.amB_Id,
                                            label: b.amB_BranchName,
                                            code: b.amB_BranchCode
                                        }))}
                                        selectedIds={selectedBranchIds}
                                        onChange={onSelectBranches}
                                    />
                                </div>
                            </div>

                            {/* Semester */}
                            <div className='grid grid-cols-1 items-center gap-2 sm:grid-cols-12'>
                                <Label className='font-medium text-foreground text-xs sm:col-span-4'>
                                    Semester <span className='text-destructive'>*</span>
                                </Label>
                                <div className='sm:col-span-8'>
                                    <Select
                                        disabled={selectedBranchIds.length === 0 || semesters.length === 0}
                                        value={selectedSemester ? String(selectedSemester) : ''}
                                        onValueChange={(val) => onSelectSemester(Number(val))}>
                                        <SelectTrigger className='h-9 text-xs'>
                                            <SelectValue
                                                placeholder={
                                                    selectedBranchIds.length === 0
                                                        ? 'Select branch first'
                                                        : semesters.length === 0
                                                          ? 'No semesters available'
                                                          : '-- Select Semester --'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {semesters.map((item) => (
                                                <SelectItem key={item.amsE_Id} value={String(item.amsE_Id)} className='text-xs'>
                                                    {item.amsE_SEMName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Calculate Marks Toggle */}
                            <div className='grid grid-cols-1 items-center gap-2 pt-2 sm:grid-cols-12'>
                                <div className='sm:col-span-4' />
                                <div className='flex items-center space-x-2.5 rounded-lg border border-border/60 bg-muted/40 p-2.5 sm:col-span-8'>
                                    <Checkbox
                                        id='markCalculation'
                                        checked={markCalculation}
                                        onCheckedChange={(checked) => onToggleMarkCalculation(Boolean(checked))}
                                    />
                                    <Label
                                        htmlFor='markCalculation'
                                        className='flex cursor-pointer items-center gap-1.5 font-medium text-xs'>
                                        <span>Do You Want Calculate Marks</span>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className='h-3.5 w-3.5 cursor-help text-amber-500' />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className='text-xs'>
                                                        Automatically triggers grade and marks calculation after saving
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className='space-y-4'>
                            {/* Section (Multi-select) */}
                            <div className='grid grid-cols-1 items-center gap-2 sm:grid-cols-12'>
                                <Label className='font-medium text-foreground text-xs sm:col-span-4'>
                                    Section <span className='text-destructive'>*</span>
                                </Label>
                                <div className='sm:col-span-8'>
                                    <MultiSelectSearch
                                        title='Sections'
                                        placeholder={
                                            !selectedSemester
                                                ? 'Select semester first'
                                                : sections.length === 0
                                                  ? 'No sections found'
                                                  : '-- Select Section(es) --'
                                        }
                                        disabled={!selectedSemester || sections.length === 0}
                                        options={sections.map((s) => ({
                                            id: s.acmS_Id,
                                            label: s.acmS_SectionName,
                                            code: s.acmS_SectionCode
                                        }))}
                                        selectedIds={selectedSectionIds}
                                        onChange={onSelectSections}
                                    />
                                </div>
                            </div>

                            {/* Exam */}
                            <div className='grid grid-cols-1 items-center gap-2 sm:grid-cols-12'>
                                <Label className='font-medium text-foreground text-xs sm:col-span-4'>
                                    Exam <span className='text-destructive'>*</span>
                                </Label>
                                <div className='sm:col-span-8'>
                                    <Select
                                        disabled={!selectedSemester || exams.length === 0}
                                        value={selectedExam ? String(selectedExam) : ''}
                                        onValueChange={(val) => onSelectExam(Number(val))}>
                                        <SelectTrigger className='h-9 text-xs'>
                                            <SelectValue
                                                placeholder={
                                                    !selectedSemester
                                                        ? 'Select semester first'
                                                        : exams.length === 0
                                                          ? 'No exams available'
                                                          : '-- Select Exam --'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {exams.map((item) => (
                                                <SelectItem key={item.emE_Id} value={String(item.emE_Id)} className='text-xs'>
                                                    {item.emE_ExamName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Subject */}
                            <div className='grid grid-cols-1 items-center gap-2 sm:grid-cols-12'>
                                <Label className='font-medium text-foreground text-xs sm:col-span-4'>
                                    Subject <span className='text-destructive'>*</span>
                                </Label>
                                <div className='sm:col-span-8'>
                                    <Select
                                        disabled={!selectedExam || subjects.length === 0}
                                        value={selectedSubject ? String(selectedSubject) : ''}
                                        onValueChange={(val) => onSelectSubject(Number(val))}>
                                        <SelectTrigger className='h-9 text-xs'>
                                            <SelectValue
                                                placeholder={
                                                    !selectedExam
                                                        ? 'Select exam first'
                                                        : subjects.length === 0
                                                          ? 'No subjects available'
                                                          : '-- Select Subject --'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map((item) => (
                                                <SelectItem key={item.ismS_Id} value={String(item.ismS_Id)} className='text-xs'>
                                                    {item.ismS_SubjectName} {item.ismS_SubjectCode ? `(${item.ismS_SubjectCode})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Subject Scheme */}
                            <div className='grid grid-cols-1 items-center gap-2 sm:grid-cols-12'>
                                <Label className='font-medium text-foreground text-xs sm:col-span-4'>
                                    Subject Scheme <span className='text-destructive'>*</span>
                                </Label>
                                <div className='sm:col-span-8'>
                                    <Select
                                        disabled={!selectedSubject || subjectSchemes.length === 0}
                                        value={selectedScheme ? String(selectedScheme) : ''}
                                        onValueChange={(val) => onSelectScheme(Number(val))}>
                                        <SelectTrigger className='h-9 text-xs'>
                                            <SelectValue
                                                placeholder={
                                                    !selectedSubject
                                                        ? 'Select subject first'
                                                        : subjectSchemes.length === 0
                                                          ? 'No schemes available'
                                                          : '-- Select Subject Scheme --'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjectSchemes.map((item) => (
                                                <SelectItem key={item.acsS_Id} value={String(item.acsS_Id)} className='text-xs'>
                                                    {item.acsS_SchmeName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Scheme Type */}
                            <div className='grid grid-cols-1 items-center gap-2 sm:grid-cols-12'>
                                <Label className='font-medium text-foreground text-xs sm:col-span-4'>
                                    Scheme Type <span className='text-destructive'>*</span>
                                </Label>
                                <div className='sm:col-span-8'>
                                    <Select
                                        disabled={!selectedScheme || schemeTypes.length === 0}
                                        value={selectedSchemeType ? String(selectedSchemeType) : ''}
                                        onValueChange={(val) => onSelectSchemeType(Number(val))}>
                                        <SelectTrigger className='h-9 text-xs'>
                                            <SelectValue
                                                placeholder={
                                                    !selectedScheme
                                                        ? 'Select scheme first'
                                                        : schemeTypes.length === 0
                                                          ? 'No scheme types found'
                                                          : '-- Select Scheme Type --'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {schemeTypes.map((item) => (
                                                <SelectItem key={item.acsT_Id} value={String(item.acsT_Id)} className='text-xs'>
                                                    {item.acsT_SchmeType}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className='mt-8 flex flex-wrap items-center justify-center gap-3 border-t pt-4'>
                        <Button type='submit' disabled={isSearchDisabled} className='min-w-[130px] shadow-sm'>
                            {isSearching ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <Search className='mr-2 h-4 w-4' />
                                    Search
                                </>
                            )}
                        </Button>

                        <Button type='button' variant='outline' onClick={onReset} disabled={isSearching} className='min-w-[110px]'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
