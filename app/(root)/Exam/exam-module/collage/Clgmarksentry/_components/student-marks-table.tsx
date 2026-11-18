'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { AlertCircle, GraduationCap, Loader2, RotateCcw, Save, Search, UserCheck, UserX, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { IExamConfiguration, IStudentMarksRecord } from '../types';

interface StudentMarksTableProps {
    students: IStudentMarksRecord[];
    subMorGFlag?: 'M' | 'G' | string;
    gradname?: string[];
    configuration?: IExamConfiguration[];
    isSaving: boolean;
    onUpdateMarks: (updatedStudents: IStudentMarksRecord[]) => void;
    onSave: () => void;
    onCancel: () => void;
}

export function StudentMarksTable({
    students,
    subMorGFlag = 'M',
    gradname = [],
    configuration = [],
    isSaving,
    onUpdateMarks,
    onSave,
    onCancel
}: StudentMarksTableProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Determine column visibility from configuration
    const config = configuration && configuration.length > 0 ? configuration[0] : null;
    const showAdmNo = config ? config.exmConfig_AdmnoColumnDisplay !== false : true;
    const showRegNo = config ? config.exmConfig_RegnoColumnDisplay === true : false;
    const showRollNo = config ? config.exmConfig_RollnoColumnDisplay !== false : true;

    // Filter students by local search query
    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;
        const q = searchQuery.toLowerCase();
        return students.filter(
            (st) =>
                st.studentname?.toLowerCase().includes(q) ||
                st.amcsT_AdmNo?.toLowerCase().includes(q) ||
                st.amcsT_RegistrationNo?.toLowerCase().includes(q) ||
                String(st.acysT_RollNo || '')
                    .toLowerCase()
                    .includes(q)
        );
    }, [students, searchQuery]);

    // Summary statistics
    const stats = useMemo(() => {
        const total = students.length;
        let absentCount = 0;
        let leaveCount = 0;
        let medicalCount = 0;
        let enteredCount = 0;

        for (const s of students) {
            const val = String(s.obtainmarks || '')
                .trim()
                .toUpperCase();
            if (val === 'AB') absentCount++;
            else if (val === 'L') leaveCount++;
            else if (val === 'M') medicalCount++;
            else if (val !== '' && val !== '0') enteredCount++;
        }

        return {
            total,
            absentCount,
            leaveCount,
            medicalCount,
            enteredCount,
            presentCount: total - absentCount - leaveCount - medicalCount
        };
    }, [students]);

    /**
     * Validate and change marks according to the original angular validation rules
     */
    const handleMarksChange = (originalIndex: number, rawValue: string) => {
        const student = students[originalIndex];
        if (!student) return;

        const updatedList = [...students];
        const val = rawValue.trim();

        if (val === '') {
            updatedList[originalIndex] = { ...student, obtainmarks: '' };
            onUpdateMarks(updatedList);
            return;
        }

        const maxMarks = Number(student.marksEnterFor ?? student.totalMarks ?? 100);

        if (subMorGFlag === 'G') {
            // Grade validation
            let isValid = false;
            const normalizedVal = val.toUpperCase();

            // Check against valid grade master names
            if (gradname && Array.isArray(gradname)) {
                if (gradname.some((g) => g.trim().toUpperCase() === normalizedVal)) {
                    isValid = true;
                }
            }

            // Special attendance flags
            if (['AB', 'L', 'M'].includes(normalizedVal)) {
                isValid = true;
            }

            if (!isValid) {
                toast.warning('Entered Grade cannot be out of master setting!');
                updatedList[originalIndex] = { ...student, obtainmarks: 0 };
            } else {
                updatedList[originalIndex] = { ...student, obtainmarks: normalizedVal };
            }
        } else {
            // Marks validation
            const upperVal = val.toUpperCase();

            // Check if string characters are special attendance flags
            if (/[A-Z]/i.test(val)) {
                if (['AB', 'L', 'M'].includes(upperVal)) {
                    updatedList[originalIndex] = { ...student, obtainmarks: upperVal };
                } else {
                    toast.warning('Entered value cannot be out of master setting (use numbers or AB, L, M)!');
                    updatedList[originalIndex] = { ...student, obtainmarks: 0 };
                }
            } else {
                // Numeric validation
                const numVal = Number.parseFloat(val);
                if (Number.isNaN(numVal)) {
                    toast.warning('Please enter a valid numeric mark!');
                    updatedList[originalIndex] = { ...student, obtainmarks: 0 };
                } else if (numVal > maxMarks) {
                    toast.warning(`Entered marks (${numVal}) cannot be more than Marks Enter For (${maxMarks})!`);
                    updatedList[originalIndex] = { ...student, obtainmarks: 0 };
                } else if (numVal < 0) {
                    toast.warning('Entered marks cannot be in negative values!');
                    updatedList[originalIndex] = { ...student, obtainmarks: 0 };
                } else {
                    updatedList[originalIndex] = { ...student, obtainmarks: numVal };
                }
            }
        }

        onUpdateMarks(updatedList);
    };

    /**
     * Quick action to set all students marks or status
     */
    const handleQuickAction = (status: 'AB' | 'L' | 'M' | 'CLEAR') => {
        const updatedList = students.map((s) => ({
            ...s,
            obtainmarks: status === 'CLEAR' ? 0 : status
        }));
        onUpdateMarks(updatedList);
        toast.info(status === 'CLEAR' ? 'Cleared all marks' : `Marked all students as ${status}`);
    };

    return (
        <Card className='border bg-card shadow-sm'>
            <CardHeader className='border-b bg-muted/20 pb-4'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex items-center space-x-2'>
                        <div className='rounded-lg bg-primary/10 p-2 text-primary'>
                            <GraduationCap className='h-4 w-4' />
                        </div>
                        <div>
                            <CardTitle className='flex items-center gap-2 font-semibold text-base'>
                                <span>Student Marks Entry Grid</span>
                                <Badge variant='outline' className='font-normal text-xs'>
                                    {subMorGFlag === 'G' ? 'Grading Mode' : 'Marks Entry Mode'}
                                </Badge>
                            </CardTitle>
                            <CardDescription className='text-xs'>
                                Enter student marks or status codes (AB = Absent, L = Leave, M = Medical)
                            </CardDescription>
                        </div>
                    </div>

                    {/* Stats summary */}
                    <div className='flex flex-wrap items-center gap-2 text-xs'>
                        <Badge variant='secondary' className='bg-muted text-foreground'>
                            <Users className='mr-1 h-3 w-3 text-primary' />
                            Total: {stats.total}
                        </Badge>
                        <Badge variant='secondary' className='border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400'>
                            <UserCheck className='mr-1 h-3 w-3' />
                            Present: {stats.presentCount}
                        </Badge>
                        {stats.absentCount > 0 && (
                            <Badge variant='secondary' className='border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400'>
                                <UserX className='mr-1 h-3 w-3' />
                                Absent: {stats.absentCount}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Subheader Toolbar */}
                <div className='mt-2 flex flex-col justify-between gap-3 border-t pt-3 sm:flex-row sm:items-center'>
                    <div className='relative w-full sm:w-72'>
                        <Search className='absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground' />
                        <Input
                            placeholder='Filter loaded students...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='h-8 pl-8 text-xs'
                        />
                    </div>

                    {/* Quick shortcuts */}
                    <div className='flex flex-wrap items-center gap-1.5'>
                        <span className='mr-1 text-[11px] text-muted-foreground'>Quick Fill:</span>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => handleQuickAction('AB')}
                            className='h-7 px-2 text-xs hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50'>
                            All Absent
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => handleQuickAction('CLEAR')}
                            className='h-7 px-2 text-muted-foreground text-xs'>
                            Reset to 0
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className='p-0'>
                <div className='max-h-[600px] overflow-x-auto'>
                    <Table className='border-collapse'>
                        <TableHeader className='sticky top-0 z-10 bg-muted/50'>
                            <TableRow className='hover:bg-transparent'>
                                <TableHead className='w-[60px] text-center font-semibold text-xs'>Sl No</TableHead>
                                <TableHead className='min-w-[200px] text-left font-semibold text-xs'>Student Name</TableHead>
                                {showAdmNo && <TableHead className='w-[120px] text-center font-semibold text-xs'>Adm. No</TableHead>}
                                {showRegNo && <TableHead className='w-[130px] text-center font-semibold text-xs'>Reg. No</TableHead>}
                                {showRollNo && <TableHead className='w-[100px] text-center font-semibold text-xs'>Roll No</TableHead>}
                                <TableHead className='w-[100px] text-center font-semibold text-xs'>Max Marks</TableHead>
                                <TableHead className='w-[100px] text-center font-semibold text-xs'>Min Marks</TableHead>
                                <TableHead className='w-[120px] text-center font-semibold text-xs'>Marks Enter For</TableHead>
                                <TableHead className='w-[150px] text-center font-semibold text-primary text-xs'>
                                    Marks Obtained <span className='text-destructive'>*</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className='h-32 text-center text-muted-foreground text-xs'>
                                        <div className='flex flex-col items-center justify-center space-y-1'>
                                            <AlertCircle className='h-5 w-5 text-muted-foreground/60' />
                                            <p>No student records matching current filters</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((student, displayIdx) => {
                                    // Find original index in master array
                                    const origIdx = students.findIndex((s) => s === student);
                                    const valStr = String(student.obtainmarks ?? '0')
                                        .trim()
                                        .toUpperCase();
                                    const isSpecialStatus = ['AB', 'L', 'M'].includes(valStr);

                                    return (
                                        <TableRow
                                            key={student.amcsT_Id || student.amsT_Id || origIdx}
                                            className={cn(
                                                'text-xs transition-colors',
                                                isSpecialStatus && 'bg-amber-50/40 dark:bg-amber-950/20'
                                            )}>
                                            <TableCell className='text-center font-medium text-muted-foreground'>
                                                {displayIdx + 1}
                                            </TableCell>
                                            <TableCell className='py-2.5 text-left font-medium text-foreground'>
                                                {student.studentname}
                                            </TableCell>
                                            {showAdmNo && (
                                                <TableCell className='text-center text-muted-foreground'>
                                                    {student.amcsT_AdmNo || '--'}
                                                </TableCell>
                                            )}
                                            {showRegNo && (
                                                <TableCell className='text-center text-muted-foreground'>
                                                    {student.amcsT_RegistrationNo || '--'}
                                                </TableCell>
                                            )}
                                            {showRollNo && (
                                                <TableCell className='text-center text-muted-foreground'>
                                                    {student.acysT_RollNo || '--'}
                                                </TableCell>
                                            )}
                                            <TableCell className='text-center text-muted-foreground'>
                                                {student.totalMarks ?? '--'}
                                            </TableCell>
                                            <TableCell className='text-center text-muted-foreground'>{student.minMarks ?? '--'}</TableCell>
                                            <TableCell className='text-center font-medium text-foreground'>
                                                {student.marksEnterFor ?? student.totalMarks ?? '--'}
                                            </TableCell>
                                            <TableCell className='p-1.5 text-center'>
                                                <div className='flex items-center justify-center space-x-1.5'>
                                                    <Input
                                                        type='text'
                                                        value={student.obtainmarks ?? '0'}
                                                        onChange={(e) => {
                                                            const updated = [...students];
                                                            updated[origIdx] = {
                                                                ...student,
                                                                obtainmarks: e.target.value
                                                            };
                                                            onUpdateMarks(updated);
                                                        }}
                                                        onBlur={(e) => handleMarksChange(origIdx, e.target.value)}
                                                        onFocus={() => setFocusedIndex(origIdx)}
                                                        className={cn(
                                                            'h-8 max-w-[90px] border-input text-center font-semibold text-xs focus:ring-1 focus:ring-primary',
                                                            valStr === 'AB' &&
                                                                'border-red-300 bg-red-50/60 font-bold text-red-600 dark:bg-red-950/40',
                                                            valStr === 'L' &&
                                                                'border-amber-300 bg-amber-50/60 font-bold text-amber-600 dark:bg-amber-950/40',
                                                            valStr === 'M' &&
                                                                'border-blue-300 bg-blue-50/60 font-bold text-blue-600 dark:bg-blue-950/40'
                                                        )}
                                                    />
                                                    {isSpecialStatus && (
                                                        <Badge variant='outline' className='h-5 px-1 py-0 font-bold text-[10px] uppercase'>
                                                            {valStr}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer with Actions */}
                <div className='flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 p-4'>
                    <p className='text-muted-foreground text-xs'>
                        Showing <span className='font-semibold text-foreground'>{filteredStudents.length}</span> of{' '}
                        <span className='font-semibold text-foreground'>{students.length}</span> students
                    </p>

                    <div className='flex items-center space-x-3'>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={onCancel}
                            disabled={isSaving}
                            className='min-w-[100px] text-xs'>
                            <RotateCcw className='mr-1.5 h-3.5 w-3.5' />
                            Cancel
                        </Button>

                        <Button
                            type='button'
                            size='sm'
                            onClick={onSave}
                            disabled={isSaving || students.length === 0}
                            className='min-w-[120px] bg-primary text-xs shadow-sm hover:bg-primary/90'>
                            {isSaving ? (
                                <>
                                    <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className='mr-1.5 h-3.5 w-3.5' />
                                    Save Marks
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
