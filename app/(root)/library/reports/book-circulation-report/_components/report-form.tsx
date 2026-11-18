'use client';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { IBookCirculationReportRequest } from '@/types/library/reports/book-circulation-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { FileSpreadsheet, LayoutGrid, Loader2, Printer, Search, X } from 'lucide-react';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

const reportFormSchema = z
    .object({
        LMAL_Id: z.coerce.number().min(1, 'Library is required'),
        AGType: z.enum(['Student', 'Staff', 'Guest', 'Department', 'all']),
        Type: z.string(),
        TrnType: z.string(),
        Issuecount: z.boolean().optional(),
        IssueFromDate: z.date().optional(),
        IssueToDate: z.date().optional(),
        Duecount: z.boolean().optional(),
        DueFromdate: z.date().optional(),
        DueTodate: z.date().optional(),
        selectedClasslist: z.array(z.object({ asmcL_Id: z.number() })).optional(),
        selectedSectionlist: z.array(z.object({ asmS_Id: z.number() })).optional()
    })
    .refine(
        (data) => {
            if (data.Issuecount) {
                return !!data.IssueFromDate && !!data.IssueToDate;
            }
            return true;
        },
        {
            message: 'Select Search date',
            path: ['IssueToDate']
        }
    )
    .refine(
        (data) => {
            if (data.Duecount) {
                return !!data.DueFromdate && !!data.DueTodate;
            }
            return true;
        },
        {
            message: 'Select Search date',
            path: ['DueTodate']
        }
    )
    .refine(
        (data) => {
            if (data.AGType === 'Student') {
                const hasClasses = data.selectedClasslist && data.selectedClasslist.length > 0;
                const hasSections = data.selectedSectionlist && data.selectedSectionlist.length > 0;
                return hasClasses && hasSections;
            }
            return true;
        },
        {
            message: 'Select Class and Section',
            path: ['selectedClasslist']
        }
    );

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
    onSearch: (data: IBookCirculationReportRequest) => void;
    isLoading: boolean;
    onPrint: () => void;
    onExport: () => void;
    hasData: boolean;
    initialData: any;
    onCancel?: () => void;
}

