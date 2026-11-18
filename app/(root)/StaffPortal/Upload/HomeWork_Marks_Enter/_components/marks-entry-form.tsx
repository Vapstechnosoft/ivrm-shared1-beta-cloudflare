'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { type IHomeWorkMarksList, homeWorkMarksListSchema } from '@/schemas/upload/transactions/ivrm-homework.schema';
import {
    fetchStudentUploadedHomework,
    updateHomeWorkMarks,
    viewHomeWorkDetail
} from '@/server/upload/transactions/ivrm-homework/server-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { Database, Eye, FileUp, Paperclip, RefreshCw, Save, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { verifyGridColumns } from './columns';

import { StaffAttachmentModal, StudentUploadModal } from './attachment-modals';

interface MarksEntryFormProps {
    initialResults: any[];
    topics: any[];
}

export default function MarksEntryForm({ initialResults, topics }: MarksEntryFormProps) {
    const { selectedRow, openDetailsView, closeDetailsView } = useFormContext<any>();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localTopics, setLocalTopics] = useState<any[]>(topics);

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<IHomeWorkMarksList>({
        resolver: zodResolver(homeWorkMarksListSchema),
        defaultValues: {
            ihW_Id: 0,
            students: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'students'
    });

    const watchedStudents = watch('students');

    // Handle Selection from the Search Grid
    const handleSelectRecord = (record: any) => {
        openDetailsView(record);
        setIsLoading(true);
        // In homework, the initialResults contains the students already?
        // No, typically gethomework_list returns students for THAT homework ID.
        // If we came from search results, then 'initialResults' IS the student list.
        // Wait, search results in legacy are already the student list.
        setValue('ihW_Id', record.IHW_Id);

        const studentData = initialResults.map((s) => ({
            amst_Id: s.AMST_Id,
            studentName: s.studentname,
            ihwupl_Id: s.IHWUPL_Id || 0,
            ihwupl_Marks: s.IHWUPL_Marks?.toString() || '',
            ihwupl_StaffRemarks: s.IHWUPL_StaffRemarks || '',
            ihwupl_StaffUpload: s.ihW_FilePath1 || '',
            ihwupl_FileName: s.ihW_FileName1 || '',
            checked: !!s.IHWUPL_Marks,
            subjectName: s.ISMS_SubjectName,
            topic: s.IHW_Topic,
            assignment: s.IHW_Assignment,
            hwDate: s.IHW_Date,
            uploadDate: s.CreatedDate,
            uploadTime: s.CreatedTime,
            filesCount: s.FilesCount || 0
        }));

        reset({
            ihW_Id: record.IHW_Id,
            students: studentData as any
        });
        setIsLoading(false);
    };

    const onSave: SubmitHandler<IHomeWorkMarksList> = async (data) => {
        const selectedStudents = data.students.filter((s) => s.checked);
        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student to save marks');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await updateHomeWorkMarks({
                ihW_Id: data.ihW_Id,
                students: selectedStudents
            });
            if (res.success) {
                toast.success('Homework marks updated successfully');
                closeDetailsView();
            } else {
                toast.error(res.message || 'Failed to update marks');
            }
        } catch (error) {
            toast.error('An error occurred during submission');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle All Checkboxes
    const handleToggleAll = (checked: boolean) => {
        watchedStudents.forEach((_, index) => {
            setValue(`students.${index}.checked`, checked);
        });
    };

    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [currentAttachments, setCurrentAttachments] = useState<any[]>([]);
    const [currentStudentUploads, setCurrentStudentUploads] = useState<any[]>([]);

    // View Staff Attachments
    const handleViewStaffAttachments = async (record: any) => {
        try {
            const res = await viewHomeWorkDetail(record.ihW_Id || record.IHW_Id);
            if (res.success && res.data) {
                setCurrentAttachments(res.data.viewhomework || []);
                setIsStaffModalOpen(true);
            }
        } catch (error) {
            toast.error('Failed to load attachments');
        }
    };

    // View Student Uploads
    const handleViewStudentUploads = async (record: any) => {
        try {
            const res = await fetchStudentUploadedHomework(
                record.amst_Id || record.AMST_Id,
                record.ihW_Id || record.IHW_Id,
                record.ihwupl_Id || record.IHWUPL_Id
            );
            if (res.success && res.data) {
                setCurrentStudentUploads(res.data.viewstudentupload || []);
                setIsStudentModalOpen(true);
            }
        } catch (error) {
            toast.error('Failed to load student uploads');
        }
    };

    if (!selectedRow) {
        return (
            <div className='space-y-4'>
                <div className='flex items-center justify-between rounded-t-md border-x border-t bg-slate-100 p-2'>
                    <h3 className='px-2 font-black text-slate-600 text-xs uppercase'>Search Results</h3>
                    <span className='rounded border bg-white px-2 py-0.5 font-bold text-[10px] text-slate-400 uppercase shadow-sm'>
                        Matches: {initialResults.length}
                    </span>
                </div>
                <DataTable<any, any>
                    columns={
                        verifyGridColumns.map((col: any) => {
                            if (col.id === 'actions') {
                                return {
                                    ...col,
                                    cell: ({ row }: any) => (
                                        <div className='flex justify-center'>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                onClick={() => handleSelectRecord(row.original)}
                                                className='text-blue-600 hover:bg-blue-50'
                                                title='Enter Marks'>
                                                <Database className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    )
                                };
                            }
                            return col;
                        }) as any
                    }
                    data={initialResults}
                    totalItems={initialResults.length}
                />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSave)} className='space-y-6'>
            <div className='overflow-hidden rounded-lg border bg-white shadow-sm'>
                <div className='flex items-center justify-between border-b bg-slate-50 p-4'>
                    <div>
                        <h3 className='font-black text-blue-800 text-sm uppercase'>Marks Entry & Verification</h3>
                        <p className='mt-0.5 font-bold text-[10px] text-slate-400'>UPDATING MARKS FOR HOMEWORK ID: {selectedRow.IHW_Id}</p>
                    </div>
                    <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={closeDetailsView}
                        className='text-slate-400 hover:text-red-600'>
                        <X className='mr-2 h-4 w-4' />
                        CLOSE
                    </Button>
                </div>

                <div className='overflow-x-auto p-0'>
                    <Table>
                        <TableHeader>
                            <TableRow className='border-b-0 bg-slate-800 hover:bg-slate-800'>
                                <TableHead className='w-[40px] p-2 text-center'>
                                    <Checkbox
                                        className='border-white/50 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500'
                                        onCheckedChange={(checked) => handleToggleAll(!!checked)}
                                    />
                                </TableHead>
                                <TableHead className='w-[50px] p-2 text-center font-black text-white text-xs uppercase'>SL</TableHead>
                                <TableHead className='min-w-[150px] p-2 font-black text-white text-xs uppercase'>Student Name</TableHead>
                                <TableHead className='min-w-[120px] p-2 font-black text-white text-xs uppercase'>Subject/Topic</TableHead>
                                <TableHead className='p-2 text-center font-black text-white text-xs uppercase'>HW Upload</TableHead>
                                <TableHead className='p-2 text-center font-black text-white text-xs uppercase'>ST Upload</TableHead>
                                <TableHead className='w-[100px] p-2 text-center font-black text-white text-xs uppercase'>Marks</TableHead>
                                <TableHead className='w-[120px] p-2 text-center font-black text-white text-xs uppercase'>
                                    Issue Upload
                                </TableHead>
                                <TableHead className='min-w-[150px] p-2 font-black text-white text-xs uppercase'>Staff Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field, index) => {
                                const isChecked = watchedStudents[index]?.checked;
                                return (
                                    <TableRow key={field.id} className={cn(isChecked ? 'bg-blue-50/50' : '')}>
                                        <TableCell className='p-2 text-center'>
                                            <Controller
                                                control={control}
                                                name={`students.${index}.checked`}
                                                render={({ field: checkboxField }) => (
                                                    <Checkbox checked={checkboxField.value} onCheckedChange={checkboxField.onChange} />
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell className='p-2 text-center font-bold text-[11px] text-slate-500'>{index + 1}</TableCell>
                                        <TableCell className='p-2'>
                                            <div className='flex flex-col'>
                                                <span className='font-black text-[11px] text-slate-700 uppercase'>
                                                    {(field as any).studentName}
                                                </span>
                                                <span className='font-bold text-[9px] text-slate-400'>{(field as any).admNo}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className='p-2'>
                                            <div className='flex flex-col'>
                                                <span className='font-bold text-[10px] text-blue-600 uppercase'>
                                                    {(field as any).subjectName}
                                                </span>
                                                <span
                                                    className='max-w-[120px] truncate font-medium text-[10px] text-slate-500 italic'
                                                    title={(field as any).topic}>
                                                    {(field as any).topic}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className='p-2 text-center'>
                                            {(field as any).filesCount > 0 ? (
                                                <Button
                                                    size='icon'
                                                    variant='ghost'
                                                    className='h-7 w-7 text-blue-600 hover:bg-blue-100'
                                                    type='button'
                                                    title='View HW Attachments'
                                                    onClick={() => handleViewStaffAttachments(field)}>
                                                    <Eye className='h-4 w-4' />
                                                </Button>
                                            ) : (
                                                <span className='font-bold text-[10px] text-slate-300'>---</span>
                                            )}
                                        </TableCell>
                                        <TableCell className='p-2 text-center'>
                                            <Button
                                                size='icon'
                                                variant='ghost'
                                                className='h-7 w-7 text-green-600 hover:bg-green-100'
                                                type='button'
                                                title='View Student Upload'
                                                onClick={() => handleViewStudentUploads(field)}>
                                                <Paperclip className='h-4 w-4' />
                                            </Button>
                                        </TableCell>
                                        <TableCell className='p-2 text-center'>
                                            <Input
                                                {...register(`students.${index}.ihwupl_Marks`)}
                                                disabled={!isChecked}
                                                className='h-8 border-slate-200 text-center font-black text-[11px] focus:border-blue-500'
                                                placeholder='0.0'
                                            />
                                        </TableCell>
                                        <TableCell className='p-2 text-center'>
                                            <Button
                                                size='icon'
                                                variant='outline'
                                                disabled={!isChecked}
                                                className='h-8 w-8 border-dashed text-slate-500 hover:text-blue-600'
                                                type='button'>
                                                <FileUp className='h-4 w-4' />
                                            </Button>
                                        </TableCell>
                                        <TableCell className='p-2'>
                                            <Textarea
                                                {...register(`students.${index}.ihwupl_StaffRemarks`)}
                                                disabled={!isChecked}
                                                className='h-8 min-h-[32px] border-slate-200 py-1 text-[11px] focus:border-blue-500'
                                                placeholder='Remarks...'
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                <div className='flex items-center justify-between border-t bg-slate-50 p-4'>
                    <div className='flex items-center gap-2'>
                        <span className='font-black text-[10px] text-slate-500 uppercase'>Selected:</span>
                        <span className='rounded bg-blue-600 px-2 py-0.5 font-black text-[10px] text-white shadow-sm'>
                            {watchedStudents.filter((s) => s.checked).length} / {watchedStudents.length}
                        </span>
                    </div>
                    <div className='flex gap-2'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => reset()}
                            className='h-9 border-slate-200 px-6 font-black text-slate-500 text-xs uppercase'>
                            Reset
                        </Button>
                        <Button
                            type='submit'
                            disabled={isSubmitting}
                            className='h-9 bg-blue-600 px-8 font-black text-white text-xs uppercase shadow-md transition-all hover:bg-blue-700'>
                            {isSubmitting ? <RefreshCw className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
                            Save Marks
                        </Button>
                    </div>
                </div>
            </div>

            <StaffAttachmentModal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} attachments={currentAttachments} />

            <StudentUploadModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} uploads={currentStudentUploads} />
        </form>
    );
}
