'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { FileSpreadsheet, Loader2, Printer, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    useHostelFoodConveyanceReport,
    useHostelFoodConveyanceReportInitialDetails
} from '@/hooks/admission/oldsharehost/reports/useHostelFoodConveyanceReport';

const formSchema = z.object({
    hfcFlag: z.enum(['H', 'C']),
    asmaY_Id: z.string().min(1, 'Academic Year is required'),
    asmcL_Id: z.string().min(1, 'Class is required'),
    asmC_Id: z.string().min(1, 'Section is required')
});

type FormValues = z.infer<typeof formSchema>;

export default function HostelFoodConveyanceReportPage() {
    const { data: initialData, isLoading: isInitialLoading } = useHostelFoodConveyanceReportInitialDetails();
    const reportMutation = useHostelFoodConveyanceReport();

    const [items, setItems] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [schoolDetails, setSchoolDetails] = useState<any>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hfcFlag: 'H',
            asmaY_Id: '',
            asmcL_Id: '',
            asmC_Id: ''
        }
    });

    const onSubmit = async (data: FormValues) => {
        try {
            setIsGenerating(true);
            const payload = {
                ASMAY_Id: Number(data.asmaY_Id),
                ASMCL_Id: Number(data.asmcL_Id),
                ASMC_Id: Number(data.asmC_Id),
                HFC_Flag: data.hfcFlag
            };

            const res = await reportMutation.mutateAsync(payload);
            const resultData = res?.data;

            if (!resultData?.studentlist || resultData.studentlist.length === 0) {
                toast.info('No Records Found!');
                setItems([]);
                setSelectedItems([]);
                return;
            }

            const formattedData = resultData.studentlist.map((item: any) => {
                const namme = `${item.stuFN || ''} ${item.stuMN || ''} ${item.stuLN || ''}`.replace(/\s+/g, ' ').trim();
                return {
                    ...item,
                    namme
                };
            });

            setItems(formattedData);
            setSelectedItems([]);

            // Try to extract school details from local storage or context if possible, otherwise we might not have it from this API endpoint.
            // Assuming it might be returned or we use a fallback.
            // In original angular code, logo was from admfigsettings localstorage.
        } catch (error) {
            toast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClear = () => {
        form.reset({
            hfcFlag: 'H',
            asmaY_Id: '',
            asmcL_Id: '',
            asmC_Id: ''
        });
        setItems([]);
        setSelectedItems([]);
    };

    const handlePrint = () => {
        if (selectedItems.length === 0) {
            toast.warning('Please Select Records to be Printed');
            return;
        }
        window.print();
    };

    const handleExportExcel = () => {
        if (selectedItems.length === 0) {
            toast.warning('Please Select Records to be Exported');
            return;
        }

        const dataToExport = selectedItems.map((item, index) => ({
            'SL. No.': index + 1,
            'Reg. No.': item.regno,
            'Admission No.': item.admno,
            'Student Name': item.namme,
            Class: item.class,
            Section: item.section
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report');
        XLSX.writeFile(wb, 'Hostel_Food_Conveyance_Report.xlsx');
    };

    const columns = [
        {
            id: 'select',
            header: ({ table }: any) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label='Select all'
                />
            ),
            cell: ({ row }: any) => (
                <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
            ),
            enableSorting: false,
            enableHiding: false
        },
        {
            id: 'sno',
            header: 'SL. No.',
            cell: ({ row }: any) => row.index + 1
        },
        {
            accessorKey: 'regno',
            header: 'Reg. No.'
        },
        {
            accessorKey: 'admno',
            header: 'Admission No.'
        },
        {
            accessorKey: 'namme',
            header: 'Student Name'
        },
        {
            accessorKey: 'class',
            header: 'Class'
        },
        {
            accessorKey: 'section',
            header: 'Section'
        }
    ];

    return (
        <div className='min-h-screen space-y-6 bg-gray-50 p-4 print:bg-white print:p-0'>
            <div className='print:hidden'>
                <CollapsibleSection title='Hostel/Food/Conveyance' defaultOpen={true} variant='outline' className='shadow-md'>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 rounded-lg bg-white p-6'>
                        <div className='mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2'>
                            <div className='space-y-4'>
                                <Controller
                                    name='hfcFlag'
                                    control={form.control}
                                    render={({ field }) => (
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                            className='flex flex-row justify-center space-x-4 rounded-md bg-gray-100 p-4'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='H' id='r-hostel' />
                                                <Label htmlFor='r-hostel'>Hostel</Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='C' id='r-conveyance' />
                                                <Label htmlFor='r-conveyance'>Conveyance</Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                                {form.formState.errors.hfcFlag && (
                                    <span className='text-red-500 text-sm'>{form.formState.errors.hfcFlag.message}</span>
                                )}

                                <div className='space-y-2'>
                                    <Label className='font-bold text-sm'>
                                        Academic Year:<span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmaY_Id'
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange} disabled={isInitialLoading}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Academic Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {initialData?.data?.allAcademicYear?.map((item: any) => (
                                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                            {item.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.asmaY_Id && (
                                        <span className='text-red-500 text-sm'>{form.formState.errors.asmaY_Id.message}</span>
                                    )}
                                </div>
                            </div>

                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label className='font-bold text-sm'>
                                        Class:<span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmcL_Id'
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange} disabled={isInitialLoading}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {initialData?.data?.allClass?.map((item: any) => (
                                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                            {item.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.asmcL_Id && (
                                        <span className='text-red-500 text-sm'>{form.formState.errors.asmcL_Id.message}</span>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label className='font-bold text-sm'>
                                        Section:<span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmC_Id'
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange} disabled={isInitialLoading}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Section' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {initialData?.data?.allSection?.map((item: any) => (
                                                        <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                            {item.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.asmC_Id && (
                                        <span className='text-red-500 text-sm'>{form.formState.errors.asmC_Id.message}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className='flex justify-center gap-4 border-t pt-4'>
                            <Button
                                type='submit'
                                disabled={isGenerating}
                                className='min-w-[120px] bg-indigo-600 font-bold text-white hover:bg-indigo-700'>
                                {isGenerating ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                                Report
                            </Button>

                            <Button type='button' onClick={handleClear} variant='destructive' className='min-w-[120px] font-bold'>
                                <X className='mr-2 h-4 w-4' />
                                Cancel
                            </Button>

                            <Button
                                type='button'
                                onClick={handleExportExcel}
                                disabled={items.length === 0}
                                className='min-w-[120px] bg-green-600 font-bold text-white hover:bg-green-700 disabled:bg-green-300'>
                                <FileSpreadsheet className='mr-2 h-4 w-4' />
                                Export
                            </Button>

                            <Button
                                type='button'
                                onClick={handlePrint}
                                disabled={items.length === 0}
                                className='min-w-[120px] bg-gray-600 font-bold text-white hover:bg-gray-700 disabled:bg-gray-300'>
                                <Printer className='mr-2 h-4 w-4' />
                                Print
                            </Button>
                        </div>
                    </form>
                </CollapsibleSection>
            </div>

            <div className='print:hidden'>
                {items.length > 0 && (
                    <CollapsibleSection title='Hostel/Food/Conveyance Report' defaultOpen={true} variant='outline' className='shadow-md'>
                        <div className='rounded-lg bg-white p-4'>
                            <GenericDataTable
                                data={items}
                                columns={columns}
                                isLoading={isGenerating}
                                isPaginationRequired={true}
                                onRowSelectionChange={(selectedRows: any[]) => {
                                    setSelectedItems(selectedRows);
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                )}
            </div>

            {/* Print Section */}
            {items.length > 0 && (
                <div className='hidden rounded-lg bg-white p-6 shadow-none print:block'>
                    <div className='mb-6 text-center'>
                        <h2 className='font-bold text-xl'>Hostel / Food / Conveyance Report</h2>
                    </div>

                    <table className='w-full border-collapse border border-gray-300 text-center text-sm'>
                        <thead>
                            <tr className='bg-gray-100'>
                                <th className='border border-gray-300 p-2'>SL. No.</th>
                                <th className='border border-gray-300 p-2'>Reg. No.</th>
                                <th className='border border-gray-300 p-2'>Adm. No.</th>
                                <th className='border border-gray-300 p-2'>Student Name</th>
                                <th className='border border-gray-300 p-2'>Class</th>
                                <th className='border border-gray-300 p-2'>Section</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedItems.length > 0
                                ? selectedItems.map((user, idx) => (
                                      <tr key={idx}>
                                          <td className='border border-gray-300 p-2'>{idx + 1}</td>
                                          <td className='border border-gray-300 p-2 text-left'>{user.regno}</td>
                                          <td className='border border-gray-300 p-2 text-left'>{user.admno}</td>
                                          <td className='break-words border border-gray-300 p-2 text-left'>{user.namme}</td>
                                          <td className='break-words border border-gray-300 p-2 text-left'>{user.class}</td>
                                          <td className='break-words border border-gray-300 p-2 text-left'>{user.section}</td>
                                      </tr>
                                  ))
                                : items.map((user, idx) => (
                                      <tr key={idx}>
                                          <td className='border border-gray-300 p-2'>{idx + 1}</td>
                                          <td className='border border-gray-300 p-2 text-left'>{user.regno}</td>
                                          <td className='border border-gray-300 p-2 text-left'>{user.admno}</td>
                                          <td className='break-words border border-gray-300 p-2 text-left'>{user.namme}</td>
                                          <td className='break-words border border-gray-300 p-2 text-left'>{user.class}</td>
                                          <td className='break-words border border-gray-300 p-2 text-left'>{user.section}</td>
                                      </tr>
                                  ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={6} className='p-4 text-center'>
                                    <label>Date: {format(new Date(), 'dd/MM/yyyy')}</label>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
}