export const ReportForm = ({ onSearch, isLoading, onPrint, onExport, hasData, initialData: initialDataProp, onCancel }: ReportFormProps) => {
    const initialData = (initialDataProp as any)?.data || initialDataProp;

    // Local state for multi-select to handle UI before sync with form
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [selectedSections, setSelectedSections] = useState<number[]>([]);
    const [resetKey, setResetKey] = useState(0);
    const isInitializedRef = React.useRef(false);

    const [classSearch, setClassSearch] = useState('');
    const [sectionSearch, setSectionSearch] = useState('');

    const sectionList: any[] = React.useMemo(() => {
        if (!initialData?.sectionList) return [];
        return initialData.sectionList.map((sec: any, index: number) => {
            // 1. Try to find the section name by checking standard keys
            let name =
                sec.asmC_SectionName ||
                sec.asmc_SectionName ||
                sec.asmS_SectionName ||
                sec.asms_SectionName ||
                sec.asmc_sectionname ||
                sec.asms_sectionname ||
                sec.ASMC_SECTIONNAME ||
                sec.ASMS_SECTIONNAME ||
                sec.ASMC_SectionName ||
                sec.ASMS_SectionName ||
                sec.sectionName ||
                sec.SectionName ||
                sec.sectionname ||
                sec.SECTIONNAME ||
                sec.SECTION_NAME ||
                sec.ASMC_SECTION_NAME ||
                sec.MC_SECTIONNAME ||
                '';

            // 2. Dynamic fallback: Scan all keys for anything containing "section" or "sec"
            if (!name || name.trim() === '') {
                for (const key in sec) {
                    const lowerKey = key.toLowerCase();
                    if (
                        (lowerKey.includes('section') || lowerKey.includes('sec')) &&
                        !lowerKey.includes('id') &&
                        sec[key] &&
                        typeof sec[key] === 'string' &&
                        sec[key].trim() !== ''
                    ) {
                        name = sec[key];
                        break;
                    }
                }
            }

            // 3. Last fallback: Alphabet index
            if (!name || name.trim() === '') {
                const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
                name = alphabet[index % alphabet.length] || `Section ${index + 1}`;
            }

            return {
                ...sec,
                asmC_SectionName: name
            };
        });
    }, [initialData?.sectionList]);

    const libList: any[] = React.useMemo(() => {
        const raw =
            initialData?.lib_list ??
            initialData?.msterliblist1 ??
            initialData?.msterliblist ??
            initialData?.libraryList ??
            initialData?.libList ??
            initialData?.library_list ??
            [];
        const list = Array.isArray(raw) ? raw : (raw?.data || raw?.$values || []);
        return (Array.isArray(list) ? list : [])
            .map((lib: any) => {
                const id = Number(lib?.lmaL_Id ?? lib?.LMAL_Id ?? lib?.lmal_Id ?? lib?.lmal_id ?? lib?.id ?? 0);
                const name = String(
                    lib?.lmaL_LibraryName ??
                        lib?.LMAL_LibraryName ??
                        lib?.lmal_LibraryName ??
                        lib?.libraryName ??
                        lib?.libraryname ??
                        lib?.name ??
                        ''
                );
                return {
                    ...lib,
                    lmaL_Id: id,
                    lmaL_LibraryName: name || `Library ${id}`
                };
            })
            .filter((l: any) => l.lmaL_Id > 0);
    }, [initialData]);

    const defaultLibId = libList.length > 0 ? libList[0].lmaL_Id : undefined;

    const {
        handleSubmit,
        setValue,
        control,
        reset,
        watch,
        formState: { errors, isSubmitted }
    } = useForm<ReportFormValues>({
        resolver: zodResolver(reportFormSchema),
        defaultValues: {
            LMAL_Id: defaultLibId,
            AGType: 'Student',
            Type: 'all',
            TrnType: 'all',
            Issuecount: false,
            Duecount: false,
            selectedClasslist: [],
            selectedSectionlist: []
        }
    });

    const agType = useWatch({ control, name: 'AGType' });
    const issueCount = useWatch({ control, name: 'Issuecount' });
    const dueCount = useWatch({ control, name: 'Duecount' });
    const issueFromDate = useWatch({ control, name: 'IssueFromDate' });
    const dueFromDate = useWatch({ control, name: 'DueFromdate' });

    // Initialize library, checkboxes on initial load
    useEffect(() => {
        if (!isInitializedRef.current && (libList.length > 0 || initialData?.classList?.length || sectionList?.length)) {
            if (libList.length > 0) {
                setValue('LMAL_Id', libList[0].lmaL_Id, { shouldValidate: false });
            }
            if (initialData?.classList && initialData.classList.length > 0) {
                const allClassIds: number[] = initialData.classList.map((c: any) => c.asmcL_Id);
                setSelectedClasses(allClassIds);
                setValue(
                    'selectedClasslist',
                    allClassIds.map((id: number) => ({ asmcL_Id: id }))
                );
            }
            if (sectionList && sectionList.length > 0) {
                const allSectionIds: number[] = sectionList.map((s: any) => s.asmS_Id);
                setSelectedSections(allSectionIds);
                setValue(
                    'selectedSectionlist',
                    allSectionIds.map((id: number) => ({ asmS_Id: id }))
                );
            }
            isInitializedRef.current = true;
        }
    }, [initialData, libList, sectionList, setValue]);

    const handleClassToggle = (id: number) => {
        let newSelected = [...selectedClasses];
        if (newSelected.includes(id)) {
            newSelected = newSelected.filter((i) => i !== id);
        } else {
            newSelected.push(id);
        }
        setSelectedClasses(newSelected);
        setValue(
            'selectedClasslist',
            newSelected.map((i: number) => ({ asmcL_Id: i }))
        );
    };

    const handleAllClassesToggle = (checked: boolean) => {
        if (checked && initialData?.classList) {
            const allIds: number[] = initialData.classList.map((c: any) => c.asmcL_Id);
            setSelectedClasses(allIds);
            setValue(
                'selectedClasslist',
                allIds.map((i: number) => ({ asmcL_Id: i }))
            );
        } else {
            setSelectedClasses([]);
            setValue('selectedClasslist', []);
        }
    };

    const handleSectionToggle = (id: number) => {
        let newSelected = [...selectedSections];
        if (newSelected.includes(id)) {
            newSelected = newSelected.filter((i) => i !== id);
        } else {
            newSelected.push(id);
        }
        setSelectedSections(newSelected);
        setValue(
            'selectedSectionlist',
            newSelected.map((i: number) => ({ asmS_Id: i }))
        );
    };

    const handleAllSectionsToggle = (checked: boolean) => {
        if (checked && sectionList) {
            const allIds: number[] = sectionList.map((s: any) => s.asmS_Id);
            setSelectedSections(allIds);
            setValue(
                'selectedSectionlist',
                allIds.map((i: number) => ({ asmS_Id: i }))
            );
        } else {
            setSelectedSections([]);
            setValue('selectedSectionlist', []);
        }
    };

    const onSubmit = (data: ReportFormValues) => {
        const requestData: IBookCirculationReportRequest = {
            ...data,
            LMAL_Id: Number(data.LMAL_Id),
            IssueFromDate: data.IssueFromDate ? format(data.IssueFromDate, 'yyyy-MM-dd') : undefined,
            IssueToDate: data.IssueToDate ? format(data.IssueToDate, 'yyyy-MM-dd') : undefined,
            DueFromdate: data.DueFromdate ? format(data.DueFromdate, 'yyyy-MM-dd') : undefined,
            DueTodate: data.DueTodate ? format(data.DueTodate, 'yyyy-MM-dd') : undefined,
            selectedClasslist: data.selectedClasslist || [],
            selectedSectionlist: data.selectedSectionlist || []
        };
        onSearch(requestData);
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className='mx-auto max-w-6xl space-y-5 rounded-xl border border-slate-200 bg-white p-7 shadow-sm'>
            {/* Header Row: Library Name and Member Type */}
            <div className='grid grid-cols-1 items-center gap-6 border-slate-100 border-b pb-4 md:grid-cols-2'>
                <div className='flex items-center gap-3'>
                    <Label className='min-w-[130px] text-right font-bold text-slate-700 text-xs uppercase tracking-wider'>
                        Library Name:<span className='text-red-500'>*</span>
                    </Label>
                    <div className='flex-1'>
                        <Select
                            key={`lib-select-${resetKey}`}
                            value={watch('LMAL_Id') ? String(watch('LMAL_Id')) : ''}
                            onValueChange={(v) => setValue('LMAL_Id', v ? Number(v) : (undefined as any), { shouldValidate: true })}>
                            <SelectTrigger className='h-9 w-full border-slate-200 text-xs focus:ring-1 focus:ring-[#4255a7]'>
                                <SelectValue placeholder='Select Library' />
                            </SelectTrigger>
                            <SelectContent>
                                {libList.map((lib: any) => (
                                    <SelectItem key={String(lib.lmaL_Id)} value={String(lib.lmaL_Id)} className='text-xs'>
                                        {lib.lmaL_LibraryName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isSubmitted && errors.LMAL_Id && <p className='mt-1 text-red-500 text-xs'>{errors.LMAL_Id.message}</p>}
                    </div>
                </div>

                <div className='flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm'>
                    <RadioGroup
                        value={agType}
                        onValueChange={(v) => setValue('AGType', v as any)}
                        className='flex flex-wrap justify-center gap-6'>
                        {['Student', 'Staff', 'Guest', 'Department'].map((type) => (
                            <div key={type} className='flex items-center space-x-2'>
                                <RadioGroupItem value={type} id={`r-${type}`} className='h-4 w-4 border-slate-400 text-[#4255a7]' />
                                <Label
                                    htmlFor={`r-${type}`}
                                    className='cursor-pointer font-semibold text-slate-700 text-xs uppercase tracking-wide'>
                                    {type}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Left Column: Book Type, Status */}
                <div className='space-y-4'>
                    {/* BOOK TYPE Box */}
                    <div className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
                        <div className='border-slate-100 border-b bg-white py-2 text-center'>
                            <Label className='font-bold text-slate-700 text-xs uppercase tracking-wider'>BOOK TYPE</Label>
                        </div>
                        <div className='p-4'>
                            <RadioGroup
                                value={watch('Type')}
                                onValueChange={(v) => setValue('Type', v)}
                                className='grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-3'>
                                {[
                                    { id: 'all', label: 'ALL' },
                                    { id: 'Issue', label: 'Issue' },
                                    { id: 'Reference', label: 'Reference' },
                                    { id: 'Issuable', label: 'Issuable' },
                                    { id: 'NotIssuable', label: 'Not Issuable' },
                                    { id: 'ReferenceonlyIssuable', label: 'Ref Iss' },
                                    { id: 'ReferenceonlyNon-Issuable', label: 'Ref Non-Iss' }
                                ].map((bt) => (
                                    <div key={bt.id} className='group flex cursor-pointer items-center space-x-2'>
                                        <RadioGroupItem value={bt.id} id={`bt-${bt.id}`} className='h-4 w-4 border-slate-400' />
                                        <Label
                                            htmlFor={`bt-${bt.id}`}
                                            className='cursor-pointer whitespace-nowrap font-medium text-slate-700 text-xs transition-colors group-hover:text-[#4255a7]'>
                                            {bt.label}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>

                    {/* TRANSACTION STATUS Box */}
                    <div className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
                        <div className='border-slate-100 border-b bg-white py-2 text-center'>
                            <Label className='font-bold text-slate-700 text-xs uppercase tracking-wider'>TRANSACTION STATUS</Label>
                        </div>
                        <div className='p-4'>
                            <RadioGroup
                                value={watch('TrnType')}
                                onValueChange={(v) => setValue('TrnType', v)}
                                className='flex items-center justify-around'>
                                {['ALL', 'Issue', 'Return'].map((status) => (
                                    <div key={status} className='group flex cursor-pointer items-center space-x-2'>
                                        <RadioGroupItem
                                            value={status === 'ALL' ? 'all' : status}
                                            id={`t-${status}`}
                                            className='h-4 w-4 border-slate-400'
                                        />
                                        <Label
                                            htmlFor={`t-${status}`}
                                            className='cursor-pointer font-semibold text-slate-700 text-xs uppercase tracking-wider transition-colors group-hover:text-[#4255a7]'>
                                            {status}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                </div>

                {/* Right Column: Selection Boxes (Class, Section) & Date Filters */}
                <div className='space-y-4'>
                    {agType === 'Student' && (
                        <div className='space-y-1'>
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                {/* Class Selection */}
                                <div className='flex h-[200px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
                                    <div className='flex items-center justify-center gap-1.5 border-slate-100 border-b bg-white py-2 text-center'>
                                        <Label className='font-bold text-slate-700 text-xs uppercase tracking-wider'>Class Name</Label>
                                        <span className='text-red-500 text-xs'>*</span>
                                    </div>
                                    <div className='flex items-center gap-2 border-slate-100 border-b bg-slate-50/50 px-2.5 py-1.5'>
                                        <Search className='h-3.5 w-3.5 text-slate-400' />
                                        <input
                                            type='text'
                                            placeholder='search here...'
                                            className='w-full border-none bg-transparent px-1 text-xs focus:outline-none'
                                            value={classSearch}
                                            onChange={(e) => setClassSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className='scrollbar-thin scrollbar-thumb-slate-200 flex-1 overflow-y-auto'>
                                        <div className='sticky top-0 z-10 flex items-center space-x-2 border-slate-100 border-b bg-slate-100/90 px-3 py-1.5'>
                                            <Checkbox
                                                id='cls-all'
                                                checked={
                                                    (initialData?.classList?.length || 0) > 0 &&
                                                    initialData?.classList?.length === selectedClasses.length
                                                }
                                                onCheckedChange={(checked) => handleAllClassesToggle(checked as boolean)}
                                                className='h-4 w-4 border-slate-400'
                                            />
                                            <Label
                                                htmlFor='cls-all'
                                                className='cursor-pointer font-bold text-slate-800 text-xs uppercase tracking-tight'>
                                                All
                                            </Label>
                                        </div>
                                        <div className='px-3 py-1'>
                                            {initialData?.classList
                                                ?.filter((c: any) => {
                                                    const name = (c.asmcL_ClassName || (c as any).ASMCL_CLASSNAME || '')
                                                        .toString()
                                                        .toLowerCase();
                                                    return name.includes(classSearch.toLowerCase());
                                                })
                                                .map((cls: any) => {
                                                    const classId =
                                                        cls.asmcL_Id ||
                                                        (cls as any).ASMCL_ID ||
                                                        (cls as any).asmcL_ID ||
                                                        (cls as any).asmcl_id ||
                                                        (cls as any).asmcL_id ||
                                                        (cls as any).asmcL_ClassId ||
                                                        (cls as any).asmcL_ClassID ||
                                                        (cls as any).id;
                                                    const className =
                                                        cls.asmcL_ClassName || (cls as any).ASMCL_CLASSNAME || (cls as any).className || '';
                                                    return (
                                                        <div
                                                            key={classId}
                                                            className='flex items-center space-x-2 py-1 transition-colors hover:bg-slate-50'>
                                                            <Checkbox
                                                                id={`cls-${classId}`}
                                                                checked={selectedClasses.includes(classId)}
                                                                onCheckedChange={() => handleClassToggle(classId)}
                                                                className='h-3.5 w-3.5 border-slate-400'
                                                            />
                                                            <Label
                                                                htmlFor={`cls-${classId}`}
                                                                className='cursor-pointer truncate font-medium text-slate-700 text-xs'>
                                                                {className}
                                                            </Label>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                </div>

                                {/* Section Selection */}
                                <div className='flex h-[200px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
                                    <div className='flex items-center justify-center gap-1.5 border-slate-100 border-b bg-white py-2 text-center'>
                                        <Label className='font-bold text-slate-700 text-xs uppercase tracking-wider'>Section Name</Label>
                                        <span className='text-red-500 text-xs'>*</span>
                                    </div>
                                    <div className='flex items-center gap-2 border-slate-100 border-b bg-slate-50/50 px-2.5 py-1.5'>
                                        <Search className='h-3.5 w-3.5 text-slate-400' />
                                        <input
                                            type='text'
                                            placeholder='search here...'
                                            className='w-full border-none bg-transparent px-1 text-xs focus:outline-none'
                                            value={sectionSearch}
                                            onChange={(e) => setSectionSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className='scrollbar-thin scrollbar-thumb-slate-200 flex-1 overflow-y-auto'>
                                        <div className='sticky top-0 z-10 flex items-center space-x-2 border-slate-100 border-b bg-slate-100/90 px-3 py-1.5'>
                                            <Checkbox
                                                id='sec-all'
                                                checked={(sectionList?.length || 0) > 0 && sectionList?.length === selectedSections.length}
                                                onCheckedChange={(checked) => handleAllSectionsToggle(checked as boolean)}
                                                className='h-4 w-4 border-slate-400'
                                            />
                                            <Label
                                                htmlFor='sec-all'
                                                className='cursor-pointer font-bold text-slate-800 text-xs uppercase tracking-tight'>
                                                All
                                            </Label>
                                        </div>
                                        <div className='px-3 py-1'>
                                            {sectionList
                                                ?.filter((s: any) => {
                                                    const name = (s.asmC_SectionName || '').toString().toLowerCase();
                                                    return name.includes(sectionSearch.toLowerCase());
                                                })
                                                .map((sec: any) => {
                                                    const sectionId =
                                                        (sec as any).asmS_Id ||
                                                        (sec as any).ASMS_ID ||
                                                        (sec as any).asmS_ID ||
                                                        (sec as any).asms_id ||
                                                        (sec as any).asmS_id ||
                                                        (sec as any).asmC_Id ||
                                                        (sec as any).asmc_id ||
                                                        (sec as any).asmC_ID ||
                                                        (sec as any).ASMC_ID ||
                                                        (sec as any).id;
                                                    const sectionName = sec.asmC_SectionName || '';
                                                    return (
                                                        <div
                                                            key={sectionId}
                                                            className='flex items-center space-x-2 py-1 transition-colors hover:bg-slate-50'>
                                                            <Checkbox
                                                                id={`sec-${sectionId}`}
                                                                checked={selectedSections.includes(sectionId)}
                                                                onCheckedChange={() => handleSectionToggle(sectionId)}
                                                                className='h-3.5 w-3.5 border-slate-400'
                                                            />
                                                            <Label
                                                                htmlFor={`sec-${sectionId}`}
                                                                className='cursor-pointer truncate font-medium text-slate-700 text-xs'>
                                                                {sectionName}
                                                            </Label>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {isSubmitted && errors.selectedClasslist && (
                                <p className='mt-1 font-semibold text-red-500 text-xs'>{errors.selectedClasslist.message}</p>
                            )}
                        </div>
                    )}

                    {/* Date Filters Row */}
                    <div className='grid grid-cols-1 gap-4 pt-1 lg:grid-cols-2'>
                        <div className='space-y-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm'>
                            <div className='flex items-center gap-2'>
                                <Checkbox
                                    id='issue-count'
                                    checked={issueCount}
                                    onCheckedChange={(c) => {
                                        setValue('Issuecount', c as boolean, { shouldValidate: true });
                                        if (!c) {
                                            setValue('IssueFromDate', undefined, { shouldValidate: true });
                                            setValue('IssueToDate', undefined, { shouldValidate: true });
                                        }
                                    }}
                                    className='h-4 w-4'
                                />
                                <Label
                                    htmlFor='issue-count'
                                    className='cursor-pointer font-bold text-slate-700 text-xs uppercase tracking-wider'>
                                    Issue Date
                                </Label>
                            </div>
                            <div className='flex items-center gap-1.5'>
                                <CalendarDatePicker
                                    date={issueFromDate}
                                    setDate={(d) => setValue('IssueFromDate', d, { shouldValidate: true })}
                                    placeholder='From'
                                    disabled={!issueCount}
                                    align='start'
                                />
                                <span className='shrink-0 font-bold text-[11px] text-slate-400'>AND</span>
                                <CalendarDatePicker
                                    date={watch('IssueToDate')}
                                    setDate={(d) => setValue('IssueToDate', d, { shouldValidate: true })}
                                    placeholder='To'
                                    minDate={issueFromDate}
                                    disabled={!issueCount}
                                    align='end'
                                />
                            </div>
                            {isSubmitted && errors.IssueToDate && <p className='mt-1 font-semibold text-red-500 text-xs'>{errors.IssueToDate.message}</p>}
                        </div>

                        <div className='space-y-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm'>
                            <div className='flex items-center gap-2'>
                                <Checkbox
                                    id='due-count'
                                    checked={dueCount}
                                    onCheckedChange={(c) => {
                                        setValue('Duecount', c as boolean, { shouldValidate: true });
                                        if (!c) {
                                            setValue('DueFromdate', undefined, { shouldValidate: true });
                                            setValue('DueTodate', undefined, { shouldValidate: true });
                                        }
                                    }}
                                    className='h-4 w-4'
                                />
                                <Label
                                    htmlFor='due-count'
                                    className='cursor-pointer font-bold text-slate-700 text-xs uppercase tracking-wider'>
                                    Due Date
                                </Label>
                            </div>
                            <div className='flex items-center gap-1.5'>
                                <CalendarDatePicker
                                    date={dueFromDate}
                                    setDate={(d) => setValue('DueFromdate', d, { shouldValidate: true })}
                                    placeholder='From'
                                    disabled={!dueCount}
                                    align='start'
                                />
                                <span className='shrink-0 font-bold text-[11px] text-slate-400'>AND</span>
                                <CalendarDatePicker
                                    date={watch('DueTodate')}
                                    setDate={(d) => setValue('DueTodate', d, { shouldValidate: true })}
                                    placeholder='To'
                                    minDate={dueFromDate}
                                    disabled={!dueCount}
                                    align='end'
                                />
                            </div>
                            {isSubmitted && errors.DueTodate && <p className='mt-1 font-semibold text-red-500 text-xs'>{errors.DueTodate.message}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons - Centered Row */}
            <div className='mt-4 flex flex-row flex-wrap items-center justify-center gap-4 border-slate-100 border-t pt-4'>
                <Button
                    type='submit'
                    disabled={isLoading}
                    className='h-9 w-32 rounded-md bg-[#4251b1] font-semibold text-white text-xs uppercase tracking-wider shadow-sm hover:bg-[#35418e]'>
                    {isLoading ? <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' /> : <LayoutGrid className='mr-1.5 h-3.5 w-3.5' />}
                    REPORT
                </Button>

                <Button
                    type='button'
                    className='h-9 w-32 rounded-md bg-[#ff5a30] font-semibold text-white text-xs uppercase tracking-wider shadow-sm hover:bg-[#e64d26]'
                    onClick={() => {
                        reset({
                            LMAL_Id: undefined,
                            AGType: 'Student',
                            Type: 'all',
                            TrnType: 'all',
                            Issuecount: false,
                            IssueFromDate: undefined,
                            IssueToDate: undefined,
                            Duecount: false,
                            DueFromdate: undefined,
                            DueTodate: undefined,
                            selectedClasslist: [],
                            selectedSectionlist: []
                        });
                        setSelectedClasses([]);
                        setSelectedSections([]);
                        setClassSearch('');
                        setSectionSearch('');
                        setResetKey((prev) => prev + 1);
                        onCancel?.();
                    }}>
                    <X className='mr-1.5 h-3.5 w-3.5' />
                    CANCEL
                </Button>

                {hasData && (
                    <>
                        <Button
                            type='button'
                            onClick={onPrint}
                            className='h-9 w-32 rounded-md bg-[#4251b1] font-semibold text-white text-xs uppercase tracking-wider shadow-sm hover:bg-[#35418e]'>
                            <Printer className='mr-1.5 h-3.5 w-3.5' />
                            PRINT
                        </Button>

                        <Button
                            type='button'
                            onClick={onExport}
                            className='h-9 w-36 rounded-md bg-[#4251b1] font-semibold text-white text-xs uppercase tracking-wider shadow-sm hover:bg-[#35418e]'>
                            <FileSpreadsheet className='mr-1.5 h-3.5 w-3.5' />
                            EXPORT TO EXCEL
                        </Button>
                    </>
                )}
            </div>
        </form>
    );
};

function CalendarDatePicker({
    date,
    setDate,
    placeholder,
    minDate,
    disabled,
    align = 'start',
    className
}: {
    date?: Date;
    setDate: (d?: Date) => void;
    placeholder: string;
    minDate?: Date;
    disabled?: boolean;
    align?: 'start' | 'center' | 'end';
    className?: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                        'h-8 min-w-0 flex-1 justify-start px-2 text-left font-normal text-xs',
                        !date && 'text-muted-foreground',
                        className
                    )}
                    disabled={disabled}>
                    <CalendarIcon className='mr-1.5 h-3.5 w-3.5 shrink-0 text-slate-500' />
                    <span className='truncate'>{date ? format(date, 'dd/MM/yyyy') : placeholder}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align={align}>
                <Calendar
                    mode='single'
                    selected={date}
                    onSelect={(d) => {
                        setDate(d);
                        setOpen(false);
                    }}
                    initialFocus
                    disabled={(date) => (minDate ? date < minDate : false)}
                />
            </PopoverContent>
        </Popover>
    );
}
