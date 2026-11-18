'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, Save, Search, User, Users, X, XCircle } from 'lucide-react';
import { useState } from 'react';

interface NdaStudentPhotoListProps {
    students: any[];
    onSave: (selectedStudents: any[]) => void;
    isSaving: boolean;
    onCancel: () => void;
}

export function NdaStudentPhotoList({ students: initialStudents, onSave, isSaving, onCancel }: NdaStudentPhotoListProps) {
    const [students, setStudents] = useState(
        initialStudents.map((s) => ({
            ...s,
            selected: false,
            // Ensure strings for select compatibility
            ASTUREQ_ConformFlg: s.ASTUREQ_ConformFlg?.toString() || '1',
            ASTUREQ_ConformFlgF: s.ASTUREQ_ConformFlgF?.toString() || '1',
            ASTUREQ_ConformFlgM: s.ASTUREQ_ConformFlgM?.toString() || '1',
            ASTUREQ_ConformFlgG: s.ASTUREQ_ConformFlgG?.toString() || '1',
            ASTUREQ_ConformFlgPickupOne: s.ASTUREQ_ConformFlgPickupOne?.toString() || '1',
            ASTUREQ_ConformFlgPickupTwo: s.ASTUREQ_ConformFlgPickupTwo?.toString() || '1'
        }))
    );
    const [searchValue, setSearchValue] = useState('');

    const filteredStudents = students.filter(
        (s) =>
            s.StudentName?.toLowerCase().includes(searchValue.toLowerCase()) ||
            s.ASTUREQ_AdmNo?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const toggleAll = (checked: boolean) => {
        setStudents(students.map((s) => ({ ...s, selected: checked })));
    };

    const toggleStudent = (id: number, checked: boolean) => {
        setStudents(students.map((s) => (s.ASTUREQ_Id === id ? { ...s, selected: checked } : s)));
    };

    const updateStatus = (id: number, field: string, value: string) => {
        setStudents(students.map((s) => (s.ASTUREQ_Id === id ? { ...s, [field]: value } : s)));
    };

    const handleSave = () => {
        const selected = students.filter((s) => s.selected);
        onSave(selected);
    };

    const allSelected = students.length > 0 && students.every((s) => s.selected);

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
                        <Users className='h-6 w-6' />
                    </div>
                    <div>
                        <h3 className='font-black text-slate-800 text-xl tracking-tight'>PENDING APPROVALS</h3>
                        <p className='mt-1 font-bold text-[10px] text-slate-400 uppercase leading-none tracking-widest'>
                            Found {filteredStudents.length} students matching criteria
                        </p>
                    </div>
                </div>
                <div className='group relative w-full md:w-80'>
                    <Search className='-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-slate-400 transition-colors group-hover:text-indigo-500' />
                    <Input
                        placeholder='Search student or admission no...'
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
                                Student Details
                            </TableHead>
                            <TableHead className='text-center font-bold text-[10px] text-slate-500 uppercase tracking-widest'>
                                Student Photo
                            </TableHead>
                            <TableHead className='text-center font-bold text-[10px] text-slate-500 uppercase tracking-widest'>
                                Father Photo
                            </TableHead>
                            <TableHead className='text-center font-bold text-[10px] text-slate-500 uppercase tracking-widest'>
                                Mother Photo
                            </TableHead>
                            <TableHead className='text-center font-bold text-[10px] text-slate-500 uppercase tracking-widest'>
                                Guardian Photo
                            </TableHead>
                            <TableHead className='text-center font-bold text-[10px] text-slate-500 uppercase tracking-widest'>
                                Pickup 1 Photo
                            </TableHead>
                            <TableHead className='text-center font-bold text-[10px] text-slate-500 uppercase tracking-widest'>
                                Pickup 2 Photo
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.map((student, index) => (
                            <TableRow key={student.ASTUREQ_Id} className='group border-slate-100 transition-colors hover:bg-white/60'>
                                <TableCell className='text-center'>
                                    <Checkbox
                                        checked={student.selected}
                                        onCheckedChange={(checked) => toggleStudent(student.ASTUREQ_Id, !!checked)}
                                        className='rounded-md border-slate-300 data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600'
                                    />
                                </TableCell>
                                <TableCell className='text-center font-medium text-slate-400'>{index + 1}</TableCell>
                                <TableCell>
                                    <div className='space-y-1'>
                                        <p className='font-black text-slate-800 leading-none tracking-tight'>{student.StudentName}</p>
                                        <Badge
                                            variant='outline'
                                            className='rounded-lg border-indigo-100 bg-indigo-50/50 py-0.5 font-bold text-[10px] text-indigo-600 tracking-tight'>
                                            {student.ASTUREQ_AdmNo}
                                        </Badge>
                                    </div>
                                </TableCell>
                                {[
                                    { img: student.ASTUREQ_StudentPhoto, flag: 'ASTUREQ_ConformFlg', label: 'STUDENT' },
                                    { img: student.ASTUREQ_FatherPhoto, flag: 'ASTUREQ_ConformFlgF', label: 'FATHER' },
                                    { img: student.ASTUREQ_MotherPhoto, flag: 'ASTUREQ_ConformFlgM', label: 'MOTHER' },
                                    { img: student.ASTUREQ_GuardianPhoto, flag: 'ASTUREQ_ConformFlgG', label: 'GUARDIAN' },
                                    { img: student.ASTUREQ_PickupOnePhoto, flag: 'ASTUREQ_ConformFlgPickupOne', label: 'PICKUP 1' },
                                    { img: student.ASTUREQ_PickupTwoPhoto, flag: 'ASTUREQ_ConformFlgPickupTwo', label: 'PICKUP 2' }
                                ].map((item, i) => (
                                    <TableCell key={i} className='p-4'>
                                        <div className='flex flex-col items-center gap-4'>
                                            <div className='relative h-32 w-32 overflow-hidden rounded-2xl shadow-lg ring-4 ring-white transition-all duration-500 group-hover:ring-indigo-100'>
                                                {item.img ? (
                                                    <img
                                                        src={item.img}
                                                        alt={item.label}
                                                        className='h-full w-full transform object-cover transition-transform duration-700 hover:scale-125'
                                                    />
                                                ) : (
                                                    <div className='flex h-full w-full items-center justify-center bg-slate-100 text-slate-300'>
                                                        <User className='h-12 w-12 opacity-50' />
                                                    </div>
                                                )}
                                                <div className='absolute top-2 left-2 rounded-lg bg-black/30 px-2 py-0.5 font-black text-[8px] text-white uppercase tracking-[0.2em] backdrop-blur-md'>
                                                    {item.label}
                                                </div>
                                            </div>
                                            <Select
                                                disabled={!student.selected}
                                                value={student[item.flag]}
                                                onValueChange={(val) => updateStatus(student.ASTUREQ_Id, item.flag, val)}>
                                                <SelectTrigger
                                                    className={`h-10 w-32 rounded-xl font-black text-xs tracking-tight transition-all duration-300 ${getStatusStyles(student[item.flag])}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className='overflow-hidden rounded-xl border-slate-200 font-bold shadow-2xl'>
                                                    <SelectItem value='1' className='py-2.5 focus:bg-emerald-50 focus:text-emerald-700'>
                                                        <div className='flex items-center gap-2'>
                                                            <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
                                                            APPROVED
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value='0' className='py-2.5 focus:bg-rose-50 focus:text-rose-700'>
                                                        <div className='flex items-center gap-2'>
                                                            <XCircle className='h-3.5 w-3.5 text-rose-500' />
                                                            REJECTED
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Footer Actions */}
            <div className='flex justify-center gap-6 pt-6'>
                <Button
                    onClick={handleSave}
                    disabled={isSaving || students.filter((s) => s.selected).length === 0}
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
