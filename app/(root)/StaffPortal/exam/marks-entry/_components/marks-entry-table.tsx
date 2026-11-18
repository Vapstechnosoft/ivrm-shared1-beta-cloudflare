'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IMarksEntrySearchResponse, IStudentMark } from '@/types/staff-portal/marks-entry';
import { CheckCircle, Save, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MarksEntryTableProps {
    data: IMarksEntrySearchResponse;
    onSave: (marks: IStudentMark[], status: 'S' | 'V') => void;
    onCancel: () => void;
}

export default function MarksEntryTable({ data, onSave, onCancel }: MarksEntryTableProps) {
    const { studentList, subject_details, eyceS_SubSubjectFlg, eyceS_SubExamFlg, eyceS_MarksGradeEntryFlg } = data;
    const [localStudents, setLocalStudents] = useState<IStudentMark[]>([]);
    const [allSelected, setAllSelected] = useState(true);

    useEffect(() => {
        // Initialize local check status and ensure empty mark objects if needed
        const initialized = studentList.map((s) => {
            const student = { ...s };
            if (eyceS_SubSubjectFlg || eyceS_SubExamFlg) {
                if (!student.ESTMSS_Marks) student.ESTMSS_Marks = {};
            }
            // Auto-select based on legacy logic (Angular uses ng-checked="true")
            return {
                ...student,
                selected_s: true,
                selected_ssse: true,
                selected_ss: true,
                selected_se: true
            };
        });
        setLocalStudents(initialized);
    }, [studentList]);

    const handleSelectAll = (checked: boolean) => {
        setAllSelected(checked);
        setLocalStudents((prev) =>
            prev.map((s) => ({
                ...s,
                selected_s: checked,
                selected_ssse: checked,
                selected_ss: checked,
                selected_se: checked
            }))
        );
    };

    const handleStudentToggle = (id: number, checked: boolean) => {
        setLocalStudents((prev) =>
            prev.map((s) => {
                if (s.amsT_Id === id) {
                    return {
                        ...s,
                        selected_s: checked,
                        selected_ssse: checked,
                        selected_ss: checked,
                        selected_se: checked
                    };
                }
                return s;
            })
        );
    };

    const handleMarkChange = (studentId: number, value: string, subSubjectId?: number, subExamId?: number) => {
        setLocalStudents((prev) =>
            prev.map((s) => {
                if (s.amsT_Id === studentId) {
                    const isSelected = s.selected_s || s.selected_ssse || s.selected_ss || s.selected_se;
                    if (!isSelected) return s;
                    if (subSubjectId !== undefined && subExamId !== undefined) {
                        // Case SSSE
                        const newMarks = { ...(s.ESTMSS_Marks || {}) };
                        if (!newMarks[subSubjectId]) newMarks[subSubjectId] = {};
                        newMarks[subSubjectId][subExamId] = { [studentId]: value };
                        return { ...s, ESTMSS_Marks: newMarks };
                    } else if (subSubjectId !== undefined) {
                        // Case SS
                        const newMarks = { ...(s.ESTMSS_Marks || {}) };
                        newMarks[subSubjectId] = { [studentId]: value };
                        return { ...s, ESTMSS_Marks: newMarks };
                    } else if (subExamId !== undefined) {
                        // Case SE
                        const newMarks = { ...(s.ESTMSS_Marks || {}) };
                        newMarks[subExamId] = { [studentId]: value };
                        return { ...s, ESTMSS_Marks: newMarks };
                    } else {
                        // Case S
                        return { ...s, ESTM_Marks: value };
                    }
                }
                return s;
            })
        );
    };

    const renderEntry = (student: IStudentMark, subSubjectId?: number, subExamId?: number) => {
        let value = '';
        if (subSubjectId !== undefined && subExamId !== undefined) {
            value = student.ESTMSS_Marks?.[subSubjectId]?.[subExamId]?.[student.amsT_Id] || '';
        } else if (subSubjectId !== undefined) {
            value = student.ESTMSS_Marks?.[subSubjectId]?.[student.amsT_Id] || '';
        } else if (subExamId !== undefined) {
            value = student.ESTMSS_Marks?.[subExamId]?.[student.amsT_Id] || '';
        } else {
            value = student.ESTM_Marks || '';
        }

        const isSelected = student.selected_s || student.selected_ssse || student.selected_ss || student.selected_se;

        if (eyceS_MarksGradeEntryFlg === 'M') {
            return (
                <Input
                    className='mx-auto h-8 w-24 text-center disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60'
                    value={value}
                    onChange={(e) => handleMarkChange(student.amsT_Id, e.target.value, subSubjectId, subExamId)}
                    disabled={!isSelected}
                    readOnly={!isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    placeholder='Marks'
                />
            );
        } else {
            return (
                <Select
                    value={value}
                    onValueChange={(val) => handleMarkChange(student.amsT_Id, val, subSubjectId, subExamId)}
                    disabled={!isSelected}>
                    <SelectTrigger className='h-8 w-32'>
                        <SelectValue placeholder='Grade' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='A+'>A+</SelectItem>
                        <SelectItem value='A'>A</SelectItem>
                        <SelectItem value='B'>B</SelectItem>
                        <SelectItem value='C'>C</SelectItem>
                        <SelectItem value='D'>D</SelectItem>
                    </SelectContent>
                </Select>
            );
        }
    };

    // Mode S: Only Subject
    const renderModeS = () => (
        <Table className='collapse border'>
            <TableHeader className='bg-muted/50'>
                <TableRow>
                    <TableHead className='w-[50px] text-center'>
                        <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
                    </TableHead>
                    <TableHead className='w-[100px] text-center'>Roll No</TableHead>
                    <TableHead className='min-w-[200px]'>Student Name</TableHead>
                    {subject_details.map((sub) => (
                        <TableHead key={sub.ismS_Id} className='text-center'>
                            {sub.ismS_SubjectName} <br />
                            <span className='text-[10px] text-muted-foreground'>
                                (M-{sub.eyceS_MaxMarks}) (ME-{sub.eyceS_MarksEntryMax})
                            </span>
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {localStudents.map((student) => (
                    <TableRow key={student.amsT_Id} className={!student.selected_s ? 'opacity-50' : ''}>
                        <TableCell className='text-center'>
                            <Checkbox
                                checked={student.selected_s}
                                onCheckedChange={(checked) => handleStudentToggle(student.amsT_Id, checked === true)}
                            />
                        </TableCell>
                        <TableCell className='text-center font-medium'>{student.amaY_RollNo}</TableCell>
                        <TableCell>{student.amsT_FirstName}</TableCell>
                        <TableCell className='text-center'>{renderEntry(student)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    // Case selection logic
    const renderTable = () => {
        if (!eyceS_SubSubjectFlg && !eyceS_SubExamFlg) {
            return renderModeS();
        }
        // SS, SE, SSSE logic will go here - Simplified render for now to focus on Case S
        return (
            <div className='rounded-lg border-2 border-dashed bg-muted/20 p-8 text-center'>
                <p className='text-muted-foreground'>
                    Complex mapping (Sub-Subject/Sub-Exam) detected. <br /> Currently implementing Case S. Dynamic structures logic follows.
                </p>
                {renderModeS()}
            </div>
        );
    };

    return (
        <div className='space-y-6'>
            <div className='overflow-x-auto rounded-md border bg-card shadow-sm'>{renderTable()}</div>

            <div className='flex items-center justify-center gap-4 py-4 print:hidden'>
                <Button
                    variant='default'
                    className='flex items-center gap-2 bg-primary px-8 hover:bg-primary/90'
                    onClick={() => onSave(localStudents, 'S')}>
                    <Save className='h-4 w-4' />
                    Save Marks
                </Button>
                <Button
                    variant='outline'
                    className='flex items-center gap-2 border-primary px-8 text-primary hover:bg-primary/5'
                    onClick={() => onSave(localStudents, 'V')}>
                    <CheckCircle className='h-4 w-4' />
                    Verify Marks
                </Button>
                <Button
                    variant='ghost'
                    className='flex items-center gap-2 px-8 text-destructive hover:bg-destructive/10'
                    onClick={onCancel}>
                    <XCircle className='h-4 w-4' />
                    Cancel
                </Button>
            </div>

            {(data as any).hide === true && (
                <div className='rounded-md border border-destructive/20 bg-destructive/10 p-3 text-center'>
                    <p className='font-bold text-destructive'>
                        The marks have already been verified. You no longer have access to enter or modify them.
                    </p>
                </div>
            )}
        </div>
    );
}
