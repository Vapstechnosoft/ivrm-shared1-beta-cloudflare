'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IStudentInfo, IStudentTransactionSearchResponse } from '@/types/staff-portal/student-transaction-cce';
import { CheckCircle, Save, Search as SearchIcon, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ListProps {
    data: IStudentTransactionSearchResponse;
    onSave: (students: IStudentInfo[], flag: 'S' | 'V') => void;
    onCancel: () => void;
}

export default function StudentTransactionList({ data, onSave, onCancel }: ListProps) {
    const { studentList, getsaveddata, exammaster } = data;
    const [localStudents, setLocalStudents] = useState<IStudentInfo[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [checkAll, setCheckAll] = useState(true);
    const [hide, setHide] = useState(false);

    useEffect(() => {
        // Verification status check
        if (exammaster && exammaster.length > 0) {
            if ((exammaster[0].TotalMarksCount || 0) > 0) {
                setHide(true);
            }
        }

        // Initialize students with saved data
        const initialized = studentList.map((student) => {
            const saved = getsaveddata?.find((s) => s.amsT_Id === student.amsT_Id);
            if (saved) {
                return {
                    ...student,
                    checked: true,
                    ECSACTT_Score: saved.ecsactT_Score || saved.ecsT_Score || '',
                    ECSACTT_Id: saved.ecsactT_Id,
                    ECST_Id: saved.ecsT_Id,
                    areaName: saved.ecactA_Id || saved.ecsA_Id
                };
            }
            return { ...student, checked: true }; // Default checked as per Angular
        });
        setLocalStudents(initialized);
    }, [studentList, getsaveddata, exammaster]);

    const handleCheckAll = (val: boolean) => {
        setCheckAll(val);
        setLocalStudents((prev) => prev.map((s) => ({ ...s, checked: val })));
    };

    const handleStudentToggle = (id: number, val: boolean) => {
        setLocalStudents((prev) =>
            prev.map((s) => {
                if (s.amsT_Id === id) return { ...s, checked: val };
                return s;
            })
        );
    };

    const handleScoreChange = (id: number, val: string) => {
        setLocalStudents((prev) =>
            prev.map((s) => {
                if (s.amsT_Id === id) return { ...s, ECSACTT_Score: val };
                return s;
            })
        );
    };

    const filteredStudents = localStudents.filter(
        (s) =>
            s.studentName.toLowerCase().includes(searchValue.toLowerCase()) ||
            s.regNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
            s.rollNumber.toLowerCase().includes(searchValue.toLowerCase())
    );

    const scores = ['A+', 'A', 'B', 'C', 'D', 'AB'];

    return (
        <div className='space-y-4'>
            <div className='flex flex-col items-center justify-between gap-4 rounded-lg border border-primary/5 bg-muted/20 p-4 md:flex-row'>
                <div className='flex items-center gap-4'>
                    <span className='font-medium text-sm'>
                        Record Count: <span className='font-bold text-primary'>{localStudents.length}</span>
                    </span>
                    {searchValue && (
                        <span className='font-medium text-sm'>
                            Filtered: <span className='font-bold text-primary'>{filteredStudents.length}</span>
                        </span>
                    )}
                </div>
                <div className='relative w-full md:w-80'>
                    <SearchIcon className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='Search student list...'
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className='pl-10'
                    />
                </div>
            </div>

            <div className='overflow-hidden rounded-md border bg-card shadow-sm'>
                <Table>
                    <TableHeader className='bg-muted/50'>
                        <TableRow>
                            <TableHead className='w-[50px] text-center'>
                                <Checkbox checked={checkAll} onCheckedChange={(val) => handleCheckAll(val === true)} disabled={hide} />
                            </TableHead>
                            <TableHead className='w-[60px] text-center'>SL.NO.</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Reg. No.</TableHead>
                            <TableHead className='text-center'>Roll No.</TableHead>
                            <TableHead className='w-[180px] text-center'>Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student, idx) => (
                                <TableRow key={student.amsT_Id} className={!student.checked ? 'opacity-50 grayscale' : ''}>
                                    <TableCell className='text-center'>
                                        <Checkbox
                                            checked={student.checked}
                                            onCheckedChange={(val) => handleStudentToggle(student.amsT_Id, val === true)}
                                            disabled={hide}
                                        />
                                    </TableCell>
                                    <TableCell className='text-center font-medium'>{idx + 1}</TableCell>
                                    <TableCell className='font-medium text-primary/80'>{student.studentName}</TableCell>
                                    <TableCell>{student.regNumber}</TableCell>
                                    <TableCell className='text-center'>{student.rollNumber}</TableCell>
                                    <TableCell className='text-center'>
                                        <Select
                                            value={student.ECSACTT_Score || ''}
                                            onValueChange={(val) => handleScoreChange(student.amsT_Id, val)}
                                            disabled={!student.checked || hide}>
                                            <SelectTrigger className='mx-auto h-9 w-32'>
                                                <SelectValue placeholder='--Select--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {scores.map((sc) => (
                                                    <SelectItem key={sc} value={sc}>
                                                        {sc}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                                    No records found matching search criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {hide && (
                <div className='flex items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 font-semibold text-destructive'>
                    <XCircle className='h-5 w-5' />
                    Records are verified and frozen. Changes are not allowed.
                </div>
            )}

            <div className='flex justify-center gap-6 py-4'>
                <Button
                    onClick={() => onSave(localStudents, 'S')}
                    disabled={hide}
                    className='flex min-w-[140px] items-center gap-2 bg-primary px-10 hover:bg-primary/90'>
                    <Save className='h-4 w-4' />
                    Save
                </Button>
                <Button
                    variant='outline'
                    onClick={() => onSave(localStudents, 'V')}
                    disabled={hide}
                    className='flex min-w-[140px] items-center gap-2 border-primary px-10 text-primary hover:bg-primary/5'>
                    <CheckCircle className='h-4 w-4' />
                    Verify
                </Button>
                <Button variant='ghost' onClick={onCancel} className='flex min-w-[140px] items-center gap-2 px-10 hover:bg-muted'>
                    <XCircle className='h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </div>
    );
}
