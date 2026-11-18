'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { FileEdit, Loader2, Save, Search, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface NdaStudentTcListProps {
    students: any[];
    onSave: (selectedStudents: any[]) => void;
    isSaving: boolean;
}

const REMARKS_OPTIONS = [
    'Promoted to Nursery',
    'Promoted to Preparatory',
    'Promoted to Junior',
    'Promoted to Class I',
    'Promoted to Class II',
    'Promoted to Class III',
    'Promoted to Class IV',
    'Promoted to Class V',
    'Promoted to Class VI',
    'Promoted to Class VII',
    'Promoted to Class VIII',
    'Promoted to Class IX',
    'Promoted to Class X',
    'Not Promoted',
    'Other'
];

const CONDUCT_OPTIONS = ['Good', 'Very Good', 'Excellent', 'Satisfactory', 'Average'];
const PROMOTION_OPTIONS = ['Yes', 'No', 'N/A'];

export function NdaStudentTcList({ students, onSave, isSaving }: NdaStudentTcListProps) {
    const [studentList, setStudentList] = useState<any[]>(
        students.map((s) => ({
            ...s,
            selected: false,
            astc_Remarks: s.astc_Remarks || '',
            ASTC_TCApplicationDate: null,
            ASTC_TCDate: null
        }))
    );

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<any>(null);
    const [allRemarks, setAllRemarks] = useState('');

    const handleToggle = (id: number) => {
        setStudentList((prev) =>
            prev.map((s) => {
                if (s.AMST_Id === id) {
                    const selected = !s.selected;
                    return {
                        ...s,
                        selected,
                        ASTC_TCApplicationDate: selected ? new Date() : null,
                        ASTC_TCDate: selected ? new Date() : null,
                        astc_Remarks: selected ? s.astc_Remarks : ''
                    };
                }
                return s;
            })
        );
    };

    const handleToggleAll = (checked: boolean) => {
        setStudentList((prev) =>
            prev.map((s) => ({
                ...s,
                selected: checked,
                ASTC_TCApplicationDate: checked ? new Date() : null,
                ASTC_TCDate: checked ? new Date() : null,
                astc_Remarks: checked ? s.astc_Remarks : ''
            }))
        );
    };

    const handleApplyRemarksToAll = (val: string) => {
        setAllRemarks(val);
        if (!val) return;

        setStudentList((prev) =>
            prev.map((s) => {
                if (s.selected) {
                    return { ...s, astc_Remarks: val };
                }
                return s;
            })
        );
    };

    const handleIndividualRemarkChange = (id: number, val: string) => {
        setStudentList((prev) =>
            prev.map((s) => {
                if (s.AMST_Id === id) {
                    return { ...s, astc_Remarks: val };
                }
                return s;
            })
        );
    };

    const openEditModal = (student: any) => {
        setEditingStudent({ ...student });
        setIsModalOpen(true);
    };

    const saveDetails = () => {
        if (!editingStudent) return;
        setStudentList((prev) => prev.map((s) => (s.AMST_Id === editingStudent.AMST_Id ? editingStudent : s)));
        setIsModalOpen(false);
        toast.success(`TC details updated for ${editingStudent.StudentName}`);
    };

    const handleSave = () => {
        const selected = studentList.filter((s) => s.selected);
        if (selected.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        const missingRemarks = selected.filter((s) => !s.astc_Remarks || s.astc_Remarks === '');
        if (missingRemarks.length > 0) {
            toast.error(`Please fill details for ${missingRemarks.length} selected students (Remarks are mandatory)`);
            return;
        }

        onSave(selected);
    };

    const isAnySelected = studentList.some((s) => s.selected);
    const allSelected = studentList.length > 0 && studentList.every((s) => s.selected);

    const filteredStudents = studentList.filter(
        (s) =>
            s.StudentName.toLowerCase().includes(searchTerm.toLowerCase()) || s.AMST_AdmNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='fade-in slide-in-from-top-4 animate-in space-y-6 duration-500'>
            {/* Search & Bulk Actions */}
            <div className='flex flex-col items-end justify-between gap-6 rounded-[2rem] border border-slate-200/60 bg-slate-50/80 p-8 shadow-inner backdrop-blur-sm md:flex-row'>
                <div className='w-full space-y-2 md:w-1/2'>
                    <label className='px-1 font-black text-slate-500 text-xs uppercase tracking-widest'>Search Database</label>
                    <div className='group relative'>
                        <Search className='-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-indigo-500' />
                        <Input
                            placeholder='Filter by name, admission ID...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='h-14 rounded-2xl border-slate-200 bg-white pl-12 font-medium text-sm shadow-sm transition-all focus:ring-4 focus:ring-indigo-100'
                        />
                    </div>
                </div>

                <div className='w-full space-y-2 md:w-1/3'>
                    <label className='px-1 font-black text-red-500 text-xs uppercase tracking-widest'>Remarks for All Selected</label>
                    <Select value={allRemarks} onValueChange={handleApplyRemarksToAll} disabled={!isAnySelected}>
                        <SelectTrigger className='h-14 rounded-2xl border-slate-200 bg-white font-bold shadow-sm transition-all focus:ring-4 focus:ring-indigo-100'>
                            <SelectValue placeholder='-- Select --' />
                        </SelectTrigger>
                        <SelectContent className='rounded-2xl'>
                            {REMARKS_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Grid */}
            <div className='overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/40'>
                <div className='overflow-x-auto'>
                    <Table>
                        <TableHeader className='h-20 bg-slate-50/50'>
                            <TableRow className='border-slate-100 border-b font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]'>
                                <TableHead className='w-20 text-center'>SL.NO</TableHead>
                                <TableHead className='w-20 px-0 text-center'>
                                    <div className='flex h-full items-center justify-center'>
                                        <Checkbox
                                            checked={allSelected}
                                            onCheckedChange={(checked) => handleToggleAll(!!checked)}
                                            className='h-6 w-6 rounded-lg border-2 border-slate-300 data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600'
                                        />
                                    </div>
                                </TableHead>
                                <TableHead>Student Identity</TableHead>
                                <TableHead>Class & Section</TableHead>
                                <TableHead className='w-64'>Remarks</TableHead>
                                <TableHead className='w-32 text-center'>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.map((student, idx) => (
                                <TableRow
                                    key={student.AMST_Id}
                                    className={cn(
                                        'group h-24 border-slate-50 border-b transition-all duration-300',
                                        student.selected ? 'bg-indigo-50/40' : 'hover:bg-slate-50/30'
                                    )}>
                                    <TableCell className='text-center font-bold font-mono text-lg text-slate-300 tracking-tighter'>
                                        {idx + 1}
                                    </TableCell>
                                    <TableCell className='text-center'>
                                        <div className='flex items-center justify-center'>
                                            <Checkbox
                                                checked={student.selected}
                                                onCheckedChange={() => handleToggle(student.AMST_Id)}
                                                className='h-6 w-6 rounded-lg border-2 border-slate-300 shadow-sm data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600'
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className='flex flex-col'>
                                            <span className='font-black text-base text-slate-800 leading-tight tracking-tight'>
                                                {student.StudentName}
                                            </span>
                                            <span className='mt-1 font-black text-[10px] text-indigo-500 uppercase tracking-wider'>
                                                ID: {student.AMST_AdmNo}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className='flex flex-col'>
                                            <span className='whitespace-nowrap font-bold text-slate-600 text-sm'>
                                                {student.ASMCL_ClassName}
                                            </span>
                                            <span className='mt-0.5 font-semibold text-slate-400 text-xs'>{student.ASMC_SectionName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={student.astc_Remarks || ''}
                                            onValueChange={(val) => handleIndividualRemarkChange(student.AMST_Id, val)}
                                            disabled={!student.selected}>
                                            <SelectTrigger
                                                className={cn(
                                                    'h-11 rounded-xl border-slate-200 bg-white transition-all',
                                                    !student.astc_Remarks && student.selected && 'border-amber-400 ring-2 ring-amber-50'
                                                )}>
                                                <SelectValue placeholder='-- Select --' />
                                            </SelectTrigger>
                                            <SelectContent className='rounded-xl'>
                                                {REMARKS_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className='text-center'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            disabled={!student.selected}
                                            onClick={() => openEditModal(student)}
                                            className={cn(
                                                'h-11 w-11 rounded-xl border shadow-sm transition-all',
                                                student.selected
                                                    ? 'border-indigo-100 bg-white text-indigo-600 hover:bg-indigo-50'
                                                    : 'border-transparent text-slate-300'
                                            )}>
                                            <Settings2 className='h-5 w-5' />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className='flex justify-center pt-10'>
                <Button
                    onClick={handleSave}
                    disabled={isSaving || !isAnySelected}
                    className='h-16 transform rounded-full bg-indigo-600 px-24 py-5 font-black text-lg text-white uppercase tracking-tight shadow-2xl shadow-indigo-200 transition-all hover:scale-105 hover:bg-slate-900 active:scale-95'>
                    {isSaving ? <Loader2 className='mr-3 h-7 w-7 animate-spin' /> : <Save className='mr-3 h-7 w-7' />}
                    Request
                </Button>
            </div>

            {/* Details Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className='max-w-4xl overflow-hidden rounded-[2.5rem] border-none bg-slate-50 p-0 shadow-2xl'>
                    <DialogHeader className='border-slate-100 border-b bg-white p-8'>
                        <div className='flex items-center gap-5'>
                            <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100'>
                                <FileEdit className='h-8 w-8' />
                            </div>
                            <div className='text-left'>
                                <DialogTitle className='font-black text-2xl text-slate-800 uppercase tracking-tight'>
                                    Extra TC Details
                                </DialogTitle>
                                <p className='mt-1 font-bold text-slate-400 text-xs uppercase tracking-widest'>
                                    Student: {editingStudent?.StudentName} • ID: {editingStudent?.AMST_AdmNo}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <ScrollArea className='max-h-[70vh] p-8'>
                        {editingStudent && (
                            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                {/* Academic Fields */}
                                <div className='space-y-6'>
                                    <h4 className='flex items-center gap-2 font-black text-[10px] text-indigo-500 uppercase tracking-[0.2em]'>
                                        <span className='h-px w-5 bg-indigo-200'></span> Academic & Records
                                    </h4>

                                    <div className='space-y-2'>
                                        <label className='ml-1 font-bold text-slate-600 text-xs'>Working Days</label>
                                        <Input
                                            type='number'
                                            value={editingStudent.astc_WorkingDays}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, astc_WorkingDays: e.target.value })}
                                            className='h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500'
                                        />
                                    </div>

                                    <div className='space-y-2'>
                                        <label className='ml-1 font-bold text-slate-600 text-xs'>Attended Days</label>
                                        <Input
                                            type='number'
                                            value={editingStudent.astc_AttendedDays}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, astc_AttendedDays: e.target.value })}
                                            className='h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500'
                                        />
                                    </div>

                                    <div className='space-y-2'>
                                        <label className='ml-1 font-bold text-slate-600 text-xs'>Result Status</label>
                                        <Input
                                            placeholder='e.g. Pass, Promoted'
                                            value={editingStudent.astc_Result}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, astc_Result: e.target.value })}
                                            className='h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500'
                                        />
                                    </div>

                                    <div className='space-y-2'>
                                        <label className='ml-1 font-bold text-slate-600 text-xs'>Result Details</label>
                                        <Input
                                            placeholder='e.g. First Division'
                                            value={editingStudent.astc_ResultDetails}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, astc_ResultDetails: e.target.value })}
                                            className='h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500'
                                        />
                                    </div>

                                    <div className='space-y-2'>
                                        <label className='ml-1 font-bold text-slate-600 text-xs'>Subjects Studied</label>
                                        <Input
                                            placeholder='e.g. Math, Science, Eng...'
                                            value={editingStudent.astc_SubjectsStudied}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, astc_SubjectsStudied: e.target.value })}
                                            className='h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500'
                                        />
                                    </div>
                                </div>

                                {/* Behavioral & Admin Fields */}
                                <div className='space-y-6'>
                                    <h4 className='flex items-center gap-2 font-black text-[10px] text-amber-500 uppercase tracking-[0.2em]'>
                                        <span className='h-px w-5 bg-amber-200'></span> Behavioral & Administration
                                    </h4>

                                    <div className='space-y-2'>
                                        <label className='ml-1 font-bold text-slate-600 text-xs'>Leaving Reason</label>
                                        <Input
                                            placeholder='e.g. Transfer, Higher Studies'
                                            value={editingStudent.astc_LeavingReason}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, astc_LeavingReason: e.target.value })}
                                            className='h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500'
                                        />
                                    </div>

                                    <div className='space-y-2'>
                                        <label className='ml-1 font-bold text-slate-600 text-xs'>General Conduct</label>
                                        <Select
                                            value={editingStudent.astc_Conduct}
                                            onValueChange={(val) => setEditingStudent({ ...editingStudent, astc_Conduct: val })}>
                                            <SelectTrigger className='h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500'>
                                                <SelectValue placeholder='Select Conduct' />
                                            </SelectTrigger>
                                            <SelectContent className='rounded-xl'>
                                                {CONDUCT_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className='space-y-2'>
                                        <label className='ml-1 font-bold text-slate-600 text-xs'>Promotion Requested</label>
                                        <Select
                                            value={editingStudent.astc_Qual_PromotionFlag}
                                            onValueChange={(val) => setEditingStudent({ ...editingStudent, astc_Qual_PromotionFlag: val })}>
                                            <SelectTrigger className='h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500'>
                                                <SelectValue placeholder='Select Flag' />
                                            </SelectTrigger>
                                            <SelectContent className='rounded-xl'>
                                                {PROMOTION_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className='space-y-2'>
                                        <label className='ml-1 font-bold text-slate-600 text-xs'>Scholarship Details</label>
                                        <Input
                                            value={editingStudent.astc_Scholarship}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, astc_Scholarship: e.target.value })}
                                            className='h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500'
                                        />
                                    </div>
                                </div>

                                {/* Extended Details */}
                                <div className='grid grid-cols-1 gap-6 border-slate-100 border-t pt-4 md:col-span-2 md:grid-cols-3'>
                                    <div className='space-y-2'>
                                        <label className='ml-1 font-bold text-slate-600 text-xs'>Medium of Instruction</label>
                                        <Input
                                            value={editingStudent.astc_MediumOfINStruction}
                                            onChange={(e) =>
                                                setEditingStudent({ ...editingStudent, astc_MediumOfINStruction: e.target.value })
                                            }
                                            className='h-11 rounded-xl border-slate-200 bg-white'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <label className='ml-1 font-bold text-slate-600 text-xs'>Languages Studied</label>
                                        <Input
                                            value={editingStudent.astc_LanguageStudied}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, astc_LanguageStudied: e.target.value })}
                                            className='h-11 rounded-xl border-slate-200 bg-white'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <label className='ml-1 font-bold text-slate-600 text-xs'>Electives</label>
                                        <Input
                                            value={editingStudent.astc_ElectivesStudied}
                                            onChange={(e) =>
                                                setEditingStudent({ ...editingStudent, astc_ElectivesStudied: e.target.value })
                                            }
                                            className='h-11 rounded-xl border-slate-200 bg-white'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <label className='ml-1 font-bold text-slate-600 text-xs'>Medical Exam Status</label>
                                        <Input
                                            value={editingStudent.astc_MedicallyExam}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, astc_MedicallyExam: e.target.value })}
                                            className='h-11 rounded-xl border-slate-200 bg-white'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <label className='ml-1 font-bold text-slate-600 text-xs'>NCC/Scout Details</label>
                                        <Input
                                            value={editingStudent.astc_NCCDetails}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, astc_NCCDetails: e.target.value })}
                                            className='h-11 rounded-xl border-slate-200 bg-white'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <label className='ml-1 font-bold text-slate-600 text-xs'>Extra Activities</label>
                                        <Input
                                            value={editingStudent.astc_ExtraActivities}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, astc_ExtraActivities: e.target.value })}
                                            className='h-11 rounded-xl border-slate-200 bg-white'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <label className='ml-1 font-bold text-slate-600 text-xs'>Fees Paid (Total)</label>
                                        <Input
                                            type='number'
                                            value={editingStudent.astc_FeePaid}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, astc_FeePaid: e.target.value })}
                                            className='h-11 rounded-xl border-slate-200 bg-white'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <label className='ml-1 font-bold text-slate-600 text-xs'>Fee Concession</label>
                                        <Input
                                            value={editingStudent.astc_FeeConcession}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, astc_FeeConcession: e.target.value })}
                                            className='h-11 rounded-xl border-slate-200 bg-white'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <label className='ml-1 font-bold text-slate-600 text-xs'>Last Exam Details</label>
                                        <Input
                                            value={editingStudent.astc_LastExamDetails}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, astc_LastExamDetails: e.target.value })}
                                            className='h-11 rounded-xl border-slate-200 bg-white'
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </ScrollArea>

                    <DialogFooter className='flex justify-end gap-3 rounded-b-[2.5rem] border-slate-100 border-t bg-white p-8'>
                        <Button
                            variant='outline'
                            onClick={() => setIsModalOpen(false)}
                            className='h-12 rounded-xl border-slate-200 px-8 font-bold text-slate-600 transition-all hover:bg-slate-50'>
                            Discard
                        </Button>
                        <Button
                            onClick={saveDetails}
                            className='h-12 rounded-xl bg-indigo-600 px-12 font-bold text-white shadow-indigo-100 shadow-lg transition-all hover:bg-slate-900 active:scale-95'>
                            Sync Details
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
