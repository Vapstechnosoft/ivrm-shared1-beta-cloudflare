'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, CheckCircle2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, Loader2, Plus, RotateCcw, Save, Search, SlidersHorizontal, X, XCircle } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { deleteClgMasterSubject, editClgMasterSubject, saveClgMasterSubject, saveClgSubjectOrder } from '../actions';
import type { IClgMasterSubject, IClgSubjectOrder } from '../types';
import { SetOrderModal } from './set-order-modal';

interface MasterSubjectFormData {
    ISMS_Id: number;
    ISMS_SubjectName: string;
    ISMS_SubjectCode: string;
    ISMS_IVRSSubjectName: string;
    ISMS_SubjectNameNew: string;
    ISMS_PreadmFlag: boolean;
    ISMS_Max_Marks: string;
    ISMS_Min_Marks: string;
    ISMS_SubjectFlag: string;
    ISMS_AttendanceFlag: boolean;
    ISMS_TTFlag: boolean;
    ISMS_LanguageFlg: boolean;
    ISMS_ExamFlag: boolean;
    ISMS_BatchAppl: boolean;
    ISMS_AtExtraFeeFlg: boolean;
}

const defaultFormValues: MasterSubjectFormData = {
    ISMS_Id: 0,
    ISMS_SubjectName: '',
    ISMS_SubjectCode: '',
    ISMS_IVRSSubjectName: '',
    ISMS_SubjectNameNew: '',
    ISMS_PreadmFlag: false,
    ISMS_Max_Marks: '',
    ISMS_Min_Marks: '',
    ISMS_SubjectFlag: '1',
    ISMS_AttendanceFlag: false,
    ISMS_TTFlag: false,
    ISMS_LanguageFlg: false,
    ISMS_ExamFlag: false,
    ISMS_BatchAppl: false,
    ISMS_AtExtraFeeFlg: false
};

interface MasterSubjectTabProps {
    subjects: IClgMasterSubject[];
    orderSubjects: IClgMasterSubject[];
    onRefresh: () => Promise<void>;
    isLoading?: boolean;
}

