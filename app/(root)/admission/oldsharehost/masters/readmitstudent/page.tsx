'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ColumnDef } from '@tanstack/react-table';

import {
    useNewJoinList,
    useReadmitStudentDetails,
    useSaveReadmitStudent,
    useStudentListByYearAndClass
} from '@/hooks/admission/oldsharehost/masters/useReadmitStudent';

const formSchema = z.object({
    AMAY_ID_OLD: z.string().min(1, 'Select Left Academic Year'),
    ASMCL_Id: z.string().min(1, 'Select Class Admitted'),
    ASMS_Id: z.string().min(1, 'Select Section Admitted'),
    AMST_Id: z.string().min(1, 'Select Old Student Name'),
    AMAY_Id_New: z.string().min(1, 'Select New Academic Year'),
    ASMCL_Id_New: z.string().min(1, 'Select Class'),
    ASMS_Id_New: z.string().min(1, 'Select Section'),
    AMST_Id_New: z.string().min(1, 'Select New Student Name')
});

type FormValues = z.infer<typeof formSchema>;

export default function ReadmitStudentPage() {
    const { data: initialData, isLoading: isInitialLoading } = useReadmitStudentDetails();

    const studentListMutation = useStudentListByYearAndClass();
    const newJoinListMutation = useNewJoinList();
    const saveMutation = useSaveReadmitStudent();

    const [oldStudentList, setOldStudentList] = useState<any[]>([]);
    const [newStudentList, setNewStudentList] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [readmittedStudents, setReadmittedStudents] = useState<any[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            AMAY_ID_OLD: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            AMST_Id: '',
            AMAY_Id_New: '',
            ASMCL_Id_New: '',
            ASMS_Id_New: '',
            AMST_Id_New: ''
        }
    });

    const watchOldYear = form.watch('AMAY_ID_OLD');
    const watchOldClass = form.watch('ASMCL_Id');
    const watchOldSection = form.watch('ASMS_Id');

    const watchNewYear = form.watch('AMAY_Id_New');
    const watchNewClass = form.watch('ASMCL_Id_New');
    const watchNewSection = form.watch('ASMS_Id_New');

    useEffect(() => {
        if (watchOldYear && watchOldClass && watchOldSection) {
            getOldStudents(watchOldYear, watchOldClass, watchOldSection);
        } else {
            setOldStudentList([]);
            form.setValue('AMST_Id', '');
        }
    }, [watchOldYear, watchOldClass, watchOldSection]);

    useEffect(() => {
        if (watchNewYear && watchNewClass && watchNewSection) {
            getNewStudents(watchNewYear, watchNewClass, watchNewSection);
        } else {
            setNewStudentList([]);
            form.setValue('AMST_Id_New', '');
        }
    }, [watchNewYear, watchNewClass, watchNewSection]);

    const getOldStudents = async (yearId: string, classId: string, sectionId: string) => {
        try {
            const res = await studentListMutation.mutateAsync({
                AMAY_Id: Number(yearId),
                ASMCL_Id: Number(classId),
                ASMS_Id: Number(sectionId)
            });
            if (res?.data?.studentList?.length > 0) {
                setOldStudentList(res.data.studentList);
            } else {
                setOldStudentList([]);
                form.setValue('AMST_Id', '');
                toast.info('No Records found to display for Left Student Details');
            }
        } catch (error) {
            toast.error('Failed to fetch old student list');
        }
    };

    const getNewStudents = async (yearId: string, classId: string, sectionId: string) => {
        try {
            const res = await newJoinListMutation.mutateAsync({
                AMAY_Id_New: Number(yearId),
                ASMCL_Id_New: Number(classId),
                ASMS_Id_New: Number(sectionId)
            });
            if (res?.data?.newstudlist?.length > 0) {
                setNewStudentList(res.data.newstudlist);
            } else {
                setNewStudentList([]);
                form.setValue('AMST_Id_New', '');
                toast.info('Records Not Found for New Join List');
            }
        } catch (error) {
            toast.error('Failed to fetch new student list');
        }
    };

    const onSubmit = async (data: FormValues) => {
        try {
            setIsSaving(true);
            const payload = {
                amsT_Id: Number(data.AMST_Id),
                amcL_ID_OLD: Number(data.ASMCL_Id),
                amaY_ID_OLD: Number(data.AMAY_ID_OLD),
                amcL_Id_New: Number(data.ASMCL_Id_New),
                amaY_Id_New: Number(data.AMAY_Id_New),
                amsT_Id_New: Number(data.AMST_Id_New)
            };

            const res = await saveMutation.mutateAsync(payload);
            if (res?.success) {
                toast.success(res.message || 'Record Saved Successfully');
                if (res?.data?.studentlist) {
                    setReadmittedStudents(res.data.studentlist);
                }

                form.reset({
                    AMAY_ID_OLD: '',
                    ASMCL_Id: '',
                    ASMS_Id: '',
                    AMST_Id: '',
                    AMAY_Id_New: '',
                    ASMCL_Id_New: '',
                    ASMS_Id_New: '',
                    AMST_Id_New: ''
                });
                setOldStudentList([]);
                setNewStudentList([]);
            } else {
                toast.error(res?.message || 'Record Failed To Save');
            }
        } catch (error) {
            toast.error('Failed to save record');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClear = () => {
        window.location.reload();
    };

    const yearList = initialData?.data?.yearList || [];
    const classList = initialData?.data?.classList || [];
    const sectionList = initialData?.data?.sectionList || [];

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'asmaY_Id_OLd',
            header: () => <div className='text-center font-bold text-black'>Left Academic Year ID</div>,
            cell: ({ row }) => <div className='text-center'>{row.getValue('asmaY_Id_OLd')}</div>
        },
        {
            accessorKey: 'asmcL_Id_Old',
            header: () => <div className='text-center font-bold text-black'>Class Admitted ID</div>,
            cell: ({ row }) => <div className='text-center'>{row.getValue('asmcL_Id_Old')}</div>
        },
        {
            accessorKey: 'amsT_Id_OLd',
            header: () => <div className='text-center font-bold text-black'>Left Student ID</div>,
            cell: ({ row }) => <div className='text-center'>{row.getValue('amsT_Id_OLd')}</div>
        },
        {
            accessorKey: 'asmaY_Id_New',
            header: () => <div className='text-center font-bold text-black'>New Academic Year ID</div>,
            cell: ({ row }) => <div className='text-center'>{row.getValue('asmaY_Id_New')}</div>
        },
        {
            accessorKey: 'asmcL_Id_New',
            header: () => <div className='text-center font-bold text-black'>New Class ID</div>,
            cell: ({ row }) => <div className='text-center'>{row.getValue('asmcL_Id_New')}</div>
        },
        {
            accessorKey: 'amsT_Id_New',
            header: () => <div className='text-center font-bold text-black'>New Student ID</div>,
            cell: ({ row }) => <div className='text-center'>{row.getValue('amsT_Id_New')}</div>
        },
        {
            accessorKey: 'createdDate',
            header: () => <div className='text-center font-bold text-black'>Created Date</div>,
            cell: ({ row }) => {
                const date = row.getValue('createdDate') as string;
                return <div className='text-center'>{date ? new Date(date).toLocaleDateString() : ''}</div>;
            }
        }
    ];

    return (
        <div className='min-h-screen space-y-6 bg-gray-50 p-4'>
            <CollapsibleSection title='Re-Admit Student' defaultOpen={true} variant='outline' className='shadow-md'>
                {isInitialLoading ? (
                    <div className='flex justify-center p-8'>
                        <Loader2 className='h-8 w-8 animate-spin text-indigo-600' />
                    </div>
                ) : (
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 rounded-lg bg-white p-6'>
                        <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                            {/* Left Side */}
                            <div className='space-y-4'>
                                <h3 className='border-b pb-2 font-semibold text-indigo-700 text-lg'>Left Details</h3>

                                <div className='space-y-2'>
                                    <Label className='font-bold text-sm'>
                                        Left Academic Year:<span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='AMAY_ID_OLD'
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='-Select-' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {yearList.map((item: any) => (
                                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                            {item.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.AMAY_ID_OLD && (
                                        <span className='text-red-500 text-sm'>{form.formState.errors.AMAY_ID_OLD.message}</span>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label className='font-bold text-sm'>
                                        Class Admitted:<span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='ASMCL_Id'
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='-Select-' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classList.map((item: any) => (
                                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                            {item.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.ASMCL_Id && (
                                        <span className='text-red-500 text-sm'>{form.formState.errors.ASMCL_Id.message}</span>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label className='font-bold text-sm'>
                                        Section Admitted:<span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='ASMS_Id'
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='-Select-' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sectionList.map((item: any) => (
                                                        <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                            {item.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.ASMS_Id && (
                                        <span className='text-red-500 text-sm'>{form.formState.errors.ASMS_Id.message}</span>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label className='font-bold text-sm'>
                                        Left Student Name:<span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='AMST_Id'
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={studentListMutation.isPending}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='-Select-' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {oldStudentList.map((item: any) => (
                                                        <SelectItem key={item.amsT_Id} value={item.amsT_Id.toString()}>
                                                            {item.amsT_FirstName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.AMST_Id && (
                                        <span className='text-red-500 text-sm'>{form.formState.errors.AMST_Id.message}</span>
                                    )}
                                </div>
                            </div>

                            {/* Right Side */}
                            <div className='space-y-4'>
                                <h3 className='border-b pb-2 font-semibold text-green-700 text-lg'>New Details</h3>

                                <div className='space-y-2'>
                                    <Label className='font-bold text-sm'>
                                        New Academic Year:<span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='AMAY_Id_New'
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='-Select-' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {yearList.map((item: any) => (
                                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                            {item.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.AMAY_Id_New && (
                                        <span className='text-red-500 text-sm'>{form.formState.errors.AMAY_Id_New.message}</span>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label className='font-bold text-sm'>
                                        Class:<span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='ASMCL_Id_New'
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='-Select-' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classList.map((item: any) => (
                                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                            {item.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.ASMCL_Id_New && (
                                        <span className='text-red-500 text-sm'>{form.formState.errors.ASMCL_Id_New.message}</span>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label className='font-bold text-sm'>
                                        Section:<span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='ASMS_Id_New'
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='-Select-' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sectionList.map((item: any) => (
                                                        <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                            {item.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.ASMS_Id_New && (
                                        <span className='text-red-500 text-sm'>{form.formState.errors.ASMS_Id_New.message}</span>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label className='font-bold text-sm'>
                                        Student Name:<span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='AMST_Id_New'
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={newJoinListMutation.isPending}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='-Select-' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {newStudentList.map((item: any) => (
                                                        <SelectItem key={item.amsT_Id} value={item.amsT_Id.toString()}>
                                                            {item.amsT_FirstName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.AMST_Id_New && (
                                        <span className='text-red-500 text-sm'>{form.formState.errors.AMST_Id_New.message}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className='flex justify-center gap-4 border-t pt-4'>
                            <Button
                                type='submit'
                                disabled={isSaving}
                                className='min-w-[120px] bg-indigo-600 font-bold text-white hover:bg-indigo-700'>
                                {isSaving ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
                                Save
                            </Button>

                            <Button type='button' onClick={handleClear} variant='destructive' className='min-w-[120px] font-bold'>
                                <X className='mr-2 h-4 w-4' />
                                Clear
                            </Button>
                        </div>
                    </form>
                )}
            </CollapsibleSection>

            {/* {readmittedStudents.length > 0 && (
                <CollapsibleSection
                    title={<span className="font-bold absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">Readmitted Students List</span>}
                    headerClassName="relative"
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg'
                >
                    <div className='p-4'>
                        <GenericDataTable
                            data={readmittedStudents}
                            columns={columns}
                            isLoading={false}
                            totalItems={readmittedStudents.length}
                        />
                    </div>
                </CollapsibleSection>
            )} */}
        </div>
    );
}
