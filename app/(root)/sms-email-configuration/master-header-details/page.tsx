'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useDeleteMasterHeaderDetails,
    useGetSelectedRowDetails,
    useMasterHeaderDetailsData,
    useModulePage,
    useSaveMasterHeaderDetails
} from '@/hooks/sms-email-configuration/useMasterHeaderDetails';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { HeaderData } from '@/types/sms-email-configuration/master-header-details';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import React, { useState } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import * as z from 'zod';

const formSchema = z.object({
    IVRMHE_Id: z.number().default(0),
    IVRMIM_Id: z.coerce.number().min(1, { message: 'Select Module Name' }),
    IVRMIMP_Id: z.coerce.number().min(1, { message: 'Select Module Page Name' }),
    IVRMHE_Name: z.string().min(1, { message: 'Enter Header' }),
    pageids: z.array(z.number()).min(1, { message: 'Select at least one Parameter' })
});

export default function MasterHeaderDetails() {
    const { data: initData, isLoading } = useMasterHeaderDetailsData();
    const [selectedModuleId, setSelectedModuleId] = useState<number>(0);

    const { data: modulePageData } = useModulePage(selectedModuleId);
    const saveMutation = useSaveMasterHeaderDetails();
    const deleteMutation = useDeleteMasterHeaderDetails();
    const getSelectedRow = useGetSelectedRowDetails();

    const form = useHookForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            IVRMHE_Id: 0,
            IVRMIM_Id: 0,
            IVRMIMP_Id: 0,
            IVRMHE_Name: '',
            pageids: []
        }
    });

    const institutionModuleList = initData?.institutionModuleList || [];
    const institutionPageLists = modulePageData?.institutionPageList || initData?.institutionPageList || [];
    const parameterlist = initData?.parameterlist || [];
    const headerdata = initData?.headerdata || [];

    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    const [currentPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withDefault(1));

    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withDefault(10));

    const filteredData = React.useMemo(() => {
        if (!searchQuery) return headerdata;
        const lowerQuery = searchQuery.toLowerCase();
        return headerdata.filter(
            (item) => item.ivrmhE_Name?.toLowerCase().includes(lowerQuery) || item.ivrmmP_PageName?.toLowerCase().includes(lowerQuery)
        );
    }, [headerdata, searchQuery]);

    const paginatedData = React.useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredData.slice(startIndex, startIndex + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const filteredParameterList = parameterlist.filter((item) => item.ismP_NAME.toLowerCase().includes(searchTerm.toLowerCase()));

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const payload = {
            ivrmhE_Id: values.IVRMHE_Id,
            ivrmiM_Id: values.IVRMIM_Id,
            ivrmimP_Id: values.IVRMIMP_Id,
            ivrmhE_Name: values.IVRMHE_Name,
            pageids: values.pageids.map((id) => ({ ismP_ID: id }))
        };
        saveMutation.mutate(payload, {
            onSuccess: () => {
                form.reset();
                setSelectedModuleId(0);
                setIsFormOpen(false);
            }
        });
    };

    const handleEdit = (record: HeaderData) => {
        setIsFormOpen(true);
        getSelectedRow.mutate(record.ivrmhE_Id, {
            onSuccess: (data) => {
                const row = data.gridviewDetails[0];
                if (row) {
                    form.setValue('IVRMHE_Id', row.ivrmhE_Id);
                    form.setValue('IVRMIM_Id', row.ivrmiM_Id);
                    form.setValue('IVRMHE_Name', row.ivrmhE_Name);
                    setSelectedModuleId(row.ivrmiM_Id);

                    // Wait for module page data to load before setting IMP_Id
                    setTimeout(() => {
                        form.setValue('IVRMIMP_Id', row.ivrmimP_Id);
                    }, 500);

                    const selectedIds = data.parameterlist ? data.parameterlist.map((p) => p.ismP_ID) : [];
                    form.setValue('pageids', selectedIds);
                }
            }
        });
    };

    const handleDelete = (record: HeaderData) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete record',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(record.ivrmhE_Id);
            } else {
                Swal.fire('Record Deletion Cancelled', 'Failed', 'error');
            }
        });
    };

    const handleClear = () => {
        form.reset({
            IVRMHE_Id: 0,
            IVRMIM_Id: 0,
            IVRMIMP_Id: 0,
            IVRMHE_Name: '',
            pageids: []
        });
        setSelectedModuleId(0);
    };

    const columns: ColumnDef<HeaderData>[] = [
        {
            header: 'SL NO',
            cell: ({ row }) => (currentPage - 1) * pageSize + row.index + 1
        },
        {
            accessorKey: 'ivrmhE_Name',
            header: 'Header Name'
        },
        {
            accessorKey: 'ivrmM_ModuleName',
            header: 'Module Name'
        },
        {
            accessorKey: 'ivrmmP_PageName',
            header: 'Page Name'
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => (
                <div className='flex justify-center gap-2'>
                    <Button variant='ghost' size='icon' onClick={() => handleEdit(row.original)} className='text-primary'>
                        <Edit className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='icon' onClick={() => handleDelete(row.original)} className='text-destructive'>
                        <Trash2 className='h-4 w-4' />
                    </Button>
                </div>
            )
        }
    ];

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className='space-y-6'>
            {isFormOpen && (
                <Card>
                    <CardHeader className='border-border/50 border-b'>
                        <CardTitle>Header Details</CardTitle>
                    </CardHeader>
                    <CardContent className='pt-6'>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                    <div className='space-y-4'>
                                        <FormField
                                            control={form.control}
                                            name='IVRMIM_Id'
                                            render={({ field }) => (
                                                <FormItem className='grid grid-cols-3 items-center gap-4 space-y-0'>
                                                    <FormLabel className='text-right'>Module:</FormLabel>
                                                    <Select
                                                        onValueChange={(val) => {
                                                            field.onChange(Number(val));
                                                            setSelectedModuleId(Number(val));
                                                            form.setValue('IVRMIMP_Id', 0);
                                                        }}
                                                        value={field.value ? field.value.toString() : ''}>
                                                        <FormControl className='col-span-2'>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='--Select--' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {institutionModuleList.map((module) => (
                                                                <SelectItem key={module.ivrmiM_Id} value={module.ivrmiM_Id.toString()}>
                                                                    {module.ivrmM_ModuleName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className='col-span-2 col-start-2' />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='IVRMIMP_Id'
                                            render={({ field }) => (
                                                <FormItem className='grid grid-cols-3 items-center gap-4 space-y-0'>
                                                    <FormLabel className='text-right'>Module Page:</FormLabel>
                                                    <Select
                                                        onValueChange={(val) => field.onChange(Number(val))}
                                                        value={field.value ? field.value.toString() : ''}
                                                        disabled={!selectedModuleId && !field.value}>
                                                        <FormControl className='col-span-2'>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='--Select--' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {institutionPageLists.map((page) => (
                                                                <SelectItem key={page.ivrmimP_Id} value={page.ivrmimP_Id.toString()}>
                                                                    {page.ivrmmP_PageName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className='col-span-2 col-start-2' />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='IVRMHE_Name'
                                            render={({ field }) => (
                                                <FormItem className='grid grid-cols-3 items-center gap-4 space-y-0'>
                                                    <FormLabel className='text-right'>Header:</FormLabel>
                                                    <FormControl className='col-span-2'>
                                                        <Input {...field} value={field.value ?? ''} />
                                                    </FormControl>
                                                    <FormMessage className='col-span-2 col-start-2' />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className='space-y-4'>
                                        <FormItem className='grid grid-cols-3 items-start gap-4 space-y-0'>
                                            <FormLabel className='mt-2 text-right'>SMS/EMAIL Parameter:</FormLabel>
                                            <div className='col-span-2 space-y-2'>
                                                <Input
                                                    placeholder='search here...'
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                <ScrollArea className='h-[150px] rounded-md border p-2'>
                                                    <FormField
                                                        control={form.control}
                                                        name='pageids'
                                                        render={() => (
                                                            <FormItem>
                                                                {filteredParameterList.map((item) => (
                                                                    <FormField
                                                                        key={item.ismP_ID}
                                                                        control={form.control}
                                                                        name='pageids'
                                                                        render={({ field }) => {
                                                                            return (
                                                                                <FormItem
                                                                                    key={item.ismP_ID}
                                                                                    className='flex flex-row items-start space-x-3 space-y-0 p-2'>
                                                                                    <FormControl>
                                                                                        <Checkbox
                                                                                            checked={field.value?.includes(item.ismP_ID)}
                                                                                            onCheckedChange={(checked) => {
                                                                                                return checked
                                                                                                    ? field.onChange([
                                                                                                        ...field.value,
                                                                                                        item.ismP_ID
                                                                                                    ])
                                                                                                    : field.onChange(
                                                                                                        field.value?.filter(
                                                                                                            (value) =>
                                                                                                                value !== item.ismP_ID
                                                                                                        )
                                                                                                    );
                                                                                            }}
                                                                                        />
                                                                                    </FormControl>
                                                                                    <FormLabel className='cursor-pointer font-normal'>
                                                                                        {item.ismP_NAME}
                                                                                    </FormLabel>
                                                                                </FormItem>
                                                                            );
                                                                        }}
                                                                    />
                                                                ))}
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </ScrollArea>
                                            </div>
                                        </FormItem>
                                    </div>
                                </div>

                                <div className='flex justify-center gap-4 border-border/50 border-t pt-4'>
                                    <Button type='submit' disabled={saveMutation.isPending}>
                                        <i className='fa fa-floppy-o mr-2' aria-hidden='true'></i>
                                        Save
                                    </Button>
                                    <Button type='button' variant='destructive' onClick={handleClear}>
                                        <i className='fa fa-times mr-2' aria-hidden='true'></i>
                                        Clear
                                    </Button>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        onClick={() => {
                                            handleClear();
                                            setIsFormOpen(false);
                                        }}>
                                        <i className='fa fa-times mr-2' aria-hidden='true'></i>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className='flex flex-row items-center justify-between border-border/50 border-b pb-4'>
                    <CardTitle>Header Details List</CardTitle>
                    {!isFormOpen && (
                        <Button onClick={() => setIsFormOpen(true)} className='bg-primary text-primary-foreground'>
                            <Plus className='mr-2 h-4 w-4' /> Add Header Details
                        </Button>
                    )}
                </CardHeader>
                <CardContent className='pt-6'>
                    <DataTable columns={columns as any} data={paginatedData} totalItems={filteredData.length} />
                </CardContent>
            </Card>
        </div>
    );
}
