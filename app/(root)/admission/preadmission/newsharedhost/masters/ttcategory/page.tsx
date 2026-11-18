'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useTTCategory } from '@/hooks/admission/preadmission/useTTCategory';
import {
    addOrUpdateTTCategory,
    deleteTTCategory,
    getTTCategoryDetails,
    toggleTTCategory
} from '@/server/admission/preadmission/newsharedhost/masters/ttcategory';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { z } from 'zod';

const formSchema = z.object({
    ttmC_Id: z.number().default(0),
    ttmC_CategoryName: z.string().min(1, 'Category Name is required').max(40, 'Max length is 40 characters')
});

type FormFields = z.infer<typeof formSchema>;

export default function TTCategoryPage() {
    const { data: response, isLoading, error, refetchAll } = useTTCategory();
    const tableProps = useDataTableProps(response);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ttmC_Id: 0,
            ttmC_CategoryName: ''
        }
    });

    const handleEdit = async (data: any) => {
        setIsFormOpen(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        try {
            const details: any = await getTTCategoryDetails(data.ttmC_Id);
            if (details?.data && Array.isArray(details.data) && details.data.length > 0) {
                const editData = details.data[0];
                setValue('ttmC_Id', editData.ttmC_Id);
                setValue('ttmC_CategoryName', editData.ttmC_CategoryName);
            } else if (
                details &&
                details.categorylistedit &&
                Array.isArray(details.categorylistedit) &&
                details.categorylistedit.length > 0
            ) {
                const editData = details.categorylistedit[0];
                setValue('ttmC_Id', editData.ttmC_Id);
                setValue('ttmC_CategoryName', editData.ttmC_CategoryName);
            } else {
                setValue('ttmC_Id', data.ttmC_Id);
                setValue('ttmC_CategoryName', data.ttmC_CategoryName);
            }
        } catch (error: any) {
            toast.error('Failed to load category details');
            console.error(error);
        }
    };

    const handleToggle = async (data: any) => {
        try {
            const res = await toggleTTCategory(data.ttmC_Id);
            // Check for both possible success keys (success or returnval) and also assume success if the message contains "success"
            const isSuccess =
                res?.success === true || res?.returnval === true || (res?.message && res.message.toLowerCase().includes('success'));

            if (res && isSuccess) {
                toast.success(res.message || 'Category status updated successfully');
                refetchAll();
            } else {
                toast.error(res?.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast.error('Failed to update category status');
            console.error(error);
        }
    };

    const handleDelete = async (data: any) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this category?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3f51b5',
            cancelButtonColor: '#ff5722',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const res = await deleteTTCategory(data.ttmC_Id);
                const isSuccess =
                    res?.success === true || res?.returnval === true || (res?.message && res.message.toLowerCase().includes('success'));

                if (res && isSuccess) {
                    toast.success(res.message || 'Category deleted successfully');
                    refetchAll();
                } else {
                    toast.error(res?.message || 'Failed to delete category');
                }
            } catch (error: any) {
                toast.error('Failed to delete category');
                console.error(error);
            }
        }
    };

    const masterCategoryColumns = useMemo(
        () => [
            {
                accessorKey: 'ttmC_Id',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title='Sl No' className='w-full pl-6 font-bold text-black' />
                ),
                cell: ({ row, table }: any) => {
                    const pageIndex = table.getState().pagination.pageIndex;
                    const pageSize = table.getState().pagination.pageSize;
                    const continuousIndex = pageIndex * pageSize + row.index + 1;
                    return <div className='w-full pl-6'>{continuousIndex}</div>;
                },
                enableSorting: false,
                enableHiding: false
            },
            {
                accessorKey: 'ttmC_CategoryName',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title='CategoryName' className='font-bold text-black' />
                ),
                cell: ({ row }: any) => <div>{row.getValue('ttmC_CategoryName')}</div>,
                enableSorting: false,
                enableHiding: true
            },
            {
                id: 'actions',
                header: ({ column }: any) => <DataTableColumnHeader column={column} title='Actions' className='font-bold text-black' />,
                accessorFn: (row: any) => row,
                enableSorting: false,
                cell: ({ row }: any) => (
                    <ActionButtons
                        rowData={row.original}
                        buttons={{ edit: true, toggle: true, delete: true }}
                        onEdit={handleEdit}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        toggleConditionKey='ttmC_ActiveFlag'
                    />
                )
            }
        ],
        [handleEdit, handleToggle, handleDelete]
    );

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                ttmC_Id: data.ttmC_Id,
                ttmC_CategoryName: data.ttmC_CategoryName,
                ttmC_ActiveFlag: true,
                createdDate: new Date().toISOString(),
                updatedDate: new Date().toISOString()
            };
            const res = await addOrUpdateTTCategory(payload);
            const isSuccess =
                res?.success === true || res?.returnval === true || (res?.message && res.message.toLowerCase().includes('success'));

            if (res && isSuccess) {
                toast.success(res.message || 'Data successfully Saved');
                handleClear();
                refetchAll();
            } else if (res?.returnduplicatestatus === 'Duplicate' || (res?.message && res.message.toLowerCase().includes('exist'))) {
                toast.error('Records Already Exist!');
            } else {
                toast.error(res?.message || 'Data Not Saved!');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const handleClear = () => {
        reset({ ttmC_Id: 0, ttmC_CategoryName: '' });
        setIsFormOpen(false);
    };

    const handleAddNew = () => {
        reset({ ttmC_Id: 0, ttmC_CategoryName: '' });
        setIsFormOpen(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <div className='min-h-screen space-y-6 p-4'>
            {/* Header Actions */}
            <div className='flex justify-end'>
                <Button
                    onClick={handleAddNew}
                    className='w-fit bg-[#3f51b5] text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-[#303f9f] hover:shadow-lg'>
                    <Plus className='mr-2 h-4 w-4' /> Add New Category
                </Button>
            </div>

            {/* Form Section */}
            {isFormOpen && (
                <div ref={formRef}>
                    <CollapsibleSection title={control._defaultValues.ttmC_Id === 0 ? 'ADD CATEGORY' : 'EDIT CATEGORY'} defaultOpen={true}>
                        <div className='relative'>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={handleClear}
                                className='-top-12 absolute right-0 text-destructive hover:bg-destructive/10'>
                                <X className='mr-2 h-4 w-4' /> Close
                            </Button>
                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 py-4'>
                                <div className='flex justify-center'>
                                    <div className='flex w-full max-w-2xl items-center gap-4'>
                                        <label className='w-1/3 whitespace-nowrap text-right font-medium text-sm'>
                                            Category Name: <span className='text-red-500'>*</span>
                                        </label>
                                        <div className='w-2/3'>
                                            <Controller
                                                name='ttmC_CategoryName'
                                                control={control}
                                                render={({ field }) => (
                                                    <InputText
                                                        {...field}
                                                        error={errors.ttmC_CategoryName?.message}
                                                        className='w-full transition-colors focus:ring-2 focus:ring-primary/20'
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className='flex justify-center gap-4 border-t pt-4'>
                                    <Button
                                        type='submit'
                                        disabled={isSubmitting}
                                        className='bg-[#3f51b5] text-white transition-all duration-200 hover:bg-[#303f9f]'
                                        isLoading={isSubmitting}>
                                        <Save className='mr-2 h-4 w-4' />
                                        SAVE
                                    </Button>
                                    <Button
                                        type='button'
                                        variant='destructive'
                                        onClick={handleClear}
                                        disabled={isSubmitting}
                                        className='bg-[#ff5722] text-white transition-all duration-200 hover:bg-[#e64a19]'>
                                        <X className='mr-2 h-4 w-4' />
                                        CANCEL
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Grid Section */}
            <CollapsibleSection title='CATEGORY DETAILS' defaultOpen={true}>
                <GenericDataTable<any>
                    {...tableProps}
                    columns={masterCategoryColumns}
                    isLoading={isLoading}
                    error={error}
                    showViewOptions={false}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading categories...'
                    noDataTitle='No Categories Found'
                    noDataDescription='No records available.'
                />
            </CollapsibleSection>
        </div>
    );
}
