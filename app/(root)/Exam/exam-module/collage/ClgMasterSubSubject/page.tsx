'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import {
    ArrowUpDown,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Edit,
    Layers,
    Loader2,
    Power,
    RefreshCw,
    RotateCcw,
    Save,
    Search,
    SlidersHorizontal,
    XCircle
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import {
    deactivateClgMasterSubSubject,
    editClgMasterSubSubject,
    getClgMasterSubSubjectDetails,
    saveClgMasterSubSubject,
    saveClgMasterSubSubjectOrder
} from './actions';
import { SetOrderModal } from './_components/set-order-modal';
import type {
    ClgMasterSubSubjectFormData,
    IClgMasterSubSubject,
    IClgSubSubjectOrder
} from './types';

const defaultFormValues: ClgMasterSubSubjectFormData = {
    emsS_Id: 0,
    emsS_SubSubjectName: '',
    emsS_SubSubjectCode: ''
};

export default function ClgMasterSubSubjectPage() {
    const [subSubjects, setSubSubjects] = useState<IClgMasterSubSubject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Search and Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState<string>('emsS_Order');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Order Modal
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [isOrderSaving, setIsOrderSaving] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<ClgMasterSubSubjectFormData>({
        defaultValues: defaultFormValues
    });

    const emsSId = watch('emsS_Id');

    // Load Data
    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getClgMasterSubSubjectDetails();

            if (response.success && response.data) {
                const data = response.data;
                const list: IClgMasterSubSubject[] =
                    data.getlist ||
                    data.mastersubsubject ||
                    (Array.isArray(data) ? data : []);
                setSubSubjects(list);
            } else {
                toast.error(response.message || 'Failed to load master sub-subjects');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Error fetching master sub-subject data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Handle Form Submit (Save / Update)
    const onSubmit = async (formData: ClgMasterSubSubjectFormData) => {
        try {
            setIsSaving(true);
            const payload = {
                emsS_Id: formData.emsS_Id ? Number(formData.emsS_Id) : 0,
                EMSS_SubSubjectName: formData.emsS_SubSubjectName.trim(),
                EMSS_SubSubjectCode: formData.emsS_SubSubjectCode.trim()
            };

            const response = await saveClgMasterSubSubject(payload);
            const resData = response?.data;

            if (resData?.returnval === true) {
                if (resData.emsS_Id === 0 || (resData.emsS_Id && resData.emsS_Id < 0) || !formData.emsS_Id) {
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
                    formData.emsS_Id > 0
                        ? 'Failed to update, please contact administrator'
                        : 'Failed to save, please contact administrator';
                Swal.fire({
                    icon: 'error',
                    title: 'Failed',
                    text: response?.message || msg
                });
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error saving master sub-subject');
        } finally {
            setIsSaving(false);
        }
    };

    // Cancel / Reset Form
    const handleCancel = () => {
        reset(defaultFormValues);
    };

    // Edit Record
    const handleEdit = async (item: IClgMasterSubSubject) => {
        try {
            const res = await editClgMasterSubSubject(item.emsS_Id);
            if (res.success && res.data?.editlist && res.data.editlist.length > 0) {
                const editItem = res.data.editlist[0];
                setValue('emsS_Id', editItem.emsS_Id);
                setValue('emsS_SubSubjectName', editItem.emsS_SubSubjectName || '');
                setValue('emsS_SubSubjectCode', editItem.emsS_SubSubjectCode || '');
            } else {
                // Fallback to item directly
                setValue('emsS_Id', item.emsS_Id);
                setValue('emsS_SubSubjectName', item.emsS_SubSubjectName || '');
                setValue('emsS_SubSubjectCode', item.emsS_SubSubjectCode || '');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            toast.error(err?.message || 'Error fetching record for editing');
            setValue('emsS_Id', item.emsS_Id);
            setValue('emsS_SubSubjectName', item.emsS_SubSubjectName || '');
            setValue('emsS_SubSubjectCode', item.emsS_SubSubjectCode || '');
        }
    };

    // Toggle Active / Deactivate
    const handleToggleActive = async (item: IClgMasterSubSubject) => {
        const isActive = item.emsS_ActiveFlag === true || item.emsS_ActiveFlag === 1;
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
            const response = await deactivateClgMasterSubSubject(item);
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
            toast.error(err?.message || `Error updating status`);
        }
    };

    // Set Order Save
    const handleOrderSave = async (updatedList: IClgSubSubjectOrder[]) => {
        try {
            setIsOrderSaving(true);
            const response = await saveClgMasterSubSubjectOrder(updatedList);
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
            toast.error(err?.message || 'Error updating subject order');
        } finally {
            setIsOrderSaving(false);
        }
    };

    // Filter & Sort for Data Grid
    const filteredSubSubjects = useMemo(() => {
        let list = [...subSubjects];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter((item) => {
                const name = (item.emsS_SubSubjectName || '').toLowerCase();
                const code = (item.emsS_SubSubjectCode || '').toLowerCase();
                const order = String(item.emsS_Order ?? '').toLowerCase();
                return name.includes(q) || code.includes(q) || order.includes(q);
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
    }, [subSubjects, searchQuery, sortColumn, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredSubSubjects.length / pageSize) || 1;
    const paginatedSubSubjects = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredSubSubjects.slice(start, start + pageSize);
    }, [filteredSubSubjects, currentPage, pageSize]);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Order Data preparation
    const orderDataList: IClgSubSubjectOrder[] = useMemo(() => {
        return subSubjects.map((item) => ({
            ...item,
            id: item.emsS_Id
        }));
    }, [subSubjects]);

    return (
        <div className='min-h-screen p-4 sm:p-6 lg:p-8 space-y-6'>
            {/* Page Header */}
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-2 border-b'>
                <div>
                    <h1 className='text-2xl font-bold tracking-tight text-foreground'>
                        College Master Sub-Subject
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Configure college sub-subjects, manage display orders, and toggle active status
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

            {/* Master Sub-Subject Entry Form */}
            <Card className='border shadow-sm'>
                <CardHeader className='pb-4 border-b bg-muted/20'>
                    <CardTitle className='text-base font-semibold flex items-center gap-2'>
                        <Layers className='h-4 w-4 text-primary' />
                        <span>{emsSId > 0 ? 'Edit Master Sub-Subject' : 'Master Sub-Subject'}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className='pt-6'>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='max-w-2xl mx-auto space-y-5'>
                            {/* Sub-Subject Name */}
                            <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4'>
                                <Label htmlFor='emsS_SubSubjectName' className='sm:w-1/3 text-sm font-medium sm:text-right'>
                                    Sub-Subject Name <span className='text-destructive'>*</span>
                                </Label>
                                <div className='sm:w-2/3'>
                                    <InputText
                                        id='emsS_SubSubjectName'
                                        placeholder='Enter Sub-Subject Name'
                                        maxLength={100}
                                        {...register('emsS_SubSubjectName', {
                                            required: 'Enter Sub-Subject Name'
                                        })}
                                    />
                                    {errors.emsS_SubSubjectName && (
                                        <FormError message={errors.emsS_SubSubjectName.message} />
                                    )}
                                </div>
                            </div>

                            {/* Sub-Subject Code */}
                            <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4'>
                                <Label htmlFor='emsS_SubSubjectCode' className='sm:w-1/3 text-sm font-medium sm:text-right'>
                                    Sub-Subject Code <span className='text-destructive'>*</span>
                                </Label>
                                <div className='sm:w-2/3'>
                                    <InputText
                                        id='emsS_SubSubjectCode'
                                        placeholder='Enter Sub-Subject Code'
                                        maxLength={100}
                                        {...register('emsS_SubSubjectCode', {
                                            required: 'Enter Sub-Subject Code'
                                        })}
                                    />
                                    {errors.emsS_SubSubjectCode && (
                                        <FormError message={errors.emsS_SubSubjectCode.message} />
                                    )}
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
                                        <span>{emsSId > 0 ? 'Update' : 'Save'}</span>
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
                                disabled={subSubjects.length === 0 || isSaving}
                                className='gap-2'>
                                <SlidersHorizontal className='h-4 w-4' />
                                <span>Set Order</span>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Master Sub-Subject List Grid */}
            <Card className='border shadow-sm'>
                <CardHeader className='pb-4 border-b bg-muted/20'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                        <CardTitle className='text-base font-semibold'>
                            Master Sub-Subject List
                        </CardTitle>

                        {/* Search & Page Size Controls */}
                        <div className='flex flex-wrap items-center gap-3'>
                            <div className='relative w-full sm:w-64'>
                                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                                <input
                                    type='text'
                                    placeholder='Search sub-subjects...'
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
                                        onClick={() => handleSort('emsS_SubSubjectName')}>
                                        <div className='flex items-center gap-1.5'>
                                            <span>Sub-Subject Name</span>
                                            <ArrowUpDown className='h-3 w-3' />
                                        </div>
                                    </th>
                                    <th
                                        className='py-3 px-4 cursor-pointer hover:text-foreground transition-colors'
                                        onClick={() => handleSort('emsS_SubSubjectCode')}>
                                        <div className='flex items-center gap-1.5'>
                                            <span>Sub-Subject Code</span>
                                            <ArrowUpDown className='h-3 w-3' />
                                        </div>
                                    </th>
                                    <th
                                        className='py-3 px-4 text-center cursor-pointer hover:text-foreground transition-colors w-32'
                                        onClick={() => handleSort('emsS_Order')}>
                                        <div className='flex items-center justify-center gap-1.5'>
                                            <span>Sub-Subject Order</span>
                                            <ArrowUpDown className='h-3 w-3' />
                                        </div>
                                    </th>
                                    <th className='py-3 px-4 text-center w-28'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y'>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className='py-12 text-center text-muted-foreground'>
                                            <div className='flex flex-col items-center justify-center gap-2'>
                                                <Loader2 className='h-6 w-6 animate-spin text-primary' />
                                                <span>Loading sub-subjects...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedSubSubjects.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className='py-10 text-center text-muted-foreground'>
                                            No Master Sub-Subject records found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedSubSubjects.map((item, idx) => {
                                        const slNo = (currentPage - 1) * pageSize + idx + 1;
                                        const isActive = item.emsS_ActiveFlag === true || item.emsS_ActiveFlag === 1;

                                        return (
                                            <tr key={item.emsS_Id || idx} className='hover:bg-muted/30 transition-colors'>
                                                <td className='py-3 px-4 text-center font-medium'>{slNo}</td>
                                                <td className='py-3 px-4 font-medium text-foreground'>
                                                    {item.emsS_SubSubjectName || '--'}
                                                </td>
                                                <td className='py-3 px-4 text-muted-foreground'>
                                                    <Badge variant='outline' className='font-mono text-[11px]'>
                                                        {item.emsS_SubSubjectCode || '--'}
                                                    </Badge>
                                                </td>
                                                <td className='py-3 px-4 text-center font-semibold'>
                                                    {item.emsS_Order ?? '--'}
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
                    {!isLoading && filteredSubSubjects.length > 0 && (
                        <div className='flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t bg-muted/10 text-xs text-muted-foreground'>
                            <div>
                                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                                {Math.min(currentPage * pageSize, filteredSubSubjects.length)} of{' '}
                                {filteredSubSubjects.length} entries
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
