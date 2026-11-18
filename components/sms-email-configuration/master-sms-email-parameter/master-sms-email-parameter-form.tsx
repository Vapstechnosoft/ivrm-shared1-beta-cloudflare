'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, List, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';

import {
    deleteMasterSmsEmailParameter,
    editMasterSmsEmailParameter,
    getMasterSmsEmailParameters,
    saveMasterSmsEmailParameter
} from '@/server/sms-email-configuration/master-sms-email-parameter';
import type { MasterSmsEmailParameter } from '@/types/sms-email-configuration/master-sms-email-parameter';

const formSchema = z.object({
    ISMP_ID: z.number(),
    ISMP_NAME: z.string().min(1, 'Enter Parameter Name').max(20, 'Max 20 characters allowed'),
    ISMP_Query: z.string().min(1, 'Enter Query').max(200, 'Max 200 characters allowed'),
    ISMP_ParameterDesc: z.string().min(1, 'Enter Description').max(25, 'Max 25 characters allowed')
});

export function MasterSmsEmailParameterForm() {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ISMP_ID: 0,
            ISMP_NAME: '',
            ISMP_Query: '',
            ISMP_ParameterDesc: ''
        }
    });

    const { data: initialData, isLoading } = useQuery({
        queryKey: ['masterSmsEmailParameters'],
        queryFn: getMasterSmsEmailParameters
    });

    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));

    const [currentPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withDefault(1));

    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withDefault(10));

    const allParameters = useMemo(() => {
        return (initialData?.data as MasterSmsEmailParameter[]) || [];
    }, [initialData]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return allParameters;
        const lowerQuery = searchQuery.toLowerCase();
        return allParameters.filter(
            (item) =>
                item.ismP_NAME?.toLowerCase().includes(lowerQuery) ||
                item.ismP_ParameterDesc?.toLowerCase().includes(lowerQuery) ||
                item.ismP_Query?.toLowerCase().includes(lowerQuery)
        );
    }, [allParameters, searchQuery]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredData.slice(startIndex, startIndex + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const saveMutation = useMutation({
        mutationFn: saveMasterSmsEmailParameter,
        onSuccess: (data) => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: data.message || 'Record Saved Successfully'
                });
                handleClear();
                setShowForm(false);
                queryClient.invalidateQueries({ queryKey: ['masterSmsEmailParameters'] });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Record Failed To Save'
                });
            }
        },
        onError: (error) => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to save record.'
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteMasterSmsEmailParameter,
        onSuccess: (data) => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: data.message || 'Record Deleted Successfully'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'You Can Not Delete This Record It Is Already Mapped With Student'
                });
            }
            queryClient.invalidateQueries({ queryKey: ['masterSmsEmailParameters'] });
        },
        onError: (error) => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete record.'
            });
        }
    });

    const handleEdit = async (record: MasterSmsEmailParameter) => {
        try {
            const response = await editMasterSmsEmailParameter(record);
            const res = response as any;
            if (res && res.data && res.data.length > 0) {
                const editData = res.data[0];
                form.setValue('ISMP_ID', editData.ismP_ID);
                form.setValue('ISMP_NAME', editData.ismP_NAME);
                form.setValue('ISMP_Query', editData.ismP_Query);
                form.setValue('ISMP_ParameterDesc', editData.ismP_ParameterDesc);
                setIsEditing(true);
                setShowForm(true);
            }
        } catch (error) {
            console.error('Error editing record:', error);
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Are You Sure?',
            text: 'Do You Want To Delete The Record ..!?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, Delete It!',
            cancelButtonText: 'Cancel..!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(id);
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Cancelled',
                    text: 'Deletion Cancelled'
                });
            }
        });
    };

    const handleClear = () => {
        form.reset();
        setIsEditing(false);
    };

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        saveMutation.mutate({
            ismP_ID: values.ISMP_ID,
            ismP_NAME: values.ISMP_NAME,
            ismP_Query: values.ISMP_Query,
            ismP_ParameterDesc: values.ISMP_ParameterDesc
        });
    };

    const columns: ColumnDef<MasterSmsEmailParameter>[] = [
        {
            id: 'slno',
            header: () => <div className='text-center font-bold'>SL.NO</div>,
            cell: ({ row }) => <div className='text-center'>{(currentPage - 1) * pageSize + row.index + 1}</div>
        },
        {
            accessorKey: 'ismP_NAME',
            header: () => <div className='text-center font-bold'>PARAMETER NAME</div>
        },
        {
            accessorKey: 'ismP_ParameterDesc',
            header: () => <div className='text-center font-bold'>DESCRIPTION</div>
        },
        {
            accessorKey: 'ismP_Query',
            header: () => <div className='text-center font-bold'>QUERY</div>
        },
        {
            id: 'actions',
            header: () => <div className='text-center font-bold'>ACTION</div>,
            cell: ({ row }) => (
                <div className='flex items-center justify-center gap-4'>
                    <button
                        onClick={() => handleEdit(row.original)}
                        className='text-primary transition-colors hover:text-primary/80'
                        title='Edit'>
                        <Edit2 className='h-4 w-4' />
                    </button>
                    <button
                        onClick={() => handleDelete(row.original.ismP_ID)}
                        className='text-destructive transition-colors hover:text-destructive/80'
                        title='Delete'>
                        <Trash2 className='h-4 w-4' />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className='space-y-6'>
            {showForm && (
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between border-border/50 border-b'>
                        <CardTitle>{isEditing ? 'EDIT SMS/EMAIL PARAMETER' : 'ADD SMS/EMAIL PARAMETER'}</CardTitle>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                                setShowForm(false);
                                handleClear();
                            }}>
                            <List className='mr-2 h-4 w-4' />
                            View List
                        </Button>
                    </CardHeader>
                    <CardContent className='pt-6'>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                                <div className='mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2'>
                                    <div className='col-span-1 space-y-4 md:col-span-2'>
                                        <FormField
                                            control={form.control}
                                            name='ISMP_NAME'
                                            render={({ field }) => (
                                                <FormItem className='grid grid-cols-3 items-center gap-4 space-y-0'>
                                                    <FormLabel className='text-right'>
                                                        Parameter:<span className='text-destructive'>*</span>
                                                    </FormLabel>
                                                    <FormControl className='col-span-2'>
                                                        <Input
                                                            {...field}
                                                            maxLength={20}
                                                            // allow-pattern="([a-zA-Z0-9[\]_-])" handled by zod or manual typing if needed, keeping simple here
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/[^a-zA-Z0-9[\]_-]/g, '');
                                                                field.onChange(value);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className='col-span-2 col-start-2' />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='ISMP_Query'
                                            render={({ field }) => (
                                                <FormItem className='grid grid-cols-3 items-start gap-4 space-y-0'>
                                                    <FormLabel className='mt-2 text-right'>
                                                        Query:<span className='text-destructive'>*</span>
                                                    </FormLabel>
                                                    <FormControl className='col-span-2'>
                                                        <Textarea {...field} rows={4} maxLength={200} />
                                                    </FormControl>
                                                    <FormMessage className='col-span-2 col-start-2' />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='ISMP_ParameterDesc'
                                            render={({ field }) => (
                                                <FormItem className='grid grid-cols-3 items-start gap-4 space-y-0'>
                                                    <FormLabel className='mt-2 text-right'>
                                                        Description:<span className='text-destructive'>*</span>
                                                    </FormLabel>
                                                    <FormControl className='col-span-2'>
                                                        <Textarea {...field} rows={6} maxLength={25} />
                                                    </FormControl>
                                                    <FormMessage className='col-span-2 col-start-2' />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className='flex justify-center gap-4 border-border/50 border-t pt-4'>
                                    <Button type='submit' disabled={saveMutation.isPending}>
                                        <i className='fa fa-floppy-o mr-2' aria-hidden='true'></i>
                                        Save
                                    </Button>
                                    <Button type='button' variant='destructive' onClick={handleClear}>
                                        <i className='fa fa-times mr-2' aria-hidden='true'></i>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            )}

            {!showForm && (
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between border-border/50 border-b'>
                        <CardTitle>SMS/EMAIL PARAMETER LIST</CardTitle>
                        <Button onClick={() => setShowForm(true)} size='sm'>
                            <Plus className='mr-2 h-4 w-4' />
                            Add New
                        </Button>
                    </CardHeader>
                    <CardContent className='pt-6'>
                        <DataTable columns={columns as any} data={paginatedData} totalItems={filteredData.length} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
