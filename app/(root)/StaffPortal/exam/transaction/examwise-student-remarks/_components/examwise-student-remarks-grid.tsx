'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type {
    IExamConfig,
    IExamwiseRemarksSave,
    IStudentExamRemarks,
    ISubjectWiseRemark
} from '@/types/staff-portal/examwise-student-remarks';
import { Eye, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import SubjectWiseRemarksModal from './subject-wise-remarks-modal';

interface ExamwiseRemarksGridProps {
    studentList: IStudentExamRemarks[];
    config?: IExamConfig[];
    onSave: (data: IExamwiseRemarksSave) => Promise<void>;
    filterData: { ASMAY_Id: number; ASMCL_Id: number; ASMS_Id: number; EME_Id: number };
    onViewSubjectRemarks: (studentId: number) => Promise<{ get_viewsubjectwiseremarks: ISubjectWiseRemark[] }>;
}

export default function ExamwiseRemarksGrid({ studentList, config, onSave, filterData, onViewSubjectRemarks }: ExamwiseRemarksGridProps) {
    const [students, setStudents] = useState<IStudentExamRemarks[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectAll, setSelectAll] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalStudent, setModalStudent] = useState('');
    const [subjectRemarks, setSubjectRemarks] = useState<ISubjectWiseRemark[]>([]);

    React.useEffect(() => {
        setStudents(studentList);
    }, [studentList]);

    const handleCheckAll = (checked: boolean) => {
        setSelectAll(checked);
        setStudents(students.map((s) => ({ ...s, checked: checked })));
    };

    const handleCheck = (index: number, checked: boolean) => {
        const newStudents = [...students];
        newStudents[index].checked = checked;
        setStudents(newStudents);
        setSelectAll(newStudents.every((s) => s.checked));
    };

    const handleRemarkChange = (index: number, val: string) => {
        const newStudents = [...students];
        newStudents[index].remarks = val;
        setStudents(newStudents);
    };

    const handleViewSubjectRemarks = async (student: IStudentExamRemarks) => {
        try {
            const res = await onViewSubjectRemarks(student.amsT_Id);
            setSubjectRemarks(res.get_viewsubjectwiseremarks || []);
            setModalStudent(student.studentname);
            setModalOpen(true);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async () => {
        const selected = students.filter((s) => s.checked);
        if (selected.length === 0) {
            toast.error('Please Select Check Box & Then Enter Remarks');
            return;
        }

        // Validate remarks
        for (const s of selected) {
            if (!s.remarks || s.remarks.trim() === '') {
                toast.error(`Enter remarks for ${s.studentname}`);
                return;
            }
        }

        setIsSaving(true);
        try {
            await onSave({
                ...filterData,
                Temp_studentdata_Remarks: selected.map((s) => ({
                    AMST_Id: s.amsT_Id,
                    EMER_Remarks: s.remarks || ''
                }))
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Columns config
    const showAdmNo = config?.[0]?.exmConfig_AdmnoColumnDisplay ?? true;
    const showRollNo = config?.[0]?.exmConfig_RollnoColumnDisplay ?? true;
    const showRegNo = config?.[0]?.exmConfig_RegnoColumnDisplay ?? false;

    // Sort order based on config
    const sortType = config?.[0]?.exmConfig_Recordsearchtype || 'Name';

    const filteredStudents = students
        .filter(
            (s) =>
                s.studentname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.amsT_AdmNo.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortType === 'AdmNo') return a.amsT_AdmNo.localeCompare(b.amsT_AdmNo);
            if (sortType === 'RollNo') return (a.amaY_RollNo || 0) - (b.amaY_RollNo || 0);
            if (sortType === 'RegNo') return a.amsT_RegistrationNo.localeCompare(b.amsT_RegistrationNo);
            return a.studentname.localeCompare(b.studentname);
        });

    return (
        <Card>
            <CardHeader>
                <div className='flex items-center justify-between'>
                    <CardTitle>Student List</CardTitle>
                    <div className='w-1/3'>
                        <Input placeholder='Search here...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className='overflow-x-auto rounded-md border'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[50px] text-center'>
                                    <Checkbox checked={selectAll} onCheckedChange={(c) => handleCheckAll(c as boolean)} />
                                </TableHead>
                                <TableHead className='w-[50px]'>SL.NO.</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Marks</TableHead>
                                <TableHead>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.map((s, i) => (
                                <TableRow key={s.amsT_Id}>
                                    <TableCell className='text-center'>
                                        <Checkbox checked={s.checked} onCheckedChange={(c) => handleCheck(i, c as boolean)} />
                                    </TableCell>
                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell>
                                        <div className='flex flex-col gap-1'>
                                            <div className='flex font-bold'>
                                                <span className='w-20'>Name</span>: {s.studentname}
                                            </div>
                                            {showAdmNo && (
                                                <div className='flex text-xs'>
                                                    <span className='w-20'>Adm.No.</span>: {s.amsT_AdmNo}
                                                </div>
                                            )}
                                            {showRegNo && (
                                                <div className='flex text-xs'>
                                                    <span className='w-20'>Reg.No.</span>: {s.amsT_RegistrationNo}
                                                </div>
                                            )}
                                            {showRollNo && (
                                                <div className='flex text-xs'>
                                                    <span className='w-20'>Roll.No.</span>: {s.amaY_RollNo}
                                                </div>
                                            )}

                                            {s.flag === 1 && (
                                                <Button
                                                    size='sm'
                                                    variant='link'
                                                    className='h-auto justify-start p-0 text-blue-600'
                                                    onClick={() => handleViewSubjectRemarks(s)}>
                                                    <Eye className='mr-1 h-3 w-3' /> View Subject Wise Remarks
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className='space-y-1 text-xs'>
                                            <div className='flex'>
                                                <span className='w-24 font-bold'>Obtained Marks</span>: {s.obtainedmarks}
                                            </div>
                                            <div className='flex'>
                                                <span className='w-24 font-bold'>Max Marks</span>: {s.totalmaxmarks}
                                            </div>
                                            <div className='flex'>
                                                <span className='w-24 font-bold'>Percentage</span>: {s.percentage}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Textarea
                                            value={s.remarks || ''}
                                            onChange={(e) => handleRemarkChange(i, e.target.value)}
                                            disabled={!s.checked}
                                            placeholder='Enter Remarks'
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className='mt-4 flex justify-center'>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <i className='fa fa-floppy-o mr-2' />}
                        Save
                    </Button>
                </div>

                <SubjectWiseRemarksModal
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    studentName={modalStudent}
                    remarksList={subjectRemarks}
                />
            </CardContent>
        </Card>
    );
}
