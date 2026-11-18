'use client';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { type IClassWorkMarksList, classWorkMarksListSchema } from '@/schemas/upload/transactions/ivrm-classwork.schema';
import { fetchClassWorkStudents, saveClassWorkMarks } from '@/server/upload/transactions/ivrm-classwork/server-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { Database, Eye, RefreshCw, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { verifyGridColumns } from './columns';

interface MarksEntryFormProps {
    initialResults: any[];
    topics: any[];
}

export default function MarksEntryForm({ initialResults, topics }: MarksEntryFormProps) {
    const { selectedRow, openDetailsView, closeDetailsView } = useFormContext<any>();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm<IClassWorkMarksList>({
        resolver: zodResolver(classWorkMarksListSchema),
        mode: 'onChange',
        defaultValues: {
            icW_Id: 0,
            students: []
        }
    });

    const { fields } = useFieldArray({
        control,
        name: 'students'
    });

    const loadStudents = async (id: number) => {
        setIsLoading(true);
        try {
            const response = await fetchClassWorkStudents(id);
            if (response.success && response.data?.studentList) {
                const students = response.data.studentList.map((s: any) => ({
                    amst_Id: s.amsT_Id,
                    studentName: s.studentName,
                    rollNo: s.rollNo?.toString(),
                    admNo: s.admNo,
                    icwupl_Id: s.icwupl_Id,
                    icwupl_Marks: s.icwupl_Marks?.toString() || '',
                    icwupl_StaffRemarks: s.icwupl_StaffRemarks || '',
                    icwupl_StaffUpload: s.icwupl_StaffUpload || '',
                    icwupl_FileName: s.icwupl_FileName || '',
                    checked: false,
                    studentUploads: s.studentUploads || []
                }));

                reset({
                    icW_Id: id,
                    students: students
                });
            } else {
                toast.error(response.message || 'Failed to load students');
            }
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setIsLoading(false);
        }
    };

    // React to global selection changes
    useEffect(() => {
        if (selectedRow?.icW_Id || selectedRow?.ICW_Id) {
            loadStudents(selectedRow.icW_Id || selectedRow.ICW_Id);
        }
    }, [selectedRow]);

    const onSubmit: SubmitHandler<IClassWorkMarksList> = async (data) => {
        try {
            setIsSubmitting(true);
            const checkedStudents = data.students.filter((s) => s.checked);

            if (checkedStudents.length === 0) {
                toast.warning('Please select at least one student to save.');
                return;
            }

            const payload = {
                ICW_Id: data.icW_Id,
                classwork_marks_list: checkedStudents.map((s) => ({
                    AMST_Id: s.amst_Id,
                    ICWUPL_Marks: s.icwupl_Marks,
                    ICWUPL_StaffRemarks: s.icwupl_StaffRemarks,
                    ICWUPL_StaffUpload: s.icwupl_StaffUpload,
                    ICWUPL_FileName: s.icwupl_FileName,
                    ICWUPL_Id: s.icwupl_Id
                }))
            };

            const result = await saveClassWorkMarks(payload);
            if (result.success) {
                toast.success(result.message || 'Marks saved successfully');
                handleClose();
            } else {
                toast.error(result.message || 'Failed to save marks');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save marks');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectRecord = (record: any) => {
        openDetailsView(record);
    };

    const handleReset = () => {
        if (selectedRow?.icW_Id || selectedRow?.ICW_Id) {
            loadStudents(selectedRow.icW_Id || selectedRow.ICW_Id);
            toast.info('Form reset to original values');
        }
    };

    const handleClose = () => {
        closeDetailsView();
        reset({ icW_Id: 0, students: [] });
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
        <div className='fade-in flex w-full animate-in flex-col gap-4 rounded-md border bg-white p-4 shadow-sm duration-500'>
            <div className='flex items-center justify-between rounded-t-md border-b bg-slate-50/50 p-2 pb-4'>
                <div>
                    <h2 className='font-black text-blue-800 text-lg uppercase'>Student Mark Verification</h2>
                    <div className='mt-1 flex gap-4'>
                        <p className='font-bold text-[10px] text-slate-500 uppercase'>
                            Topic: <span className='text-slate-700'>{selectedRow.icW_Topic || selectedRow.ICW_Topic}</span>
                        </p>
                        <p className='font-bold text-[10px] text-slate-500 uppercase'>
                            Subject: <span className='text-slate-700'>{selectedRow.ismS_SubjectName || selectedRow.ISMS_SubjectName}</span>
                        </p>
                    </div>
                </div>
                <Button variant='ghost' size='icon' onClick={handleClose} className='text-red-500 hover:bg-red-50'>
                    <X className='h-5 w-5' />
                </Button>
            </div>

            {isLoading ? (
                <div className='flex h-40 flex-col items-center justify-center gap-2 text-center font-bold text-muted-foreground text-xs uppercase'>
                    <RefreshCw className='h-6 w-6 animate-spin text-blue-600' />
                    LOADING STUDENT DETAILS
                    <br />
                    PLEASE WAIT...
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                    <div className='overflow-hidden rounded-md border shadow-sm'>
                        <Table>
                            <TableHeader className='bg-slate-800'>
                                <TableRow>
                                    <TableHead className='w-[60px] text-center font-black text-[10px] text-white uppercase tracking-tighter'>
                                        SELECT
                                    </TableHead>
                                    <TableHead className='font-black text-[10px] text-white uppercase'>STUDENT NAME</TableHead>
                                    <TableHead className='font-black text-[10px] text-white uppercase'>ADM NO</TableHead>
                                    <TableHead className='font-black text-[10px] text-white uppercase'>ROLL NO</TableHead>
                                    <TableHead className='text-center font-black text-[10px] text-white uppercase'>
                                        STUDENT UPLOAD
                                    </TableHead>
                                    <TableHead className='w-[120px] font-black text-[10px] text-white uppercase'>ENTER MARKS</TableHead>
                                    <TableHead className='font-black text-[10px] text-white uppercase'>STAFF REMARKS</TableHead>
                                    <TableHead className='font-black text-[10px] text-white uppercase'>STAFF UPLOAD</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className='py-10 text-center font-bold text-slate-400'>
                                            NO STUDENTS FOUND
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    fields.map((field, index) => {
                                        const isChecked = watch(`students.${index}.checked`);
                                        return (
                                            <TableRow key={field.id} className={cn(isChecked ? 'bg-blue-50/50' : '')}>
                                                <TableCell className='text-center'>
                                                    <Controller
                                                        name={`students.${index}.checked`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <input
                                                                type='checkbox'
                                                                checked={field.value}
                                                                onChange={(e) => field.onChange(e.target.checked)}
                                                                className='h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 shadow-sm focus:ring-blue-500'
                                                            />
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell className='font-bold text-[11px] text-slate-700 uppercase'>
                                                    {watch(`students.${index}.studentName`)}
                                                </TableCell>
                                                <TableCell className='font-medium text-[11px] text-slate-500'>
                                                    {watch(`students.${index}.admNo`)}
                                                </TableCell>
                                                <TableCell className='text-center font-medium text-[11px] text-slate-500'>
                                                    {watch(`students.${index}.rollNo`)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className='flex flex-wrap justify-center gap-1'>
                                                        {watch(`students.${index}.studentUploads`)?.map((upload: any, uIdx: number) => (
                                                            <Button
                                                                key={upload.icwupl_Id || uIdx}
                                                                type='button'
                                                                variant='outline'
                                                                size='sm'
                                                                className='h-7 border-blue-100 px-2 font-black text-[10px] text-blue-600 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50'
                                                                onClick={() => {
                                                                    if (upload.icwupl_Attachment) {
                                                                        window.open(upload.icwupl_Attachment, '_blank');
                                                                    } else {
                                                                        toast.error('No attachment link available.');
                                                                    }
                                                                }}>
                                                                <Eye className='mr-1 h-3 w-3' />
                                                                FILE {uIdx + 1}
                                                            </Button>
                                                        ))}
                                                        {(!watch(`students.${index}.studentUploads`) ||
                                                            watch(`students.${index}.studentUploads`)?.length === 0) && (
                                                            <span className='font-medium text-[10px] text-slate-300 italic'>None</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className='group flex flex-col gap-1'>
                                                        <input
                                                            type='text'
                                                            {...register(`students.${index}.icwupl_Marks`)}
                                                            placeholder='0.00'
                                                            className='h-8 w-full rounded border-slate-200 bg-white px-2 py-1 text-center font-black text-[11px] text-blue-800 shadow-sm transition-all focus:border-blue-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-300'
                                                            disabled={!isChecked}
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className='group flex flex-col gap-1'>
                                                        <textarea
                                                            {...register(`students.${index}.icwupl_StaffRemarks`)}
                                                            placeholder='Enter remarks...'
                                                            rows={1}
                                                            className='min-h-[32px] w-full rounded border-slate-200 bg-white px-2 py-1 font-medium text-[11px] shadow-sm transition-all focus:border-blue-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-300'
                                                            disabled={!isChecked}
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className='flex items-center gap-1'>
                                                        <input
                                                            type='text'
                                                            {...register(`students.${index}.icwupl_StaffUpload`)}
                                                            placeholder='External Link / URL'
                                                            className='h-8 flex-1 rounded border-slate-200 bg-white px-2 py-1 font-medium text-[10px] shadow-sm transition-all focus:border-blue-500 focus:outline-none disabled:bg-slate-50'
                                                            disabled={!isChecked}
                                                        />
                                                        <Button
                                                            type='button'
                                                            variant='ghost'
                                                            size='icon'
                                                            className='h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-20'
                                                            disabled={!isChecked || !watch(`students.${index}.icwupl_StaffUpload`)}
                                                            onClick={() => {
                                                                const url = watch(`students.${index}.icwupl_StaffUpload`);
                                                                if (url) window.open(url, '_blank');
                                                            }}>
                                                            <Eye className='h-4 w-4' />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className='flex items-center gap-4 rounded-b-md border-x border-t border-b bg-slate-50/70 p-4 pt-4'>
                        <Button
                            type='submit'
                            disabled={isSubmitting}
                            className='min-w-[150px] bg-emerald-600 font-black text-white uppercase tracking-widest shadow-lg transition-all hover:bg-emerald-700 active:scale-95'
                            isLoading={isSubmitting}
                            loadingText='SAVING...'>
                            <Save className='mr-2 h-4 w-4' />
                            SAVE MARKS
                        </Button>

                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleReset}
                            disabled={isSubmitting}
                            className='min-w-[130px] border-blue-200 bg-white font-black font-bold text-blue-600 uppercase tracking-widest transition-all hover:bg-blue-100 active:scale-95'>
                            <RefreshCw className='mr-2 h-4 w-4' />
                            RESET FORM
                        </Button>

                        <div className='ml-auto'>
                            <span className='rounded-full bg-slate-100 px-3 py-1 font-black text-[10px] text-slate-400 uppercase'>
                                Total Students: {fields.length}
                            </span>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
