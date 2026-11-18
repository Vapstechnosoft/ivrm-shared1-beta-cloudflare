'use client';
import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchHomeWorkMarksList, updateHomeWorkMarks } from '@/server/upload/transactions/ivrm-homework/server-action';
import type { IHomeWorkDetails } from '@/types/upload/reports/homework-upload-report';
import { Loader2, Save, UserCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface MarksEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedRow: IHomeWorkDetails;
}

export default function MarksEntryModal({ isOpen, onClose, selectedRow }: MarksEntryModalProps) {
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && selectedRow?.IHW_Id) {
            loadStudents();
        }
    }, [isOpen, selectedRow]);

    const loadStudents = async () => {
        setIsLoading(true);
        try {
            const payload = {
                asmaY_Id: selectedRow.ASMAY_Id,
                asmcL_Id: selectedRow.ASMCL_Id,
                asmS_Id: selectedRow.ASMS_Id,
                ihW_Id: selectedRow.IHW_Id
            } as any;

            const response: any = await fetchHomeWorkMarksList(payload);
            const list = response.data || response.students || [];

            // Map keys if needed (e.g. AMST_Id -> amst_Id)
            const normalizedList = list.map((s: any) => ({
                ...s,
                amst_Id: s.amst_Id || s.AMST_Id,
                studentName: s.studentName || s.StudentName,
                ihwupl_Marks: s.ihwupl_Marks || ''
            }));

            setStudents(normalizedList);
        } catch (error) {
            toast.error('Failed to load student list');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarksChange = (index: number, value: string) => {
        const updated = [...students];
        updated[index].ihwupl_Marks = value;
        setStudents(updated);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                ihW_Id: selectedRow.IHW_Id || 0,
                students: students.map((s) => ({
                    amst_Id: s.amst_Id,
                    ihwupl_Marks: s.ihwupl_Marks,
                    ihwupl_Id: s.ihwupl_Id,
                    ihwupl_StaffRemarks: s.ihwupl_StaffRemarks,
                    ihwupl_StaffUpload: s.ihwupl_StaffUpload,
                    ihwupl_FileName: s.ihwupl_FileName
                }))
            };
            const result = await updateHomeWorkMarks(payload);
            if (result.success) {
                toast.success('Marks updated successfully');
                onClose();
            } else {
                toast.error(result.message || 'Failed to update marks');
            }
        } catch (error) {
            toast.error('An error occurred while saving marks');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdaptiveDialog
            isOpen={isOpen}
            onClose={onClose}
            size='lg'
            title={
                <div className='flex items-center gap-2'>
                    <UserCheck className='h-5 w-5 text-blue-600' />
                    <span className='font-semibold text-blue-800'>Marks Entry - {selectedRow.IHW_Topic}</span>
                </div>
            }
            description={
                <div className='mt-1 text-muted-foreground text-xs'>
                    {selectedRow.ASMCL_ClassName} - {selectedRow.ASMC_SectionName} | {selectedRow.ISMS_SubjectName}
                </div>
            }>
            <AdaptiveBody>
                {isLoading ? (
                    <div className='flex h-64 flex-col items-center justify-center gap-3'>
                        <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
                        <p className='text-muted-foreground text-sm'>Fetching student list...</p>
                    </div>
                ) : students.length > 0 ? (
                    <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
                        <div className='max-h-[500px] overflow-y-auto'>
                            <Table>
                                <TableHeader className='sticky top-0 z-10 bg-slate-50'>
                                    <TableRow>
                                        <TableHead className='w-16 text-center font-bold text-slate-700'>SL</TableHead>
                                        <TableHead className='font-bold text-slate-700'>Student Name</TableHead>
                                        <TableHead className='w-48 text-center font-bold text-slate-700'>Marks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student, index) => (
                                        <TableRow key={student.amst_Id} className='transition-colors hover:bg-blue-50/30'>
                                            <TableCell className='text-center text-slate-500'>{index + 1}</TableCell>
                                            <TableCell className='font-medium text-slate-700'>{student.studentName}</TableCell>
                                            <TableCell>
                                                <div className='flex justify-center'>
                                                    <Input
                                                        value={student.ihwupl_Marks}
                                                        onChange={(e) => handleMarksChange(index, e.target.value)}
                                                        placeholder='Enter Marks'
                                                        className='h-9 w-32 border-slate-200 text-center focus:border-blue-400 focus:ring-blue-400'
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ) : (
                    <div className='flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground'>
                        <p>No students found for this homework.</p>
                    </div>
                )}
            </AdaptiveBody>
            <AdaptiveFooter className='border-t bg-slate-50/50 p-4'>
                <Button variant='ghost' onClick={onClose} disabled={isSaving}>
                    <X className='mr-2 h-4 w-4' /> Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isSaving || students.length === 0}
                    className='bg-blue-600 shadow-md transition-all hover:bg-blue-700 active:scale-95'>
                    {isSaving ? (
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Saving...
                        </>
                    ) : (
                        <>
                            <Save className='mr-2 h-4 w-4' /> Update Marks
                        </>
                    )}
                </Button>
            </AdaptiveFooter>
        </AdaptiveDialog>
    );
}
