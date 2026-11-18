'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Briefcase, CheckCircle2, Save, Search, User, X, XCircle } from 'lucide-react';
import { useState } from 'react';

interface NdaStaffPhotoListProps {
    staff: any[];
    onSave: (selectedStaff: any[]) => void;
    isSaving: boolean;
    onCancel: () => void;
}

export function NdaStaffPhotoList({ staff: initialStaff, onSave, isSaving, onCancel }: NdaStaffPhotoListProps) {
    const [staffList, setStaffList] = useState(
        initialStaff.map((s) => ({
            ...s,
            selected: false,
            ASTUREQ_ConformFlg: s.ASTUREQ_ConformFlg?.toString() || '1'
        }))
    );
    const [searchValue, setSearchValue] = useState('');

    const filteredStaff = staffList.filter(
        (s) =>
            s.StudentName?.toLowerCase().includes(searchValue.toLowerCase()) ||
            s.ASTUREQ_AdmNo?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const toggleAll = (checked: boolean) => {
        setStaffList(staffList.map((s) => ({ ...s, selected: checked })));
    };

    const toggleStaff = (id: number, checked: boolean) => {
        setStaffList(staffList.map((s) => (s.ASTUREQ_Id === id ? { ...s, selected: checked } : s)));
    };

    const updateStatus = (id: number, value: string) => {
        setStaffList(staffList.map((s) => (s.ASTUREQ_Id === id ? { ...s, ASTUREQ_ConformFlg: value } : s)));
    };

    const handleSave = () => {
        const selected = staffList.filter((s) => s.selected);
        onSave(selected);
    };

    const allSelected = staffList.length > 0 && staffList.every((s) => s.selected);

    const getStatusStyles = (value: string) => {
        if (value === '1') return 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500/20';
        if (value === '0') return 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-500/20';
        return '';
    };

    return (
        <div className='space-y-8'>
            {/* List Header with Search */}
            <div className='flex flex-col items-center justify-between gap-6 pb-2 md:flex-row'>
                <div className='flex items-center gap-4'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner'>
                        <Briefcase className='h-6 w-6' />
                    </div>
                    <div>
                        <h3 className='font-black text-slate-800 text-xl tracking-tight'> STAFF PHOTO APPROVALS</h3>
                        <p className='mt-1 font-bold text-[10px] text-slate-400 uppercase leading-none tracking-widest'>
                            Found {filteredStaff.length} staff records
                        </p>
                    </div>
                </div>
                <div className='group relative w-full md:w-80'>
                    <Search className='-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-slate-400 transition-colors group-hover:text-indigo-500' />
                    <Input
                        placeholder='Search employee or ID...'
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className='h-12 rounded-2xl border-slate-200 bg-white/50 pl-12 font-medium backdrop-blur-sm transition-all focus:border-indigo-500 focus:ring-indigo-500/10 group-hover:border-indigo-300'
                    />
                </div>
            </div>

            <div className='overflow-hidden rounded-[2rem] border-none bg-white/40 shadow-2xl ring-1 ring-slate-200/50 backdrop-blur-md'>
                <Table>
                    <TableHeader className='bg-slate-100/50'>
                        <TableRow className='border-slate-200/60 hover:bg-transparent'>
                            <TableHead className='w-14 text-center'>
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={toggleAll}
                                    className='rounded-md border-slate-300 data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600'
                                />
                            </TableHead>
                            <TableHead className='w-16 text-center font-bold text-[10px] text-slate-500 uppercase tracking-widest'>
                                SL.NO
                            </TableHead>
                            <TableHead className='font-bold text-[10px] text-slate-500 uppercase tracking-widest'>
                                Employee Details
                            </TableHead>
                            <TableHead className='text-center font-bold text-[10px] text-slate-500 uppercase tracking-widest'>
                                Employee Photo
                            </TableHead>
                            <TableHead className='text-center font-bold text-[10px] text-slate-500 uppercase tracking-widest'>
                                Status
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStaff.map((item, index) => (
                            <TableRow key={item.ASTUREQ_Id} className='group border-slate-100 transition-colors hover:bg-white/60'>
                                <TableCell className='text-center'>
                                    <Checkbox
                                        checked={item.selected}
                                        onCheckedChange={(checked) => toggleStaff(item.ASTUREQ_Id, !!checked)}
                                        className='rounded-md border-slate-300 data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600'
                                    />
                                </TableCell>
                                <TableCell className='text-center font-medium text-slate-400'>{index + 1}</TableCell>
                                <TableCell>
                                    <div className='space-y-1'>
                                        <p className='font-black text-slate-800 leading-none tracking-tight'>{item.StudentName}</p>
                                        <Badge
                                            variant='outline'
                                            className='rounded-lg border-indigo-100 bg-indigo-50/50 py-0.5 font-bold text-[10px] text-indigo-600 tracking-tight'>
                                            {item.ASTUREQ_AdmNo}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className='flex justify-center p-4'>
                                    <div className='relative h-40 w-40 overflow-hidden rounded-2xl shadow-lg ring-4 ring-white transition-all duration-500 group-hover:ring-indigo-100'>
                                        {item.ASTUREQ_StudentPhoto ? (
                                            <img
                                                src={item.ASTUREQ_StudentPhoto}
                                                alt={item.StudentName}
                                                className='h-full w-full transform object-cover transition-transform duration-700 hover:scale-125'
                                            />
                                        ) : (
                                            <div className='flex h-full w-full items-center justify-center bg-slate-100 text-slate-300'>
                                                <User className='h-16 w-16 opacity-50' />
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className='text-center'>
                                    <Select
                                        disabled={!item.selected}
                                        value={item.ASTUREQ_ConformFlg}
                                        onValueChange={(val) => updateStatus(item.ASTUREQ_Id, val)}>
                                        <SelectTrigger
                                            className={`mx-auto h-12 w-48 rounded-xl font-black text-xs tracking-tight transition-all duration-300 ${getStatusStyles(item.ASTUREQ_ConformFlg)}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className='overflow-hidden rounded-xl border-slate-200 font-bold shadow-2xl'>
                                            <SelectItem value='1' className='py-3 focus:bg-emerald-50 focus:text-emerald-700'>
                                                <div className='flex items-center gap-3'>
                                                    <CheckCircle2 className='h-4 w-4 text-emerald-500' />
                                                    APPROVED
                                                </div>
                                            </SelectItem>
                                            <SelectItem value='0' className='py-3 focus:bg-rose-50 focus:text-rose-700'>
                                                <div className='flex items-center gap-3'>
                                                    <XCircle className='h-4 w-4 text-rose-500' />
                                                    REJECTED
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Footer Actions */}
            <div className='flex justify-center gap-6 pt-6'>
                <Button
                    onClick={handleSave}
                    disabled={isSaving || staffList.filter((s) => s.selected).length === 0}
                    className='h-16 transform rounded-[2rem] bg-indigo-600 px-16 font-black text-lg text-white tracking-tighter shadow-2xl shadow-indigo-200 transition-all hover:scale-105 hover:bg-indigo-700 active:scale-95'>
                    {isSaving ? <Loader2 className='mr-4 h-6 w-6 animate-spin' /> : <Save className='mr-4 h-6 w-6' />}
                    APPROVE RECORDS
                </Button>
                <Button
                    variant='outline'
                    onClick={onCancel}
                    className='h-16 transform rounded-[2rem] border-2 border-slate-200 bg-white px-16 font-black text-lg text-slate-600 tracking-tighter transition-all hover:scale-105 hover:bg-slate-50 active:scale-95'>
                    <X className='mr-4 h-6 w-6' />
                    CANCEL
                </Button>
            </div>
        </div>
    );
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className={`lucide lucide-loader-2 ${props.className}`}>
            <path d='M12 2v4' />
            <path d='m16.2 7.8 2.9-2.9' />
            <path d='M18 12h4' />
            <path d='m16.2 16.2 2.9 2.9' />
            <path d='M12 18v4' />
            <path d='m4.9 19.1 2.9-2.9' />
            <path d='M2 12h4' />
            <path d='m4.9 4.9 2.9 2.9' />
        </svg>
    );
}
