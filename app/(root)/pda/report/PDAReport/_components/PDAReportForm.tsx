'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePDAAcademicYear, usePDAClass, usePDASection, usePDAStudent } from '@/hooks/pda/usePDACommon';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, FileText, RotateCcw } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PDAReportFormProps {
    onSubmit: (data: any) => void;
    onReset: () => void;
}

export default function PDAReportForm({ onSubmit, onReset }: PDAReportFormProps) {
    const [type, setType] = useState<'Ind' | 'All'>('Ind');
    const [selectedAsmayId, setSelectedAsmayId] = useState<string>('');
    const [selectedAsmcLId, setSelectedAsmcLId] = useState<string>('');
    const [selectedAmscId, setSelectedAmscId] = useState<string>('');
    const [selectedAmstId, setSelectedAmstId] = useState<string>('');

    const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
    const [toDate, setToDate] = useState<Date | undefined>(undefined);

    const [options, setOptions] = useState({
        detailed: false,
        stored: false,
        format1: false
    });

    const { data: yearsRes } = usePDAAcademicYear();
    const { data: classesRes } = usePDAClass(Number(selectedAsmayId));
    const { data: sectionsRes, isLoading: loadingSections } = usePDASection(Number(selectedAsmayId), Number(selectedAsmcLId));
    const { data: studentsRes, isLoading: loadingStudents } = usePDAStudent(
        Number(selectedAsmayId),
        Number(selectedAsmcLId),
        Number(selectedAmscId)
    );

    const academicYearsList =
        (Array.isArray(yearsRes?.data) ? yearsRes?.data : yearsRes?.data?.data) || yearsRes?.data?.fillyear?.$values || [];
    const classesList =
        (Array.isArray(classesRes?.data) ? classesRes?.data : classesRes?.data?.data) || classesRes?.data?.classlist?.$values || [];
    const sectionsList =
        (Array.isArray(sectionsRes?.data) ? sectionsRes?.data : sectionsRes?.data?.data) || sectionsRes?.data?.fillsection?.$values || [];
    const studentsList =
        (Array.isArray(studentsRes?.data) ? studentsRes?.data : studentsRes?.data?.data) || studentsRes?.data?.fillstudent?.$values || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAsmayId || !selectedAsmcLId || !selectedAmscId || !fromDate || !toDate) {
            toast.error('Please fill all required fields');
            return;
        }

        if (type === 'Ind' && !selectedAmstId) {
            toast.error('Please select a student');
            return;
        }

        onSubmit({
            ASMAY_Id: Number(selectedAsmayId),
            ASMCL_Id: Number(selectedAsmcLId),
            AMSC_Id: Number(selectedAmscId),
            AMST_Id: type === 'Ind' ? Number(selectedAmstId) : 0,
            From_Date: format(fromDate, 'yyyy-MM-dd'),
            To_Date: format(toDate, 'yyyy-MM-dd'),
            type: type,
            studentdata: options.detailed ? 1 : 0,
            refundamt: options.stored || options.format1 ? 1 : 0,
            format1: options.format1
        });
    };

    return (
        <form onSubmit={handleSubmit} className='fade-in animate-in space-y-8 duration-500'>
            <div className='flex justify-center rounded-2xl border border-gray-100 bg-gray-50/50 p-4'>
                <RadioGroup value={type} onValueChange={(val) => setType(val as 'Ind' | 'All')} className='flex gap-8'>
                    <div className='group flex cursor-pointer items-center space-x-2'>
                        <RadioGroupItem value='Ind' id='ind' className='border-primary text-primary' />
                        <Label htmlFor='ind' className='cursor-pointer font-semibold transition-colors group-hover:text-primary'>
                            Individual
                        </Label>
                    </div>
                    <div className='group flex cursor-pointer items-center space-x-2'>
                        <RadioGroupItem value='All' id='all' className='border-primary text-primary' />
                        <Label htmlFor='all' className='cursor-pointer font-semibold transition-colors group-hover:text-primary'>
                            All
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                <div className='space-y-2'>
                    <Label className='font-semibold text-gray-700 text-sm'>
                        Academic Year <span className='text-red-500'>*</span>
                    </Label>
                    <Select value={selectedAsmayId} onValueChange={setSelectedAsmayId}>
                        <SelectTrigger className='h-11 rounded-xl border-gray-200 bg-white shadow-sm transition-all hover:border-primary'>
                            <SelectValue placeholder='Select Year' />
                        </SelectTrigger>
                        <SelectContent className='rounded-xl border-gray-100 shadow-2xl'>
                            {academicYearsList.map((year: any) => (
                                <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                    {year.asmaY_Year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className='space-y-2'>
                    <Label className='font-semibold text-gray-700 text-sm'>
                        Class <span className='text-red-500'>*</span>
                    </Label>
                    <Select value={selectedAsmcLId} onValueChange={setSelectedAsmcLId}>
                        <SelectTrigger className='h-11 rounded-xl border-gray-200 bg-white shadow-sm transition-all hover:border-primary'>
                            <SelectValue placeholder='Select Class' />
                        </SelectTrigger>
                        <SelectContent className='rounded-xl border-gray-100'>
                            {classesList.map((cls: any) => (
                                <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                    {cls.asmcL_ClassName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className='space-y-2'>
                    <Label className='font-semibold text-gray-700 text-sm'>
                        Section <span className='text-red-500'>*</span>
                    </Label>
                    <Select value={selectedAmscId} onValueChange={setSelectedAmscId} disabled={loadingSections || !selectedAsmcLId}>
                        <SelectTrigger className='h-11 rounded-xl border-gray-200 bg-white shadow-sm transition-all hover:border-primary'>
                            <SelectValue placeholder={loadingSections ? 'Loading...' : 'Select Section'} />
                        </SelectTrigger>
                        <SelectContent className='rounded-xl border-gray-100'>
                            {sectionsList.map((s: any) => (
                                <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                    {s.asmC_SectionName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {type === 'Ind' && (
                    <div className='col-span-full space-y-2'>
                        <Label className='font-semibold text-gray-700 text-sm'>
                            Student Name <span className='text-red-500'>*</span>
                        </Label>
                        <Select value={selectedAmstId} onValueChange={setSelectedAmstId} disabled={loadingStudents || !selectedAmscId}>
                            <SelectTrigger className='h-11 rounded-xl border-gray-200 bg-white shadow-sm transition-all hover:border-primary'>
                                <SelectValue placeholder={loadingStudents ? 'Loading students...' : 'Search or select student...'} />
                            </SelectTrigger>
                            <SelectContent className='rounded-xl border-gray-100'>
                                {studentsList.map((s: any) => (
                                    <SelectItem key={s.amsT_Id} value={s.amsT_Id.toString()}>
                                        {s.amsT_FirstName} {s.amsT_MiddleName || ''} {s.amsT_LastName || ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className='space-y-2'>
                    <Label className='font-semibold text-gray-700 text-sm'>
                        From Date <span className='text-red-500'>*</span>
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={'outline'}
                                className={cn(
                                    'h-11 w-full justify-start rounded-xl border-gray-200 bg-white text-left font-normal shadow-sm transition-all hover:border-primary',
                                    !fromDate && 'text-muted-foreground'
                                )}>
                                <CalendarIcon className='mr-2 h-4 w-4 text-primary' />
                                {fromDate ? format(fromDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto rounded-xl p-0' align='start'>
                            <Calendar mode='single' selected={fromDate} onSelect={setFromDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className='space-y-2'>
                    <Label className='font-semibold text-gray-700 text-sm'>
                        To Date <span className='text-red-500'>*</span>
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={'outline'}
                                className={cn(
                                    'h-11 w-full justify-start rounded-xl border-gray-200 bg-white text-left font-normal shadow-sm transition-all hover:border-primary',
                                    !toDate && 'text-muted-foreground'
                                )}>
                                <CalendarIcon className='mr-2 h-4 w-4 text-primary' />
                                {toDate ? format(toDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto rounded-xl p-0' align='start'>
                            <Calendar mode='single' selected={toDate} onSelect={setToDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className='flex flex-wrap justify-center gap-8 rounded-2xl border border-indigo-100/50 bg-indigo-50/30 p-6'>
                <div className='group flex cursor-pointer items-center space-x-3'>
                    <Checkbox
                        id='detailed'
                        checked={options.detailed}
                        onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, detailed: !!checked }))}
                        className='rounded-md border-primary text-primary'
                    />
                    <Label htmlFor='detailed' className='cursor-pointer font-semibold text-sm transition-colors group-hover:text-primary'>
                        Detailed
                    </Label>
                </div>
                <div className='group flex cursor-pointer items-center space-x-3'>
                    <Checkbox
                        id='stored'
                        checked={options.stored}
                        onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, stored: !!checked }))}
                        className='rounded-md border-primary text-primary'
                    />
                    <Label htmlFor='stored' className='cursor-pointer font-semibold text-sm transition-colors group-hover:text-primary'>
                        Stored Transaction
                    </Label>
                </div>
                <div className='group flex cursor-pointer items-center space-x-3'>
                    <Checkbox
                        id='format1'
                        checked={options.format1}
                        onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, format1: !!checked }))}
                        className='rounded-md border-primary text-primary'
                    />
                    <Label htmlFor='format1' className='cursor-pointer font-semibold text-sm transition-colors group-hover:text-primary'>
                        Format-1
                    </Label>
                </div>
            </div>

            <div className='flex justify-center gap-4'>
                <Button
                    type='submit'
                    className='h-10 w-32 rounded-md bg-gradient-to-r from-orange-600 to-orange-700 font-bold text-white shadow-md transition-all hover:from-orange-700 hover:to-orange-800 active:scale-95'>
                    <FileText className='mr-2 h-5 w-5' />
                    Report
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    onClick={onReset}
                    className='h-10 w-32 rounded-md border-gray-200 font-bold shadow-md hover:scale-105 hover:bg-gray-50 active:scale-95'>
                    <RotateCcw className='mr-2 h-5 w-5 text-gray-500' />
                    Cancel
                </Button>
            </div>
        </form>
    );
}
