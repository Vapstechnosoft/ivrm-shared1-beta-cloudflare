'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Textarea } from '@/components/ui/textarea';
import {
    ArrowUpDown,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Edit,
    GraduationCap,
    Loader2,
    RefreshCw,
    RotateCcw,
    Save,
    Search,
    SlidersHorizontal,
    X,
    XCircle
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import {
    deactivateClgExamMaster,
    editClgExamMaster,
    getClgExamMasterDetails,
    saveClgExamMaster,
    saveClgExamMasterOrder
} from './actions';
import { SetOrderModal } from './_components/set-order-modal';
import type {
    ClgExamMasterFormData,
    IClgExamOrder,
    IClgMasterExam
} from './types';

const defaultFormValues: ClgExamMasterFormData = {
    emE_Id: 0,
    emE_ExamName: '',
    emE_IVRSExamName: '',
    emE_ExamCode: '',
    emE_ExamDescription: '',
    emE_FinalExamFlag: false
};

export default function ClgExamMasterPage() {
    const [exams, setExams] = useState<IClgMasterExam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Search and Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState<string>('emE_ExamOrder');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Order Modal
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [isOrderSaving, setIsOrderSaving] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<ClgExamMasterFormData>({
        defaultValues: defaultFormValues
    });

    const emEId = watch('emE_Id');

    // Load Data
    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getClgExamMasterDetails();

            if (response.success && response.data) {
                const data = response.data;
                const list: IClgMasterExam[] =
                    data.exammastername ||
                    (Array.isArray(data) ? data : []);
                setExams(list);
            } else {
                toast.error(response.message || 'Failed to load college exam master list');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Error fetching exam master data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Handle Form Submit (Save / Update)
    const onSubmit = async (formData: ClgExamMasterFormData) => {
        try {
            setIsSaving(true);
            const payload = {
                EME_Id: formData.emE_Id ? Number(formData.emE_Id) : 0,
                EME_ExamName: formData.emE_ExamName.trim(),
                EME_IVRSExamName: formData.emE_IVRSExamName.trim(),
                EME_ExamCode: formData.emE_ExamCode.trim(),
                EME_ExamDescription: formData.emE_ExamDescription ? formData.emE_ExamDescription.trim() : '',
                EME_FinalExamFlag: Boolean(formData.emE_FinalExamFlag)
            };

            const response = await saveClgExamMaster(payload);
            const resData = response?.data;

            if (resData?.returnval === true) {
                if (resData.emE_Id === 0 || (resData.emE_Id && resData.emE_Id < 0) || !formData.emE_Id) {
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
                handleCancel();
                await loadData();
            } else if (resData?.returnduplicatestatus === 'Duplicate') {
                Swal.fire({
                    icon: 'warning',
                    title: 'Duplicate Record',
                    text: 'Record already exist'
                });
            } else {
                const msg =
                    formData.emE_Id > 0
                        ? 'Failed to update, please contact administrator'
                        : 'Failed to save, please contact administrator';
                Swal.fire({
                    icon: 'error',
                    title: 'Failed',
                    text: response?.message || msg
                });
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error saving exam master record');
        } finally {
            setIsSaving(false);
        }
    };

    // Cancel / Reset Form
    const handleCancel = () => {
        reset(defaultFormValues);
    };

    // Edit Record
    const handleEdit = async (item: IClgMasterExam) => {
        try {
            const res = await editClgExamMaster(item.emE_Id);
            if (res.success && res.data?.editlist && res.data.editlist.length > 0) {
                const editItem = res.data.editlist[0];
                setValue('emE_Id', editItem.emE_Id);
                setValue('emE_ExamName', editItem.emE_ExamName || '');
                setValue('emE_IVRSExamName', editItem.emE_IVRSExamName || '');
                setValue('emE_ExamCode', editItem.emE_ExamCode || '');
                setValue('emE_ExamDescription', editItem.emE_ExamDescription || '');
                setValue('emE_FinalExamFlag', Boolean(editItem.emE_FinalExamFlag));
            } else {
                // Fallback to item directly
                setValue('emE_Id', item.emE_Id);
                setValue('emE_ExamName', item.emE_ExamName || '');
                setValue('emE_IVRSExamName', item.emE_IVRSExamName || '');
                setValue('emE_ExamCode', item.emE_ExamCode || '');
                setValue('emE_ExamDescription', item.emE_ExamDescription || '');
                setValue('emE_FinalExamFlag', Boolean(item.emE_FinalExamFlag));
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            toast.error(err?.message || 'Error fetching record for editing');
            setValue('emE_Id', item.emE_Id);
            setValue('emE_ExamName', item.emE_ExamName || '');
            setValue('emE_IVRSExamName', item.emE_IVRSExamName || '');
            setValue('emE_ExamCode', item.emE_ExamCode || '');
            setValue('emE_ExamDescription', item.emE_ExamDescription || '');
            setValue('emE_FinalExamFlag', Boolean(item.emE_FinalExamFlag));
        }
    };

    // Toggle Active / Deactivate
    const handleToggleActive = async (item: IClgMasterExam) => {
        const isActive = item.emE_ActiveFlag === true || item.emE_ActiveFlag === 1;
        const isFinalExam = item.emE_FinalExamFlag === true || item.emE_FinalExamFlag === 1;

        if (isFinalExam && isActive) {
            Swal.fire({
                icon: 'warning',
                title: 'Operation Restricted',
                text: 'You Can Not Deactivate Final Exam Record'
            });
            return;
        }

        const actionText = isActive ? 'Deactivate' : 'Activate';
        const pastActionText = isActive ? 'De-activated' : 'Activated';

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${actionText} record?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isActive ? '#d33' : '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Yes, ${actionText} it!`
        });

        if (!result.isConfirmed) {
            Swal.fire({
                icon: 'info',
                title: 'Cancelled',
                text: `Record ${actionText} Cancelled`
            });
            return;
        }

        try {
            const response = await deactivateClgExamMaster(item);
            const resData = response?.data;

            if (resData?.already_cnt === true) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Dependency Warning',
                    text: 'You Can Not Deactivate This Record, It Has Dependency'
                });
            } else if (resData?.returnval === true) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: `Record ${pastActionText} successfully`
                });
                handleCancel();
                await loadData();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed',
                    text: `Record ${actionText} Failed`
                });
            }
        } catch (err: any) {
            toast.error(err?.message || `Error updating exam status`);
        }
    };

    // Set Order Save
    const handleOrderSave = async (updatedList: IClgExamOrder[]) => {
        try {
            setIsOrderSaving(true);
            const response = await saveClgExamMasterOrder(updatedList);
            const resData = response?.data;

            if (resData?.retrunMsg) {
                Swal.fire({
                    icon: 'info',
                    title: 'Set Order',
                    text: resData.retrunMsg
                });
            } else {
                toast.success('Order updated successfully');
            }

            setOrderModalOpen(false);
            handleCancel();
            await loadData();
        } catch (err: any) {
            toast.error(err?.message || 'Error updating exam order');
        } finally {
            setIsOrderSaving(false);
        }
    };

    // Filter & Sort for Data Grid
    const filteredExams = useMemo(() => {
        let list = [...exams];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter((item) => {
                const name = (item.emE_ExamName || '').toLowerCase();
                const ivrs = (item.emE_IVRSExamName || '').toLowerCase();
                const code = (item.emE_ExamCode || '').toLowerCase();
                const desc = (item.emE_ExamDescription || '').toLowerCase();
                const order = String(item.emE_ExamOrder ?? '').toLowerCase();
                return (
                    name.includes(q) ||
                    ivrs.includes(q) ||
                    code.includes(q) ||
                    desc.includes(q) ||
                    order.includes(q)
                );
            });
        }

        list.sort((a: any, b: any) => {
            const valA = a[sortColumn] ?? '';
            const valB = b[sortColumn] ?? '';

            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortDirection === 'asc' ? valA - valB : valB - valA;
            }

            const comp = String(valA).localeCompare(String(valB));
            return sortDirection === 'asc' ? comp : -comp;
        });

        return list;
    }, [exams, searchQuery, sortColumn, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredExams.length / pageSize) || 1;
    const paginatedExams = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredExams.slice(start, start + pageSize);
    }, [filteredExams, currentPage, pageSize]);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Order Data preparation
    const orderDataList: IClgExamOrder[] = useMemo(() => {
        return exams.map((item) => ({
            ...item,
            id: item.emE_Id
        }));
    }, [exams]);

    return (
        <div className='min-h-screen p-4 sm:p-6 lg:p-8 space-y-6'>
            {/* Page Header */}
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-2 border-b'>
                <div>
                    <h1 className='text-2xl font-bold tracking-tight text-foreground'>
                        College Exam Master
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Define college examinations, configure IVRS codes, manage final exam flags, and customize display order
                    </p>
                </div>

                <div className='flex items-center gap-2'>
                    <button
                        type='button'
                        onClick={() => loadData()}
                        disabled={isLoading}
                        className='inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-muted transition-colors disabled:opacity-50'>
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Exam Master Entry Form */}
            <Card className='border shadow-sm'>
                <CardHeader className='pb-4 border-b bg-muted/20'>
                    <CardTitle className='text-base font-semibold flex items-center gap-2'>
                        <GraduationCap className='h-4 w-4 text-primary' />
                        <span>{emEId > 0 ? 'Edit Exam Master' : 'Exam Master'}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className='pt-6'>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='max-w-2xl mx-auto space-y-5'>
                            {/* Exam Name */}
                            <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4'>
                                <Label htmlFor='emE_ExamName' className='sm:w-1/3 text-sm font-medium sm:text-right'>
                                    Exam Name <span className='text-destructive'>*</span>
                                </Label>
                                <div className='sm:w-2/3'>
                                    <InputText
                                        id='emE_ExamName'
                                        placeholder='Enter Exam Name'
                                        maxLength={100}
                                        {...register('emE_ExamName', {
                                            required: 'Enter Exam Name'
                                        })}
                                    />
                                    {errors.emE_ExamName && (
                                        <FormError>{errors.emE_ExamName.message}</FormError>
                                    )}
                                </div>
                            </div>

                            {/* IVRS Exam Name */}
                            <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4'>
                                <Label htmlFor='emE_IVRSExamName' className='sm:w-1/3 text-sm font-medium sm:text-right'>
                                    IVRS Exam Name <span className='text-destructive'>*</span>
                                </Label>
                                <div className='sm:w-2/3'>
                                    <InputText
                                        id='emE_IVRSExamName'
                                        placeholder='Enter IVRS Exam Name'
                                        maxLength={100}
                                        {...register('emE_IVRSExamName', {
                                            required: 'Enter IVRS Exam Name'
                                        })}
                                    />
                                    {errors.emE_IVRSExamName && (
                                        <FormError>{errors.emE_IVRSExamName.message}</FormError>
                                    )}
                                </div>
                            </div>

                            {/* Exam Code */}
                            <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4'>
                                <Label htmlFor='emE_ExamCode' className='sm:w-1/3 text-sm font-medium sm:text-right'>
                                    Exam Code <span className='text-destructive'>*</span>
                                </Label>
                                <div className='sm:w-2/3'>
                                    <InputText
                                        id='emE_ExamCode'
                                        placeholder='Enter Exam Code'
                                        maxLength={100}
                                        {...register('emE_ExamCode', {
                                            required: 'Enter Exam Code'
                                        })}
                                    />
                                    {errors.emE_ExamCode && (
                                        <FormError>{errors.emE_ExamCode.message}</FormError>
                                    )}
                                </div>
                            </div>

                            {/* Exam Description */}
                            <div className='flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4'>
                                <Label htmlFor='emE_ExamDescription' className='sm:w-1/3 text-sm font-medium sm:text-right pt-2'>
                                    Exam Description
                                </Label>
                                <div className='sm:w-2/3'>
                                    <Textarea
                                        id='emE_ExamDescription'
                                        placeholder='Enter Exam Description'
                                        rows={3}
                                        maxLength={1000}
                                        {...register('emE_ExamDescription')}
                                    />
                                </div>
                            </div>

                            {/* Final-Exam Flag */}
                            <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4'>
                                <div className='sm:w-1/3' />
                                <div className='sm:w-2/3'>
                                    <Controller
                                        name='emE_FinalExamFlag'
                                        control={control}
                                        render={({ field }) => (
                                            <div className='flex items-center space-x-2'>
                                                <Checkbox
                                                    id='emE_FinalExamFlag'
                                                    checked={Boolean(field.value)}
                                                    onCheckedChange={field.onChange}
                                                />
                                                <label
                                                    htmlFor='emE_FinalExamFlag'
                                                    className='text-sm font-medium leading-none cursor-pointer select-none text-foreground'>
                                                    Final-Exam Flag
                                                </label>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form Action Buttons */}
                        <div className='flex flex-wrap items-center justify-center gap-3 pt-4 border-t'>
                            <Button
                                type='submit'
                                disabled={isSaving}
                                className='min-w-[100px] gap-2'>
                                {isSaving ? (
                                    <>
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className='h-4 w-4' />
                                        <span>{emEId > 0 ? 'Update' : 'Save'}</span>
                                    </>
                                )}
                            </Button>

                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleCancel}
                                disabled={isSaving}
                                className='min-w-[100px] gap-2'>
                                <RotateCcw className='h-4 w-4' />
                                <span>Cancel</span>
                            </Button>

                            <Button
                                type='button'
                                variant='secondary'
                                onClick={() => setOrderModalOpen(true)}
                                disabled={exams.length === 0 || isSaving}
                                className='gap-2'>
                                <SlidersHorizontal className='h-4 w-4' />
                                <span>Set Order</span>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Exam Master Details List Grid */}
            <Card className='border shadow-sm'>
                <CardHeader className='pb-4 border-b bg-muted/20'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                        <CardTitle className='text-base font-semibold'>
                            Exam Master Details
                        </CardTitle>

                        {/* Search & Page Size Controls */}
                        <div className='flex flex-wrap items-center gap-3'>
                            <div className='relative w-full sm:w-64'>
                                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                                <input
                                    type='text'
                                    placeholder='Search exams...'
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className='w-full pl-9 pr-4 py-1.5 text-xs bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-primary shadow-xs'
                                />
                            </div>

                            <div className='flex items-center gap-1.5'>
                                <span className='text-xs text-muted-foreground whitespace-nowrap'>Page Size:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className='text-xs border rounded-md px-2 py-1.5 bg-background shadow-xs focus:outline-none focus:ring-1 focus:ring-primary'>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className='p-0'>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-xs text-left border-collapse'>
                            <thead>
                                <tr className='border-b bg-muted/40 font-semibold text-muted-foreground select-none'>
                                    <th className='py-3 px-4 text-center w-14'>SL NO</th>
                                    <th
                                        className='py-3 px-4 cursor-pointer hover:text-foreground transition-colors'
                                        onClick={() => handleSort('emE_ExamName')}>
                                        <div className='flex items-center gap-1.5'>
                                            <span>Exam Name</span>
                                            <ArrowUpDown className='h-3 w-3' />
                                        </div>
                                    </th>
                                    <th
                                        className='py-3 px-4 cursor-pointer hover:text-foreground transition-colors'
                                        onClick={() => handleSort('emE_IVRSExamName')}>
                                        <div className='flex items-center gap-1.5'>
                                            <span>IVRS Exam Name</span>
                                            <ArrowUpDown className='h-3 w-3' />
                                        </div>
                                    </th>
                                    <th
                                        className='py-3 px-4 cursor-pointer hover:text-foreground transition-colors'
                                        onClick={() => handleSort('emE_ExamDescription')}>
                                        <div className='flex items-center gap-1.5'>
                                            <span>Exam Description</span>
                                            <ArrowUpDown className='h-3 w-3' />
                                        </div>
                                    </th>
                                    <th
                                        className='py-3 px-4 cursor-pointer hover:text-foreground transition-colors'
                                        onClick={() => handleSort('emE_ExamCode')}>
                                        <div className='flex items-center gap-1.5'>
                                            <span>Exam Code</span>
                                            <ArrowUpDown className='h-3 w-3' />
                                        </div>
                                    </th>
                                    <th
                                        className='py-3 px-4 text-center cursor-pointer hover:text-foreground transition-colors w-28'
                                        onClick={() => handleSort('emE_ExamOrder')}>
                                        <div className='flex items-center justify-center gap-1.5'>
                                            <span>Exam Order</span>
                                            <ArrowUpDown className='h-3 w-3' />
                                        </div>
                                    </th>
                                    <th className='py-3 px-4 text-center w-28'>Final-Exam Flag</th>
                                    <th className='py-3 px-4 text-center w-28'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y'>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className='py-12 text-center text-muted-foreground'>
                                            <div className='flex flex-col items-center justify-center gap-2'>
                                                <Loader2 className='h-6 w-6 animate-spin text-primary' />
                                                <span>Loading exams...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedExams.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className='py-10 text-center text-muted-foreground'>
                                            No Exam Master records found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedExams.map((item, idx) => {
                                        const slNo = (currentPage - 1) * pageSize + idx + 1;
                                        const isActive = item.emE_ActiveFlag === true || item.emE_ActiveFlag === 1;
                                        const isFinal = item.emE_FinalExamFlag === true || item.emE_FinalExamFlag === 1;

                                        return (
                                            <tr key={item.emE_Id || idx} className='hover:bg-muted/30 transition-colors'>
                                                <td className='py-3 px-4 text-center font-medium'>{slNo}</td>
                                                <td className='py-3 px-4 font-medium text-foreground'>
                                                    {item.emE_ExamName || '--'}
                                                </td>
                                                <td className='py-3 px-4 text-muted-foreground'>
                                                    {item.emE_IVRSExamName || '--'}
                                                </td>
                                                <td className='py-3 px-4 text-muted-foreground max-w-xs truncate'>
                                                    {item.emE_ExamDescription || '--'}
                                                </td>
                                                <td className='py-3 px-4 text-muted-foreground'>
                                                    <Badge variant='outline' className='font-mono text-[11px]'>
                                                        {item.emE_ExamCode || '--'}
                                                    </Badge>
                                                </td>
                                                <td className='py-3 px-4 text-center font-semibold'>
                                                    {item.emE_ExamOrder ?? '--'}
                                                </td>
                                                <td className='py-3 px-4 text-center'>
                                                    {isFinal ? (
                                                        <span className='inline-flex items-center justify-center text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 p-1 rounded-full'>
                                                            <Check className='h-3.5 w-3.5 stroke-[2.5]' />
                                                        </span>
                                                    ) : (
                                                        <span className='inline-flex items-center justify-center text-destructive bg-destructive/10 p-1 rounded-full'>
                                                            <X className='h-3.5 w-3.5 stroke-[2.5]' />
                                                        </span>
                                                    )}
                                                </td>
                                                <td className='py-3 px-4 text-center'>
                                                    <div className='flex items-center justify-center gap-2'>
                                                        {/* Edit Button */}
                                                        <button
                                                            type='button'
                                                            onClick={() => handleEdit(item)}
                                                            className='p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors'
                                                            title='Edit'>
                                                            <Edit className='h-4 w-4' />
                                                        </button>

                                                        {/* Toggle Active/Deactivate Button */}
                                                        <button
                                                            type='button'
                                                            onClick={() => handleToggleActive(item)}
                                                            className={`p-1.5 rounded-md transition-colors ${
                                                                isActive
                                                                    ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                                                    : 'text-destructive hover:bg-destructive/10'
                                                            }`}
                                                            title={isActive ? 'Deactivate Now' : 'Activate Now'}>
                                                            {isActive ? (
                                                                <CheckCircle2 className='h-4 w-4' />
                                                            ) : (
                                                                <XCircle className='h-4 w-4' />
                                                            )}
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

                    {/* Pagination Footer */}
                    {!isLoading && filteredExams.length > 0 && (
                        <div className='flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t bg-muted/10 text-xs text-muted-foreground'>
                            <div>
                                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                                {Math.min(currentPage * pageSize, filteredExams.length)} of{' '}
                                {filteredExams.length} entries
                            </div>

                            <div className='flex items-center gap-1'>
                                <button
                                    type='button'
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className='p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:pointer-events-none'>
                                    <ChevronsLeft className='h-4 w-4' />
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className='p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:pointer-events-none'>
                                    <ChevronLeft className='h-4 w-4' />
                                </button>

                                <span className='px-2 font-medium text-foreground'>
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    type='button'
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className='p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:pointer-events-none'>
                                    <ChevronRight className='h-4 w-4' />
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className='p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:pointer-events-none'>
                                    <ChevronsRight className='h-4 w-4' />
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Set Order Modal */}
            <SetOrderModal
                isOpen={orderModalOpen}
                onClose={() => setOrderModalOpen(false)}
                data={orderDataList}
                onSave={handleOrderSave}
                isLoading={isLoading}
                isSaving={isOrderSaving}
            />
        </div>
    );
}
