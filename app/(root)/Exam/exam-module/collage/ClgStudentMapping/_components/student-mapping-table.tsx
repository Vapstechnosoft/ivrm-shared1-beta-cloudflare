'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, GraduationCap, Loader2, RotateCcw, Save, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { IGroupSubject, IStudentMappingRow } from '../types';

interface StudentMappingTableProps {
    studentRows: IStudentMappingRow[];
    subjectList: IGroupSubject[];
    saveUpdateMode: 'Save' | 'Update';
    maxApplicableSubs: number;
    minApplicableSubs: number;

    onToggleAllStudents: (checked: boolean) => void;
    onToggleStudentRow: (studentId: number, checked: boolean) => void;
    onToggleSubjectForSelectedStudents: (subjectId: number, checked: boolean) => void;
    onToggleStudentSubject: (studentId: number, subjectId: number, checked: boolean) => void;

    onSave: () => void;
    onCancel: () => void;

    isSaving: boolean;
}

export function StudentMappingTable({
    studentRows,
    subjectList,
    saveUpdateMode,
    maxApplicableSubs,
    minApplicableSubs,

    onToggleAllStudents,
    onToggleStudentRow,
    onToggleSubjectForSelectedStudents,
    onToggleStudentSubject,

    onSave,
    onCancel,

    isSaving
}: StudentMappingTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<string>('amcsT_Name');
    const [sortAsc, setSortAsc] = useState<boolean>(true);

    // Filter & Sort
    const filteredAndSortedRows = useMemo(() => {
        let list = [...studentRows];

        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter((row) => {
                const name = (row.amcsT_Name || '').toLowerCase();
                const admno = (row.amcsT_AdmNo || '').toLowerCase();
                const regno = (row.amcsT_RegistrationNo || '').toLowerCase();
                return name.includes(q) || admno.includes(q) || regno.includes(q);
            });
        }

        if (sortKey) {
            list.sort((a, b) => {
                const valA = (a as any)[sortKey] ?? '';
                const valB = (b as any)[sortKey] ?? '';

                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortAsc ? valA - valB : valB - valA;
                }
                const strA = String(valA).toLowerCase();
                const strB = String(valB).toLowerCase();
                return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
            });
        }

        return list;
    }, [studentRows, searchTerm, sortKey, sortAsc]);

    // Check if all rows are selected
    const isAllStudentsSelected = useMemo(() => {
        if (filteredAndSortedRows.length === 0) return false;
        return filteredAndSortedRows.every((r) => r.xyz);
    }, [filteredAndSortedRows]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
    };

    // Count selected students
    const selectedStudentsCount = useMemo(() => {
        return studentRows.filter((r) => r.xyz).length;
    }, [studentRows]);

    return (
        <Card className='fade-in mt-6 animate-in border-border/60 shadow-sm duration-300'>
            <CardHeader className='border-b pb-4'>
                <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
                    <div>
                        <CardTitle className='flex items-center gap-2 font-bold text-foreground text-xl tracking-tight'>
                            <GraduationCap className='h-5 w-5 text-primary' />
                            Student Subject Mapping List
                        </CardTitle>
                        <CardDescription className='mt-0.5 text-muted-foreground text-xs'>
                            Showing {filteredAndSortedRows.length} students ({selectedStudentsCount} selected for mapping)
                            {maxApplicableSubs > 0 && ` • Max Subjects: ${maxApplicableSubs}`}
                            {minApplicableSubs > 0 && ` • Min Subjects: ${minApplicableSubs}`}
                        </CardDescription>
                    </div>

                    <div className='flex w-full items-center gap-3 sm:w-auto'>
                        <div className='relative flex-1 sm:w-64'>
                            <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
                            <Input
                                placeholder='Search student name, adm no, reg no...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='h-9 pl-9 text-xs'
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='space-y-4 pt-6'>
                {/* Table Container */}
                <div className='overflow-x-auto rounded-md border bg-card shadow-inner'>
                    <Table>
                        <TableHeader>
                            <TableRow className='bg-muted/50 hover:bg-muted/50'>
                                {/* Select All Checkbox */}
                                <TableHead className='w-12 text-center'>
                                    <Checkbox
                                        checked={isAllStudentsSelected}
                                        onCheckedChange={(checked) => onToggleAllStudents(!!checked)}
                                        aria-label='Select all students'
                                    />
                                </TableHead>
                                <TableHead className='w-14 text-center font-bold text-foreground'>Sl No</TableHead>
                                <TableHead
                                    className='min-w-[180px] cursor-pointer select-none font-bold text-foreground'
                                    onClick={() => handleSort('amcsT_Name')}>
                                    <div className='flex items-center gap-1'>
                                        Student Name
                                        <ArrowUpDown className='h-3 w-3' />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className='min-w-[110px] cursor-pointer select-none font-bold text-foreground'
                                    onClick={() => handleSort('amcsT_AdmNo')}>
                                    <div className='flex items-center gap-1'>
                                        Adm.No.
                                        <ArrowUpDown className='h-3 w-3' />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className='min-w-[110px] cursor-pointer select-none font-bold text-foreground'
                                    onClick={() => handleSort('amcsT_RegistrationNo')}>
                                    <div className='flex items-center gap-1'>
                                        Reg.No.
                                        <ArrowUpDown className='h-3 w-3' />
                                    </div>
                                </TableHead>

                                {/* Dynamic Subject Columns with Header Select All */}
                                {subjectList.map((subject) => {
                                    // Check if all selected students have this subject checked
                                    const selectedStudents = studentRows.filter((r) => r.xyz);
                                    const isSubAllChecked =
                                        selectedStudents.length > 0 &&
                                        selectedStudents.every((stu) => stu.sub_list_view.some((v) => v.id === subject.ismS_Id && v.abc));

                                    return (
                                        <TableHead
                                            key={subject.ismS_Id}
                                            className='min-w-[140px] whitespace-nowrap px-3 text-center font-bold text-foreground'>
                                            <div className='flex flex-col items-center justify-center gap-1.5 py-1'>
                                                <Checkbox
                                                    checked={isSubAllChecked}
                                                    disabled={selectedStudents.length === 0}
                                                    onCheckedChange={(checked) =>
                                                        onToggleSubjectForSelectedStudents(subject.ismS_Id, !!checked)
                                                    }
                                                    aria-label={`Select all ${subject.ismS_SubjectName}`}
                                                />
                                                <span
                                                    className='max-w-[130px] truncate font-semibold text-xs'
                                                    title={subject.ismS_SubjectName}>
                                                    {subject.ismS_SubjectName}
                                                </span>
                                            </div>
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5 + subjectList.length} className='h-24 text-center text-muted-foreground text-xs'>
                                        No student records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAndSortedRows.map((user, index) => {
                                    const isRowActive = user.xyz;

                                    return (
                                        <TableRow
                                            key={user.amcsT_Id}
                                            className={`transition-colors ${
                                                isRowActive ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/30'
                                            }`}>
                                            {/* Row checkbox */}
                                            <TableCell className='text-center'>
                                                <Checkbox
                                                    checked={user.xyz}
                                                    onCheckedChange={(checked) => onToggleStudentRow(user.amcsT_Id, !!checked)}
                                                    aria-label={`Select ${user.amcsT_Name}`}
                                                />
                                            </TableCell>

                                            <TableCell className='text-center font-medium text-xs'>{index + 1}</TableCell>

                                            <TableCell className='font-semibold text-foreground text-xs'>{user.amcsT_Name}</TableCell>

                                            <TableCell className='text-muted-foreground text-xs'>{user.amcsT_AdmNo || '-'}</TableCell>

                                            <TableCell className='text-muted-foreground text-xs'>
                                                {user.amcsT_RegistrationNo || '-'}
                                            </TableCell>

                                            {/* Subject Checkboxes */}
                                            {user.sub_list_view.map((col) => (
                                                <TableCell key={col.id} className='p-2 text-center'>
                                                    <div className='flex items-center justify-center'>
                                                        <Checkbox
                                                            id={`check-${user.amcsT_Id}-${col.id}`}
                                                            checked={col.abc}
                                                            disabled={!isRowActive}
                                                            onCheckedChange={(checked) =>
                                                                onToggleStudentSubject(user.amcsT_Id, col.id, !!checked)
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Bottom Actions Bar */}
                <div className='flex flex-wrap items-center justify-center gap-3 border-t pt-4'>
                    <Button
                        type='button'
                        onClick={onSave}
                        disabled={isSaving || selectedStudentsCount === 0}
                        className='h-9 px-6 font-semibold text-xs shadow-sm'>
                        {isSaving ? (
                            <>
                                <Loader2 className='mr-2 h-3.5 w-3.5 animate-spin' />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className='mr-2 h-3.5 w-3.5' />
                                {saveUpdateMode}
                            </>
                        )}
                    </Button>

                    <Button type='button' variant='outline' onClick={onCancel} disabled={isSaving} className='h-9 px-4 font-medium text-xs'>
                        <RotateCcw className='mr-1.5 h-3.5 w-3.5' />
                        Cancel
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
