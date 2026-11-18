'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText, Loader2, RotateCcw, Save, Search, Upload, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { saveClgSubjectMapping } from '../actions';
import type { IClgBranch, IClgCourse, IClgIntroYear, IClgSubjectDropdownItem, IClgSubjectMapping, IClgYear } from '../types';

interface SubjectMapFormData {
    ISMS_Id: string;
    AMCO_Id: string;
    ISMS_IntroYear: string;
    ISMS_DiscontinuedFlg: boolean;
    ISMS_DiscontinuedYear: string;
    ISMS_DiscontinuedReason: string;
}

const defaultMapFormValues: SubjectMapFormData = {
    ISMS_Id: '',
    AMCO_Id: '',
    ISMS_IntroYear: '',
    ISMS_DiscontinuedFlg: false,
    ISMS_DiscontinuedYear: '',
    ISMS_DiscontinuedReason: ''
};

interface SubjectMapTabProps {
    subList: IClgSubjectDropdownItem[];
    courseList: IClgCourse[];
    branchList: IClgBranch[];
    yearList: IClgYear[];
    yearOfIntro: IClgIntroYear[];
    mappingListData: IClgSubjectMapping[];
    onRefresh: () => Promise<void>;
    isLoading?: boolean;
}

export function SubjectMapTab({
    subList,
    courseList,
    branchList,
    yearList,
    yearOfIntro,
    mappingListData,
    onRefresh,
    isLoading = false
}: SubjectMapTabProps) {
    const [branches, setBranches] = useState<{ amB_Id: number; amB_BranchName: string; select: boolean }[]>([]);
    const [branchSearch, setBranchSearch] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [filePath, setFilePath] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    // Search and pagination for mapping list
    const [gridSearch, setGridSearch] = useState('');
    const [sortColumn, setSortColumn] = useState<string>('amcO_CourseName');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Sync initial branch list
    React.useEffect(() => {
        if (branchList && branchList.length > 0) {
            setBranches(
                branchList.map((b) => ({
                    amB_Id: b.amB_Id,
                    amB_BranchName: b.amB_BranchName,
                    select: false
                }))
            );
        }
    }, [branchList]);

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<SubjectMapFormData>({
        defaultValues: defaultMapFormValues
    });

    const isDiscontinued = watch('ISMS_DiscontinuedFlg');

    // Branch multi-select helpers
    const isAllBranchesSelected = useMemo(() => {
        return branches.length > 0 && branches.every((b) => b.select);
    }, [branches]);

    const handleToggleAllBranches = (checked: boolean) => {
        setBranches((prev) => prev.map((b) => ({ ...b, select: checked })));
    };

    const handleToggleBranch = (id: number, checked: boolean) => {
        setBranches((prev) =>
            prev.map((b) => (b.amB_Id === id ? { ...b, select: checked } : b))
        );
    };

    const filteredBranches = useMemo(() => {
        if (!branchSearch.trim()) return branches;
        const q = branchSearch.toLowerCase().trim();
        return branches.filter((b) => (b.amB_BranchName || '').toLowerCase().includes(q));
    }, [branches, branchSearch]);

    // File Upload helper
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            Swal.fire({
                icon: 'warning',
                title: 'File Too Large',
                text: 'Image / Document size should be less than 2MB'
            });
            return;
        }

        setUploadedFile(file);
        setFileName(file.name);
        // Using object url or file name for payload representation
        setFilePath(file.name);
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        setFileName('');
        setFilePath('');
    };

    // Clear Form
    const handleClear = () => {
        reset(defaultMapFormValues);
        setBranches((prev) => prev.map((b) => ({ ...b, select: false })));
        setBranchSearch('');
        handleRemoveFile();
    };

    // Save Mapping Form
    const onSubmit = async (data: SubjectMapFormData) => {
        const selectedBranches = branches.filter((b) => b.select);
        if (selectedBranches.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Branch Required',
                text: 'Please select at least one Branch'
            });
            return;
        }

        if (data.ISMS_DiscontinuedFlg && !data.ISMS_DiscontinuedYear) {
            Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please select Discontinued Year'
            });
            return;
        }

        try {
            setIsSaving(true);
            const payload: any = {
                ISMS_Id: Number(data.ISMS_Id),
                AMCO_Id: Number(data.AMCO_Id),
                ISMS_DiscontinuedFlg: data.ISMS_DiscontinuedFlg ? 1 : 0,
                ISMS_DiscontinuedYear: data.ISMS_DiscontinuedFlg ? Number(data.ISMS_DiscontinuedYear) : 0,
                ISMS_DiscontinuedReason: data.ISMS_DiscontinuedFlg ? data.ISMS_DiscontinuedReason || '' : '',
                ISMS_IntroYear: data.ISMS_IntroYear ? Number(data.ISMS_IntroYear) : 0,
                branch_list_data: selectedBranches.map((b) => ({ amB_Id: b.amB_Id }))
            };

            if (fileName && filePath) {
                payload.ISMS_FileName = fileName;
                payload.ISMS_FilePath = filePath;
            }

            const response = await saveClgSubjectMapping(payload);
            const resData = response?.data;

            if (resData?.returnval === true) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Record Saved Successfully'
                });
                handleClear();
                await onRefresh();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed',
                    text: response?.message || 'Failed to save subject mapping'
                });
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error saving mapping');
        } finally {
            setIsSaving(false);
        }
    };

    // Mapping Grid Filter & Sort
    const filteredMappings = useMemo(() => {
        let list = [...mappingListData];

        if (gridSearch.trim()) {
            const q = gridSearch.toLowerCase().trim();
            list = list.filter((item) => {
                const cName = (item.amcO_CourseName || '').toLowerCase();
                const bName = (item.amB_BranchName || '').toLowerCase();
                const sName = (item.ismS_SubjectName || '').toLowerCase();
                const sCode = (item.ismS_SubjectCode || '').toLowerCase();
                const iYr = String(item.ismS_IntroYear ?? '').toLowerCase();
                const dYr = String(item.ismS_DiscontinuedYear ?? '').toLowerCase();

                return (
                    cName.includes(q) ||
                    bName.includes(q) ||
                    sName.includes(q) ||
                    sCode.includes(q) ||
                    iYr.includes(q) ||
                    dYr.includes(q)
                );
            });
        }

        list.sort((a: any, b: any) => {
            const valA = a[sortColumn] ?? '';
            const valB = b[sortColumn] ?? '';
            const comp = String(valA).localeCompare(String(valB));
            return sortDirection === 'asc' ? comp : -comp;
        });

        return list;
    }, [mappingListData, gridSearch, sortColumn, sortDirection]);

    const totalPages = Math.ceil(filteredMappings.length / pageSize) || 1;
    const paginatedMappings = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredMappings.slice(start, start + pageSize);
    }, [filteredMappings, currentPage, pageSize]);

    const handleSort = (col: string) => {
        if (sortColumn === col) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(col);
            setSortDirection('asc');
        }
    };

    return (
        <div className='space-y-6'>
            {/* Form Section */}
            <Card className='border-border/60 shadow-sm'>
                <CardHeader className='border-b bg-muted/20 pb-4'>
                    <CardTitle className='text-lg font-semibold text-foreground'>
                        Subject Course & Branch Mapping
                    </CardTitle>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                        Map master subjects to college courses, branches, and introduction/discontinued years
                    </p>
                </CardHeader>
                <CardContent className='p-6'>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        {/* Row 1: Subject and Course */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            {/* Subject Select */}
                            <div className='flex flex-col gap-1.5'>
                                <Label htmlFor='map_subject'>
                                    Subject <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='ISMS_Id'
                                    control={control}
                                    rules={{ required: 'Please Select Subject' }}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value ? String(field.value) : ''}
                                            onValueChange={field.onChange}>
                                            <SelectTrigger id='map_subject' className='w-full'>
                                                <SelectValue placeholder='Select Subject' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subList.map((sub) => (
                                                    <SelectItem key={sub.ismS_Id} value={String(sub.ismS_Id)}>
                                                        {sub.ismS_SubjectName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.ISMS_Id && <FormError>{errors.ISMS_Id.message}</FormError>}
                            </div>

                            {/* Course Select */}
                            <div className='flex flex-col gap-1.5'>
                                <Label htmlFor='map_course'>
                                    Course <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='AMCO_Id'
                                    control={control}
                                    rules={{ required: 'Please Select Course' }}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value ? String(field.value) : ''}
                                            onValueChange={field.onChange}>
                                            <SelectTrigger id='map_course' className='w-full'>
                                                <SelectValue placeholder='Select Course' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courseList.map((c) => (
                                                    <SelectItem key={c.amcO_Id} value={String(c.amcO_Id)}>
                                                        {c.amcO_CourseName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.AMCO_Id && <FormError>{errors.AMCO_Id.message}</FormError>}
                            </div>
                        </div>

                        {/* Row 2: Branch Multiselect & Upload / Years */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            {/* Branch Multi-select with search */}
                            <div className='flex flex-col gap-2'>
                                <Label>
                                    Branch Name <span className='text-red-500'>*</span>
                                </Label>
                                <div className='rounded-md border border-input p-3 bg-card space-y-2'>
                                    {/* Search Branch */}
                                    <div className='relative'>
                                        <Search className='absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
                                        <input
                                            type='text'
                                            placeholder='Search branch...'
                                            value={branchSearch}
                                            onChange={(e) => setBranchSearch(e.target.value)}
                                            className='w-full rounded border border-input bg-background pl-8 pr-3 py-1 text-xs shadow-inner focus:outline-none focus:ring-1 focus:ring-primary'
                                        />
                                    </div>

                                    {/* Select All Option */}
                                    <div className='flex items-center space-x-2 pt-1 border-b pb-2'>
                                        <Checkbox
                                            id='branch_all'
                                            checked={isAllBranchesSelected}
                                            onCheckedChange={(checked) => handleToggleAllBranches(Boolean(checked))}
                                        />
                                        <Label htmlFor='branch_all' className='text-xs font-semibold cursor-pointer'>
                                            All Branches
                                        </Label>
                                    </div>

                                    {/* Branch List Scroll */}
                                    <div className='max-h-36 overflow-y-auto space-y-2 pr-1'>
                                        {filteredBranches.length === 0 ? (
                                            <p className='text-xs text-muted-foreground py-2 text-center'>
                                                No branches found
                                            </p>
                                        ) : (
                                            filteredBranches.map((br) => (
                                                <div key={br.amB_Id} className='flex items-center space-x-2'>
                                                    <Checkbox
                                                        id={`branch_${br.amB_Id}`}
                                                        checked={br.select}
                                                        onCheckedChange={(checked) =>
                                                            handleToggleBranch(br.amB_Id, Boolean(checked))
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`branch_${br.amB_Id}`}
                                                        className='text-xs cursor-pointer text-foreground'>
                                                        {br.amB_BranchName}
                                                    </Label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Year of Introduction & Discontinued Settings */}
                            <div className='space-y-4'>
                                {/* Year Of Introduction */}
                                <div className='flex flex-col gap-1.5'>
                                    <Label htmlFor='ISMS_IntroYear'>Year Of Introduction</Label>
                                    <Controller
                                        name='ISMS_IntroYear'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value ? String(field.value) : ''}
                                                onValueChange={field.onChange}>
                                                <SelectTrigger id='ISMS_IntroYear' className='w-full'>
                                                    <SelectValue placeholder='-- Select Year --' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {yearOfIntro.map((yr) => (
                                                        <SelectItem key={yr.yearid} value={String(yr.yearid)}>
                                                            {yr.yearname}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                {/* Discontinued Flag & Fields */}
                                <div className='rounded-md border p-4 bg-muted/20 space-y-3'>
                                    <div className='flex items-center space-x-2.5'>
                                        <Controller
                                            name='ISMS_DiscontinuedFlg'
                                            control={control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    id='ISMS_DiscontinuedFlg'
                                                    checked={field.value}
                                                    onCheckedChange={(val) => {
                                                        field.onChange(val);
                                                        if (!val) {
                                                            setValue('ISMS_DiscontinuedYear', '');
                                                            setValue('ISMS_DiscontinuedReason', '');
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                        <Label htmlFor='ISMS_DiscontinuedFlg' className='text-sm font-medium cursor-pointer'>
                                            Discontinued Flag
                                        </Label>
                                    </div>

                                    {isDiscontinued && (
                                        <div className='space-y-3 pt-2 border-t border-border/50 animate-in fade-in-50 duration-200'>
                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='ISMS_DiscontinuedYear'>
                                                    Discontinued Year <span className='text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    name='ISMS_DiscontinuedYear'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value ? String(field.value) : ''}
                                                            onValueChange={field.onChange}>
                                                            <SelectTrigger id='ISMS_DiscontinuedYear' className='w-full'>
                                                                <SelectValue placeholder='-- Select Discontinued Year --' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {yearList.map((y) => (
                                                                    <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                                        {y.asmaY_Year}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>

                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='ISMS_DiscontinuedReason'>Discontinued Reason</Label>
                                                <Textarea
                                                    id='ISMS_DiscontinuedReason'
                                                    placeholder='Enter reason for discontinuation...'
                                                    rows={3}
                                                    {...register('ISMS_DiscontinuedReason')}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Upload File/Photo */}
                                <div className='space-y-2'>
                                    <Label>Upload File / Photo (Max 2MB)</Label>
                                    <div className='flex items-center gap-3'>
                                        <label className='flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-muted/50 text-xs font-medium bg-card shadow-sm transition-colors'>
                                            <Upload className='h-4 w-4 text-primary' />
                                            <span>Choose Document</span>
                                            <input
                                                type='file'
                                                className='hidden'
                                                accept='image/*,application/pdf,application/msword,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                                onChange={handleFileChange}
                                            />
                                        </label>

                                        {fileName && (
                                            <div className='flex items-center gap-2 text-xs bg-muted px-2.5 py-1.5 rounded-md text-foreground max-w-xs truncate'>
                                                <FileText className='h-3.5 w-3.5 text-primary shrink-0' />
                                                <span className='truncate'>{fileName}</span>
                                                <button
                                                    type='button'
                                                    onClick={handleRemoveFile}
                                                    className='text-destructive hover:text-destructive/80 shrink-0 ml-1'>
                                                    <X className='h-3.5 w-3.5' />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex items-center justify-center gap-3 border-t pt-5'>
                            <Button
                                type='submit'
                                disabled={isSaving}
                                className='min-w-[110px] bg-primary shadow hover:bg-primary/90'>
                                {isSaving ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className='mr-2 h-4 w-4' />
                                        Save Mapping
                                    </>
                                )}
                            </Button>

                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleClear}
                                disabled={isSaving}
                                className='min-w-[100px] border-destructive/30 text-destructive hover:bg-destructive/10'>
                                <RotateCcw className='mr-2 h-4 w-4' />
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Mapping Details Table Card */}
            <Card className='border-border/60 shadow-sm'>
                <CardHeader className='border-b bg-muted/20 pb-4'>
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                        <div>
                            <CardTitle className='text-lg font-semibold text-foreground'>
                                Subject Mapping Details
                            </CardTitle>
                            <div className='flex items-center gap-2 mt-1 text-xs text-muted-foreground'>
                                <span>Total Grid Records:</span>
                                <Badge variant='secondary' className='font-mono'>
                                    {mappingListData.length}
                                </Badge>
                                {gridSearch.trim() && (
                                    <>
                                        <span>• Filtered:</span>
                                        <Badge variant='outline' className='font-mono'>
                                            {filteredMappings.length}
                                        </Badge>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className='relative w-full sm:w-72'>
                            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                            <input
                                type='text'
                                placeholder='Search mapping details...'
                                value={gridSearch}
                                onChange={(e) => {
                                    setGridSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className='w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary'
                            />
                            {gridSearch && (
                                <button
                                    type='button'
                                    onClick={() => setGridSearch('')}
                                    className='absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground'>
                                    <X className='h-4 w-4' />
                                </button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className='p-0'>
                    <div className='overflow-x-auto'>
                        <table className='w-full border-collapse text-left text-sm'>
                            <thead className='border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase'>
                                <tr>
                                    <th className='px-4 py-3 text-center w-14'>SL NO</th>
                                    <th className='px-4 py-3 cursor-pointer hover:text-foreground' onClick={() => handleSort('amcO_CourseName')}>
                                        Course
                                    </th>
                                    <th className='px-4 py-3 cursor-pointer hover:text-foreground' onClick={() => handleSort('amB_BranchName')}>
                                        Branch
                                    </th>
                                    <th className='px-4 py-3 cursor-pointer hover:text-foreground' onClick={() => handleSort('ismS_SubjectName')}>
                                        Subject
                                    </th>
                                    <th className='px-4 py-3 cursor-pointer hover:text-foreground' onClick={() => handleSort('ismS_SubjectCode')}>
                                        Subject Code
                                    </th>
                                    <th className='px-4 py-3 text-center cursor-pointer hover:text-foreground' onClick={() => handleSort('ismS_IntroYear')}>
                                        Intro Year
                                    </th>
                                    <th className='px-4 py-3 text-center cursor-pointer hover:text-foreground' onClick={() => handleSort('ismS_DiscontinuedYear')}>
                                        Discontinued Year
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-border'>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className='px-4 py-8 text-center text-muted-foreground'>
                                            <div className='flex items-center justify-center gap-2'>
                                                <Loader2 className='h-5 w-5 animate-spin text-primary' />
                                                <span>Loading mapping details...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedMappings.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className='px-4 py-8 text-center text-muted-foreground'>
                                            No mapping details found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedMappings.map((row, index) => {
                                        const slNo = (currentPage - 1) * pageSize + index + 1;
                                        return (
                                            <tr key={index} className='hover:bg-muted/30 transition-colors'>
                                                <td className='px-4 py-3 text-center font-mono text-xs'>{slNo}</td>
                                                <td className='px-4 py-3 font-medium text-foreground'>{row.amcO_CourseName || '-'}</td>
                                                <td className='px-4 py-3 text-muted-foreground'>{row.amB_BranchName || '-'}</td>
                                                <td className='px-4 py-3 text-foreground font-medium'>{row.ismS_SubjectName || '-'}</td>
                                                <td className='px-4 py-3 font-mono text-xs text-muted-foreground'>{row.ismS_SubjectCode || '-'}</td>
                                                <td className='px-4 py-3 text-center font-mono text-xs'>{row.ismS_IntroYear || '-'}</td>
                                                <td className='px-4 py-3 text-center font-mono text-xs'>{row.ismS_DiscontinuedYear || '-'}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-muted/10'>
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                            <span>Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className='h-8 rounded border border-input bg-background px-2 text-xs'>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span>
                                Showing {paginatedMappings.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                                {Math.min(currentPage * pageSize, filteredMappings.length)} of {filteredMappings.length} entries
                            </span>
                        </div>

                        <div className='flex items-center gap-1'>
                            <Button
                                variant='outline'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}>
                                <ChevronsLeft className='h-4 w-4' />
                            </Button>
                            <Button
                                variant='outline'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}>
                                <ChevronLeft className='h-4 w-4' />
                            </Button>
                            <span className='text-xs px-2'>
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant='outline'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}>
                                <ChevronRight className='h-4 w-4' />
                            </Button>
                            <Button
                                variant='outline'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}>
                                <ChevronsRight className='h-4 w-4' />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