export function MasterSubjectTab({
    subjects,
    orderSubjects,
    onRefresh,
    isLoading = false
}: MasterSubjectTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState<string>('ismS_Id');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isSaving, setIsSaving] = useState(false);
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [isOrderSaving, setIsOrderSaving] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<MasterSubjectFormData>({
        defaultValues: defaultFormValues
    });

    const isPreadmFlag = watch('ISMS_PreadmFlag');
    const ismsId = watch('ISMS_Id');
    const maxMarks = watch('ISMS_Max_Marks');

    // Validation helpers
    const handleMaxMarksChange = (val: string) => {
        const num = Number(val);
        if (num > 1000) {
            Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Max Value Is 1000'
            });
            setValue('ISMS_Max_Marks', '');
            setValue('ISMS_Min_Marks', '');
            return;
        }
        setValue('ISMS_Max_Marks', val);
        setValue('ISMS_Min_Marks', '');
    };

    const handleMinMarksBlur = (minVal: string) => {
        if (!minVal) return;
        if (!maxMarks) {
            Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'First Enter Max. Marks'
            });
            setValue('ISMS_Min_Marks', '');
            return;
        }
        const numMax = Number(maxMarks);
        const numMin = Number(minVal);
        if (numMin >= numMax) {
            Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Min. Marks Value Should Be Less Than Max. Marks Value'
            });
            setValue('ISMS_Min_Marks', '');
        }
    };

    // Save Form
    const onSubmit = async (data: MasterSubjectFormData) => {
        try {
            setIsSaving(true);
            const payload = {
                ISMS_Id: data.ISMS_Id || 0,
                ISMS_SubjectName: data.ISMS_SubjectName,
                ISMS_IVRSSubjectName: data.ISMS_IVRSSubjectName,
                ISMS_SubjectNameNew: data.ISMS_SubjectNameNew || '',
                ISMS_SubjectCode: data.ISMS_SubjectCode,
                ISMS_Max_Marks: data.ISMS_PreadmFlag ? (data.ISMS_Max_Marks ? Number(data.ISMS_Max_Marks) : 0) : 0,
                ISMS_Min_Marks: data.ISMS_PreadmFlag ? (data.ISMS_Min_Marks ? Number(data.ISMS_Min_Marks) : 0) : 0,
                ISMS_ExamFlag: data.ISMS_ExamFlag ? 1 : 0,
                ISMS_PreadmFlag: data.ISMS_PreadmFlag ? 1 : 0,
                ISMS_SubjectFlag: data.ISMS_PreadmFlag ? (data.ISMS_SubjectFlag === '1' ? 1 : 0) : 1,
                ISMS_BatchAppl: data.ISMS_BatchAppl ? 1 : 0,
                ISMS_TTFlag: data.ISMS_TTFlag ? 1 : 0,
                ISMS_AttendanceFlag: data.ISMS_AttendanceFlag ? 1 : 0,
                ISMS_LanguageFlg: data.ISMS_LanguageFlg ? 1 : 0,
                ISMS_AtExtraFeeFlg: data.ISMS_AtExtraFeeFlg ? 1 : 0
            };

            const response = await saveClgMasterSubject(payload);
            const resData = response?.data;

            if (resData?.returnval === true) {
                if (payload.ISMS_Id === 0) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Record saved successfully'
                    });
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Record updated successfully'
                    });
                }
                reset(defaultFormValues);
                await onRefresh();
            } else if (resData?.returnduplicatestatus === 'Duplicate') {
                if (resData?.returnvaluetype === 'subjectname') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Duplicate Record',
                        text: 'Subject Name already exists'
                    });
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Duplicate Record',
                        text: 'Subject Code already exists'
                    });
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: payload.ISMS_Id === 0 ? 'Failed to save, please contact administrator' : 'Failed to update, please contact administrator'
                });
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error saving subject');
        } finally {
            setIsSaving(false);
        }
    };

    // Edit Row
    const handleEdit = async (item: IClgMasterSubject) => {
        try {
            const res = await editClgMasterSubject(item.ismS_Id);
            const editData = res?.data?.edit_m_subject?.[0] || item;

            setValue('ISMS_Id', editData.ismS_Id || 0);
            setValue('ISMS_SubjectName', editData.ismS_SubjectName || '');
            setValue('ISMS_IVRSSubjectName', editData.ismS_IVRSSubjectName || '');
            setValue('ISMS_SubjectNameNew', editData.ismS_SubjectNameNew || '');
            setValue('ISMS_SubjectCode', editData.ismS_SubjectCode || '');
            setValue('ISMS_Max_Marks', editData.ismS_Max_Marks != null ? String(editData.ismS_Max_Marks) : '');
            setValue('ISMS_Min_Marks', editData.ismS_Min_Marks != null ? String(editData.ismS_Min_Marks) : '');
            setValue('ISMS_PreadmFlag', Boolean(editData.ismS_PreadmFlag));
            setValue('ISMS_SubjectFlag', String(editData.ismS_SubjectFlag ?? '1'));
            setValue('ISMS_AttendanceFlag', Boolean(editData.ismS_AttendanceFlag));
            setValue('ISMS_TTFlag', Boolean(editData.ismS_TTFlag));
            setValue('ISMS_LanguageFlg', Boolean(editData.ismS_LanguageFlg));
            setValue('ISMS_ExamFlag', Boolean(editData.ismS_ExamFlag));
            setValue('ISMS_BatchAppl', Boolean(editData.ismS_BatchAppl));
            setValue('ISMS_AtExtraFeeFlg', Boolean(editData.ismS_AtExtraFeeFlg));

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            toast.error(err?.message || 'Failed to load subject details for editing');
        }
    };

    // Activate / Deactivate Row
    const handleToggleStatus = async (item: IClgMasterSubject) => {
        const isCurrentlyActive = item.ismS_ActiveFlag === 1;
        const actionLabel = isCurrentlyActive ? 'Deactivate' : 'Activate';
        const pastActionLabel = isCurrentlyActive ? 'De-activated' : 'Activated';

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${actionLabel} the ${item.ismS_SubjectName} Subject?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isCurrentlyActive ? '#d33' : '#3085d6',
            cancelButtonColor: '#64748b',
            confirmButtonText: `Yes, ${actionLabel} It!`
        });

        if (result.isConfirmed) {
            try {
                const response = await deleteClgMasterSubject(item.ismS_Id);
                const resData = response?.data;

                if (resData?.already_cnt === true) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Dependency Detected',
                        text: 'You Can Not Deactivate This Record, It Has Dependency'
                    });
                } else if (resData?.returnval === true) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: `Record ${pastActionLabel} successfully`
                    });
                    reset(defaultFormValues);
                    await onRefresh();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed',
                        text: `Record ${actionLabel} Failed`
                    });
                }
            } catch (err: any) {
                toast.error(err?.message || `Failed to ${actionLabel.toLowerCase()} subject`);
            }
        }
    };

    // Save Order
    const handleSaveOrder = async (orderedList: IClgSubjectOrder[]) => {
        try {
            setIsOrderSaving(true);
            const res = await saveClgSubjectOrder(orderedList);
            const returnMsg = res?.data?.retrunMsg;
            if (returnMsg) {
                Swal.fire({
                    icon: 'info',
                    title: 'Order Status',
                    text: returnMsg
                });
            } else {
                toast.success('Subject order updated successfully');
            }
            setOrderModalOpen(false);
            await onRefresh();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to save subject order');
        } finally {
            setIsOrderSaving(false);
        }
    };

    // Table Filter & Sorting
    const filteredSubjects = useMemo(() => {
        let result = [...subjects];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter((sub) => {
                const sName = (sub.ismS_SubjectName || '').toLowerCase();
                const sIvrs = (sub.ismS_IVRSSubjectName || '').toLowerCase();
                const sCode = (sub.ismS_SubjectCode || '').toLowerCase();
                const sFlag = String(sub.ismS_SubjectFlag || '').toLowerCase();
                const sMax = String(sub.ismS_Max_Marks ?? '');
                const sMin = String(sub.ismS_Min_Marks ?? '');

                return (
                    sName.includes(q) ||
                    sIvrs.includes(q) ||
                    sCode.includes(q) ||
                    sFlag.includes(q) ||
                    sMax.includes(q) ||
                    sMin.includes(q)
                );
            });
        }

        result.sort((a: any, b: any) => {
            const valA = a[sortColumn] ?? '';
            const valB = b[sortColumn] ?? '';
            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortDirection === 'asc' ? valA - valB : valB - valA;
            }
            const comp = String(valA).localeCompare(String(valB));
            return sortDirection === 'asc' ? comp : -comp;
        });

        return result;
    }, [subjects, searchQuery, sortColumn, sortDirection]);

    const totalPages = Math.ceil(filteredSubjects.length / pageSize) || 1;
    const paginatedSubjects = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredSubjects.slice(start, start + pageSize);
    }, [filteredSubjects, currentPage, pageSize]);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Prepare order data for SetOrderModal
    const formattedOrderData: IClgSubjectOrder[] = useMemo(() => {
        const list = orderSubjects && orderSubjects.length > 0 ? orderSubjects : subjects;
        return list.map((item, idx) => ({
            id: item.ismS_Id || idx + 1,
            ismS_Id: item.ismS_Id,
            ismS_SubjectName: item.ismS_SubjectName || '',
            ismS_SubjectCode: item.ismS_SubjectCode || '',
            ismS_OrderFlag: item.ismS_OrderFlag ?? idx + 1,
            ismS_PreadmFlag: typeof item.ismS_PreadmFlag === 'boolean' ? (item.ismS_PreadmFlag ? 1 : 0) : item.ismS_PreadmFlag,
            ismS_SubjectFlag: item.ismS_SubjectFlag
        }));
    }, [orderSubjects, subjects]);

    return (
        <div className='space-y-6'>
            {/* Form Section */}
            <Card className='border-border/60 shadow-sm'>
                <CardHeader className='border-b bg-muted/20 pb-4'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <CardTitle className='text-lg font-semibold text-foreground'>
                                {ismsId > 0 ? 'Edit Master Subject' : 'Master Subject Form'}
                            </CardTitle>
                            <p className='text-xs text-muted-foreground mt-0.5'>
                                Enter subject configuration, evaluation rules, and operational flags
                            </p>
                        </div>
                        {ismsId > 0 && (
                            <Badge variant='outline' className='border-amber-500 text-amber-600 bg-amber-50'>
                                Edit Mode: ID #{ismsId}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className='p-6'>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                            {/* Left Column: Basic Info & Marks */}
                            <div className='space-y-4'>
                                <InputText
                                    label='Subject Name'
                                    required
                                    placeholder='Enter Subject Name'
                                    id='ISMS_SubjectName'
                                    maxLength={150}
                                    {...register('ISMS_SubjectName', { required: 'Enter Subject Name' })}
                                    error={errors.ISMS_SubjectName?.message}
                                />

                                <InputText
                                    label='Subject Code'
                                    required
                                    placeholder='Enter Subject Code'
                                    id='ISMS_SubjectCode'
                                    maxLength={150}
                                    {...register('ISMS_SubjectCode', { required: 'Enter Subject Code' })}
                                    error={errors.ISMS_SubjectCode?.message}
                                />

                                <InputText
                                    label='IVRS Subject Name'
                                    required
                                    placeholder='Enter IVRS Subject Name'
                                    id='ISMS_IVRSSubjectName'
                                    maxLength={150}
                                    {...register('ISMS_IVRSSubjectName', { required: 'Enter IVRS Subject Name' })}
                                    error={errors.ISMS_IVRSSubjectName?.message}
                                />

                                <InputText
                                    label='Description'
                                    placeholder='Enter Description'
                                    id='ISMS_SubjectNameNew'
                                    maxLength={150}
                                    {...register('ISMS_SubjectNameNew')}
                                />

                                {/* PreAdmission Dependent Marks Fields */}
                                {isPreadmFlag && (
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border/70 animate-in fade-in-50 duration-200'>
                                        <div className='flex flex-col gap-1.5'>
                                            <Label htmlFor='ISMS_Max_Marks'>
                                                Max Marks <span className='text-red-500'>*</span>
                                            </Label>
                                            <InputText
                                                id='ISMS_Max_Marks'
                                                placeholder='e.g. 100.00'
                                                value={watch('ISMS_Max_Marks')}
                                                onChange={(e) => handleMaxMarksChange(e.target.value)}
                                            />
                                        </div>

                                        <div className='flex flex-col gap-1.5'>
                                            <Label htmlFor='ISMS_Min_Marks'>
                                                Min Marks <span className='text-red-500'>*</span>
                                            </Label>
                                            <InputText
                                                id='ISMS_Min_Marks'
                                                placeholder='e.g. 35.00'
                                                value={watch('ISMS_Min_Marks')}
                                                onChange={(e) => setValue('ISMS_Min_Marks', e.target.value)}
                                                onBlur={(e) => handleMinMarksBlur(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Radio Types & Checkbox Flags */}
                            <div className='space-y-6 flex flex-col justify-between'>
                                {isPreadmFlag && (
                                    <div className='p-4 rounded-lg bg-muted/30 border border-border/70'>
                                        <Label className='block mb-2 font-medium'>Subject Type (Written / Oral)</Label>
                                        <Controller
                                            name='ISMS_SubjectFlag'
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    className='flex gap-6 mt-1'>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='1' id='subj-written' />
                                                        <Label htmlFor='subj-written' className='cursor-pointer'>Written</Label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='0' id='subj-oral' />
                                                        <Label htmlFor='subj-oral' className='cursor-pointer'>Oral</Label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>
                                )}

                                <div className='rounded-lg border p-4 bg-card/60 shadow-inner'>
                                    <h4 className='text-sm font-semibold text-foreground mb-3 pb-2 border-b'>
                                        Functional Flags
                                    </h4>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6'>
                                        {/* PreAdmission Flag */}
                                        <div className='flex items-center space-x-2.5'>
                                            <Controller
                                                name='ISMS_PreadmFlag'
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        id='ISMS_PreadmFlag'
                                                        checked={field.value}
                                                        onCheckedChange={(val) => {
                                                            field.onChange(val);
                                                            if (!val) {
                                                                setValue('ISMS_Max_Marks', '');
                                                                setValue('ISMS_Min_Marks', '');
                                                                setValue('ISMS_SubjectFlag', '1');
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                            <Label htmlFor='ISMS_PreadmFlag' className='text-sm font-medium cursor-pointer'>
                                                PreAdmission Flag
                                            </Label>
                                        </div>

                                        {/* Attendance Flag */}
                                        <div className='flex items-center space-x-2.5'>
                                            <Controller
                                                name='ISMS_AttendanceFlag'
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        id='ISMS_AttendanceFlag'
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                )}
                                            />
                                            <Label htmlFor='ISMS_AttendanceFlag' className='text-sm font-medium cursor-pointer'>
                                                Attendance Flag
                                            </Label>
                                        </div>

                                        {/* TimeTable Flag */}
                                        <div className='flex items-center space-x-2.5'>
                                            <Controller
                                                name='ISMS_TTFlag'
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        id='ISMS_TTFlag'
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                )}
                                            />
                                            <Label htmlFor='ISMS_TTFlag' className='text-sm font-medium cursor-pointer'>
                                                TimeTable Flag
                                            </Label>
                                        </div>

                                        {/* Language Flag */}
                                        <div className='flex items-center space-x-2.5'>
                                            <Controller
                                                name='ISMS_LanguageFlg'
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        id='ISMS_LanguageFlg'
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                )}
                                            />
                                            <Label htmlFor='ISMS_LanguageFlg' className='text-sm font-medium cursor-pointer'>
                                                Language Flag
                                            </Label>
                                        </div>

                                        {/* Exam Flag */}
                                        <div className='flex items-center space-x-2.5'>
                                            <Controller
                                                name='ISMS_ExamFlag'
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        id='ISMS_ExamFlag'
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                )}
                                            />
                                            <Label htmlFor='ISMS_ExamFlag' className='text-sm font-medium cursor-pointer'>
                                                Exam Flag
                                            </Label>
                                        </div>

                                        {/* Batch Wise Flag */}
                                        <div className='flex items-center space-x-2.5'>
                                            <Controller
                                                name='ISMS_BatchAppl'
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        id='ISMS_BatchAppl'
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                )}
                                            />
                                            <Label htmlFor='ISMS_BatchAppl' className='text-sm font-medium cursor-pointer'>
                                                Batch Wise Flag
                                            </Label>
                                        </div>

                                        {/* Extra Fee Flag */}
                                        <div className='flex items-center space-x-2.5'>
                                            <Controller
                                                name='ISMS_AtExtraFeeFlg'
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        id='ISMS_AtExtraFeeFlg'
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                )}
                                            />
                                            <Label htmlFor='ISMS_AtExtraFeeFlg' className='text-sm font-medium cursor-pointer'>
                                                Extra Fee Flag
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex flex-wrap items-center justify-center gap-3 border-t pt-5'>
                            <Button
                                type='submit'
                                disabled={isSaving}
                                className='min-w-[110px] bg-primary shadow hover:bg-primary/90'>
                                {isSaving ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className='mr-2 h-4 w-4' />
                                        {ismsId > 0 ? 'Update' : 'Save'}
                                    </>
                                )}
                            </Button>

                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => reset(defaultFormValues)}
                                disabled={isSaving}
                                className='min-w-[100px] border-destructive/30 text-destructive hover:bg-destructive/10'>
                                <RotateCcw className='mr-2 h-4 w-4' />
                                Cancel
                            </Button>

                            <Button
                                type='button'
                                variant='secondary'
                                onClick={() => setOrderModalOpen(true)}
                                className='min-w-[110px]'>
                                <SlidersHorizontal className='mr-2 h-4 w-4' />
                                Set Order
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Master Subject List Table Card */}
            <Card className='border-border/60 shadow-sm'>
                <CardHeader className='border-b bg-muted/20 pb-4'>
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                        <div>
                            <CardTitle className='text-lg font-semibold text-foreground'>
                                Master Subject List
                            </CardTitle>
                            <div className='flex items-center gap-2 mt-1 text-xs text-muted-foreground'>
                                <span>Total Records:</span>
                                <Badge variant='secondary' className='font-mono'>
                                    {subjects.length}
                                </Badge>
                                {searchQuery.trim() && (
                                    <>
                                        <span>• Filtered:</span>
                                        <Badge variant='outline' className='font-mono'>
                                            {filteredSubjects.length}
                                        </Badge>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className='relative w-full sm:w-72'>
                            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                            <input
                                type='text'
                                placeholder='Search subjects...'
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className='w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary'
                            />
                            {searchQuery && (
                                <button
                                    type='button'
                                    onClick={() => setSearchQuery('')}
                                    className='absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground'>
                                    <X className='h-4 w-4' />
                                </button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className='p-0'>
                    <div className='overflow-x-auto'>
                        <table className='w-full border-collapse text-left text-sm'>
                            <thead className='border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase'>
                                <tr>
                                    <th className='px-4 py-3 text-center'>SL NO</th>
                                    <th className='px-4 py-3 cursor-pointer hover:text-foreground' onClick={() => handleSort('ismS_SubjectName')}>
                                        Subject Name
                                    </th>
                                    <th className='px-4 py-3 cursor-pointer hover:text-foreground' onClick={() => handleSort('ismS_IVRSSubjectName')}>
                                        IVRS Name
                                    </th>
                                    <th className='px-4 py-3 cursor-pointer hover:text-foreground' onClick={() => handleSort('ismS_SubjectCode')}>
                                        Code
                                    </th>
                                    <th className='px-4 py-3 text-center cursor-pointer hover:text-foreground' onClick={() => handleSort('ismS_SubjectFlag')}>
                                        Type
                                    </th>
                                    <th className='px-4 py-3 text-center cursor-pointer hover:text-foreground' onClick={() => handleSort('ismS_Max_Marks')}>
                                        Max Marks
                                    </th>
                                    <th className='px-4 py-3 text-center cursor-pointer hover:text-foreground' onClick={() => handleSort('ismS_Min_Marks')}>
                                        Min Marks
                                    </th>
                                    <th className='px-3 py-3 text-center'>PreAdm</th>
                                    <th className='px-3 py-3 text-center'>Att.</th>
                                    <th className='px-3 py-3 text-center'>Batch</th>
                                    <th className='px-3 py-3 text-center'>TT</th>
                                    <th className='px-3 py-3 text-center'>Exam</th>
                                    <th className='px-3 py-3 text-center'>Lang</th>
                                    <th className='px-3 py-3 text-center'>Extra Fee</th>
                                    <th className='px-4 py-3 text-center sticky right-0 bg-muted/40 shadow-sm'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-border'>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={15} className='px-4 py-8 text-center text-muted-foreground'>
                                            <div className='flex items-center justify-center gap-2'>
                                                <Loader2 className='h-5 w-5 animate-spin text-primary' />
                                                <span>Loading subjects...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedSubjects.length === 0 ? (
                                    <tr>
                                        <td colSpan={15} className='px-4 py-8 text-center text-muted-foreground'>
                                            No master subjects found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedSubjects.map((sub, index) => {
                                        const slNo = (currentPage - 1) * pageSize + index + 1;
                                        const isPreadm = sub.ismS_PreadmFlag === 1 || sub.ismS_PreadmFlag === true;
                                        const isActive = sub.ismS_ActiveFlag === 1;

                                        return (
                                            <tr key={sub.ismS_Id || index} className='hover:bg-muted/30 transition-colors'>
                                                <td className='px-4 py-3 text-center font-mono text-xs'>{slNo}</td>
                                                <td className='px-4 py-3 font-medium text-foreground'>{sub.ismS_SubjectName}</td>
                                                <td className='px-4 py-3 text-muted-foreground'>{sub.ismS_IVRSSubjectName || '-'}</td>
                                                <td className='px-4 py-3 font-mono text-xs'>{sub.ismS_SubjectCode || '-'}</td>
                                                <td className='px-4 py-3 text-center'>
                                                    {isPreadm ? (
                                                        <Badge variant='outline' className='text-xs font-normal'>
                                                            {sub.ismS_SubjectFlag || 'Written'}
                                                        </Badge>
                                                    ) : (
                                                        '--'
                                                    )}
                                                </td>
                                                <td className='px-4 py-3 text-center font-mono'>
                                                    {isPreadm ? (sub.ismS_Max_Marks ?? '-') : '--'}
                                                </td>
                                                <td className='px-4 py-3 text-center font-mono'>
                                                    {isPreadm ? (sub.ismS_Min_Marks ?? '-') : '--'}
                                                </td>

                                                {/* PreAdmission Flag */}
                                                <td className='px-3 py-3 text-center'>
                                                    {isPreadm ? (
                                                        <Check className='inline-block h-4 w-4 text-emerald-600' />
                                                    ) : (
                                                        <X className='inline-block h-4 w-4 text-rose-500' />
                                                    )}
                                                </td>

                                                {/* Attendance Flag */}
                                                <td className='px-3 py-3 text-center'>
                                                    {sub.ismS_AttendanceFlag ? (
                                                        <Check className='inline-block h-4 w-4 text-emerald-600' />
                                                    ) : (
                                                        <X className='inline-block h-4 w-4 text-rose-500' />
                                                    )}
                                                </td>

                                                {/* Batch Wise Flag */}
                                                <td className='px-3 py-3 text-center'>
                                                    {sub.ismS_BatchAppl ? (
                                                        <Check className='inline-block h-4 w-4 text-emerald-600' />
                                                    ) : (
                                                        <X className='inline-block h-4 w-4 text-rose-500' />
                                                    )}
                                                </td>

                                                {/* TimeTable Flag */}
                                                <td className='px-3 py-3 text-center'>
                                                    {sub.ismS_TTFlag ? (
                                                        <Check className='inline-block h-4 w-4 text-emerald-600' />
                                                    ) : (
                                                        <X className='inline-block h-4 w-4 text-rose-500' />
                                                    )}
                                                </td>

                                                {/* Exam Flag */}
                                                <td className='px-3 py-3 text-center'>
                                                    {sub.ismS_ExamFlag ? (
                                                        <Check className='inline-block h-4 w-4 text-emerald-600' />
                                                    ) : (
                                                        <X className='inline-block h-4 w-4 text-rose-500' />
                                                    )}
                                                </td>

                                                {/* Language Flag */}
                                                <td className='px-3 py-3 text-center'>
                                                    {sub.ismS_LanguageFlg ? (
                                                        <Check className='inline-block h-4 w-4 text-emerald-600' />
                                                    ) : (
                                                        <X className='inline-block h-4 w-4 text-rose-500' />
                                                    )}
                                                </td>

                                                {/* Extra Fee Flag */}
                                                <td className='px-3 py-3 text-center'>
                                                    {sub.ismS_AtExtraFeeFlg ? (
                                                        <Check className='inline-block h-4 w-4 text-emerald-600' />
                                                    ) : (
                                                        <X className='inline-block h-4 w-4 text-rose-500' />
                                                    )}
                                                </td>

                                                {/* Action Column */}
                                                <td className='px-4 py-3 text-center sticky right-0 bg-background/95 backdrop-blur-sm'>
                                                    <div className='flex items-center justify-center gap-2'>
                                                        <button
                                                            type='button'
                                                            onClick={() => handleEdit(sub)}
                                                            className='p-1 text-primary hover:bg-primary/10 rounded transition-colors'
                                                            title='Edit'>
                                                            <Edit className='h-4 w-4' />
                                                        </button>
                                                        <button
                                                            type='button'
                                                            onClick={() => handleToggleStatus(sub)}
                                                            className={`text-xs font-medium px-2 py-0.5 rounded transition-colors ${
                                                                isActive
                                                                    ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                                                                    : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                                                            }`}
                                                            title={isActive ? 'Deactivate' : 'Activate'}>
                                                            {isActive ? 'De-Activate' : 'Activate'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-muted/10'>
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                            <span>Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className='h-8 rounded border border-input bg-background px-2 text-xs'>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span>
                                Showing {paginatedSubjects.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                                {Math.min(currentPage * pageSize, filteredSubjects.length)} of {filteredSubjects.length} entries
                            </span>
                        </div>

                        <div className='flex items-center gap-1'>
                            <Button
                                variant='outline'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}>
                                <ChevronsLeft className='h-4 w-4' />
                            </Button>
                            <Button
                                variant='outline'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}>
                                <ChevronLeft className='h-4 w-4' />
                            </Button>
                            <span className='text-xs px-2'>
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant='outline'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}>
                                <ChevronRight className='h-4 w-4' />
                            </Button>
                            <Button
                                variant='outline'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}>
                                <ChevronsRight className='h-4 w-4' />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Set Order Modal */}
            {orderModalOpen && (
                <SetOrderModal
                    isOpen={orderModalOpen}
                    onClose={() => setOrderModalOpen(false)}
                    data={formattedOrderData}
                    onSave={handleSaveOrder}
                    isSaving={isOrderSaving}
                />
            )}
        </div>
    );
}
