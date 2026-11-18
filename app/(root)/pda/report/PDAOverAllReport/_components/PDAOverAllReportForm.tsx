'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePDAAcademicYear, usePDAClass, usePDASection } from '@/hooks/pda/usePDACommon';
import { RotateCcw, Search } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PDAOverAllReportFormProps {
    onSubmit: (data: any) => void;
    onReset: () => void;
}

export default function PDAOverAllReportForm({ onSubmit, onReset }: PDAOverAllReportFormProps) {
    const [selectedAsmayId, setSelectedAsmayId] = useState<string>('');
    const [selectedAsmcLId, setSelectedAsmcLId] = useState<string>('');
    const [selectedAmscId, setSelectedAmscId] = useState<string>('');

    const { data: yearsRes } = usePDAAcademicYear();
    const { data: classesRes } = usePDAClass(Number(selectedAsmayId));
    const { data: sectionsRes, isLoading: loadingSections } = usePDASection(Number(selectedAsmayId), Number(selectedAsmcLId));

    const academicYearsList =
        (Array.isArray(yearsRes?.data) ? yearsRes?.data : yearsRes?.data?.data) || yearsRes?.data?.fillyear?.$values || [];
    const classesList =
        (Array.isArray(classesRes?.data) ? classesRes?.data : classesRes?.data?.data) || classesRes?.data?.classlist?.$values || [];
    const sectionsList =
        (Array.isArray(sectionsRes?.data) ? sectionsRes?.data : sectionsRes?.data?.data) || sectionsRes?.data?.fillsection?.$values || [];

    const [status, setStatus] = useState({
        active: true,
        deactive: false,
        left: false
    });

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAsmayId) {
            toast.error('Please select an Academic Year');
            return;
        }
        if (!selectedAsmcLId) {
            toast.error('Please select a Class');
            return;
        }
        if (!selectedAmscId) {
            toast.error('Please select a Section');
            return;
        }

        if (!status.active && !status.deactive && !status.left) {
            toast.error('Please select at least one status');
            return;
        }

        onSubmit({
            ASMAY_Id: Number(selectedAsmayId),
            ASMCL_Id: Number(selectedAsmcLId),
            AMSC_Id: Number(selectedAmscId),
            active: status.active ? 1 : 0,
            deactive: status.deactive ? 1 : 0,
            left: status.left ? 1 : 0
        });
    };

    return (
        <form onSubmit={handleFormSubmit} className='fade-in animate-in space-y-8 duration-500'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                <div className='space-y-2'>
                    <Label className='font-semibold text-gray-700 text-sm'>
                        Academic Year <span className='text-red-500'>*</span>
                    </Label>
                    <Select value={selectedAsmayId} onValueChange={setSelectedAsmayId}>
                        <SelectTrigger className='h-11 rounded-xl border-gray-200 bg-white/50 backdrop-blur-sm transition-all hover:border-primary'>
                            <SelectValue placeholder='Select Year' />
                        </SelectTrigger>
                        <SelectContent className='rounded-xl border-gray-100'>
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
                        <SelectTrigger className='h-11 rounded-xl border-gray-200 bg-white/50 backdrop-blur-sm transition-all hover:border-primary'>
                            <SelectValue placeholder='Select Class' />
                        </SelectTrigger>
                        <SelectContent className='rounded-xl border-gray-100'>
                            <SelectItem value='0'>All</SelectItem>
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
                        <SelectTrigger className='h-11 rounded-xl border-gray-200 bg-white/50 backdrop-blur-sm transition-all hover:border-primary'>
                            <SelectValue placeholder={loadingSections ? 'Loading...' : 'Select Section'} />
                        </SelectTrigger>
                        <SelectContent className='rounded-xl border-gray-100'>
                            <SelectItem value='0'>All</SelectItem>
                            {sectionsList.map((section: any) => (
                                <SelectItem key={section.asmS_Id} value={section.asmS_Id.toString()}>
                                    {section.asmC_SectionName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className='flex flex-wrap items-center gap-8 rounded-2xl border border-gray-100 bg-gray-50/50 p-6'>
                <div className='group flex cursor-pointer items-center space-x-3'>
                    <Checkbox
                        id='active'
                        checked={status.active}
                        onCheckedChange={(checked) => setStatus((prev) => ({ ...prev, active: checked as boolean }))}
                        className='rounded-md border-primary text-primary'
                    />
                    <Label htmlFor='active' className='cursor-pointer font-medium text-sm transition-colors group-hover:text-primary'>
                        Active
                    </Label>
                </div>
                <div className='group flex cursor-pointer items-center space-x-3'>
                    <Checkbox
                        id='deactive'
                        checked={status.deactive}
                        onCheckedChange={(checked) => setStatus((prev) => ({ ...prev, deactive: checked as boolean }))}
                        className='rounded-md border-primary text-primary'
                    />
                    <Label htmlFor='deactive' className='cursor-pointer font-medium text-sm transition-colors group-hover:text-primary'>
                        Deactive
                    </Label>
                </div>
                <div className='group flex cursor-pointer items-center space-x-3'>
                    <Checkbox
                        id='left'
                        checked={status.left}
                        onCheckedChange={(checked) => setStatus((prev) => ({ ...prev, left: checked as boolean }))}
                        className='rounded-md border-primary text-primary'
                    />
                    <Label htmlFor='left' className='cursor-pointer font-medium text-sm transition-colors group-hover:text-primary'>
                        Left
                    </Label>
                </div>
            </div>

            <div className='flex justify-center gap-4'>
                <Button
                    type='submit'
                    className='h-10 w-32 rounded-md bg-gradient-to-r from-orange-600 to-orange-700 font-bold text-white shadow-md transition-all hover:from-orange-700 hover:to-orange-800 active:scale-95'>
                    <Search className='mr-2 h-4 w-4' />
                    Report
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    onClick={onReset}
                    className='h-10 w-32 rounded-md border-gray-200 font-bold shadow-md hover:scale-105 hover:bg-gray-50 active:scale-95'>
                    <RotateCcw className='mr-2 h-5 w-5 text-gray-500' />
                    Reset
                </Button>
            </div>
        </form>
    );
}
