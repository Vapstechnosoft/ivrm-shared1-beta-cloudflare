'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudentSearch } from '@/hooks/admission/preadmission/useReports';
import { studentSearchSchema } from '@/schemas/admission/preadmission/reports';
import { getStudentSearch } from '@/server/admission/preadmission/reports/student_yearly_attendance';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileSpreadsheet, Plus, Printer, RotateCcw, Search, Trash2 } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import type { z } from 'zod';
import { type StudentData, studentSearchColumns } from './_components/columns';
import { StudentSearchPrint } from './_components/student-search-print';

type FormFields = z.infer<typeof studentSearchSchema>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const FIELD_OPTIONS = [
    { value: 'ASMCL_ClassName', label: 'Class Name' },
    { value: 'AMST_FirstName', label: 'First Name' },
    { value: 'AMST_RegistrationNo', label: 'Registration No' },
    { value: 'AMST_FatherName', label: 'Father Name' },
    { value: 'AMST_MotherName', label: 'Mother Name' },
    { value: 'AMST_emailId', label: 'Email' },
    // { value: 'AMST_MobileNo', label: 'Mobile Number' },
    { value: 'AMST_AdmNo', label: 'Admission Number' },
    { value: 'ASMC_SectionName', label: 'Section' }
];

const OPERATOR_OPTIONS = [
    { value: '=', label: 'Equal to' },
    { value: '!=', label: 'Not equal to' },
    { value: 'LIKE', label: 'Like' },
    { value: '>', label: 'Greater than' },
    { value: '<', label: 'Less than' }
];

const CONDITION_OPTIONS = [
    { value: 'AND', label: 'AND' },
    { value: 'OR', label: 'OR' }
];

export default function StudentSearchPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = (React as any).use(props.searchParams);
    const [showReport, setShowReport] = useState(false);
    const [allPrintData, setAllPrintData] = useState<any[]>([]);
    const [isPrinting, setIsPrinting] = useState(false);
    const [searchQuery, setSearchQuery] = useState<{
        stuStatus: string;
        field: string;
        operator: string;
        value: string;
        condition: string;
    } | null>(null);

    const {
        control,
        watch,
        setValue,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(studentSearchSchema),
        defaultValues: {
            status: 'all',
            criteria: [{ field: '', operator: '', value: '', condition: 'AND' }]
        }
    });

    const criteria = watch('criteria');

    const buildQueryParams = (data: FormFields) => {
        const fields = data.criteria.map((c) => c.field).join(',');
        const operators = data.criteria.map((c) => c.operator).join(',');
        const values = data.criteria.map((c) => c.value).join(',');
        const conditions = data.criteria
            .map((c) => c.condition || 'AND')
            .filter((_, i) => i < data.criteria.length - 1 || data.criteria.length === 1)
            .join(',');

        return {
            stuStatus: data.status,
            field: fields,
            operator: operators,
            value: values,
            condition: conditions
        };
    };

    const {
        data: response,
        isLoading,
        isFetching,
        error,
        refetch: refetchStudentSearch
    } = useStudentSearch(
        searchQuery?.stuStatus || '',
        searchQuery?.field || '',
        searchQuery?.operator || '',
        searchQuery?.value || '',
        searchQuery?.condition || '',
        searchParams
    );

    React.useEffect(() => {
        if (!isFetching && showReport && response) {
            const results = (response?.data as any)?.searchResult;
            if (!results || results.length === 0) {
                toast.error('Data Not Found');
            }
        }
    }, [isFetching, showReport, response]);

    const tableProps = useDataTableProps({
        ...response,
        data: (response?.data as any)?.searchResult || []
    });

    const addCriteria = () => {
        setValue('criteria', [...criteria, { field: '', operator: '', value: '', condition: 'AND' }]);
    };

    const removeCriteria = (index: number) => {
        if (criteria.length > 1) {
            setValue(
                'criteria',
                criteria.filter((_, i) => i !== index)
            );
        }
    };

    const onSubmit = async (data: FormFields) => {
        const queryParams = buildQueryParams(data);
        setSearchQuery(queryParams);
        setShowReport(true);
    };

    const handleReset = () => {
        window.location.reload();
    };

    const printRef = useRef<HTMLDivElement>(null);
    const triggerPrint = useReactToPrint({
        contentRef: printRef
    });

    const handlePrint = async () => {
        if (!searchQuery) return;

        setIsPrinting(true);
        const toastId = toast.loading('Preparing all records for print...');
        try {
            const fullResponse = await getStudentSearch(
                searchQuery.stuStatus,
                searchQuery.field,
                searchQuery.operator,
                searchQuery.value,
                searchQuery.condition,
                { page_size: 1000000 }
            );

            const allData = (fullResponse?.data as any)?.searchResult || [];

            if (allData.length === 0) {
                toast.dismiss(toastId);
                toast.error('No data found to print');
                setIsPrinting(false);
                return;
            }

            setAllPrintData(allData);
            toast.dismiss(toastId);
            toast.success('Ready to print');

            setTimeout(() => {
                triggerPrint();
                setIsPrinting(false);
            }, 1000);
        } catch (error) {
            console.error('Print error:', error);
            toast.dismiss(toastId);
            toast.error('Failed to prepare print view');
            setIsPrinting(false);
        }
    };

    const handleExportToExcel = async () => {
        if (!searchQuery) return;

        const toastId = toast.loading('Fetching all records for export...');
        try {
            const fullResponse = await getStudentSearch(
                searchQuery.stuStatus,
                searchQuery.field,
                searchQuery.operator,
                searchQuery.value,
                searchQuery.condition,
                { page_size: 1000000 }
            );

            const allData = (fullResponse?.data as any)?.searchResult || [];

            if (allData.length === 0) {
                toast.dismiss(toastId);
                toast.error('No data found to export');
                return;
            }

            const excelData = allData.map((row: any, index: number) => ({
                'Sl. No': index + 1,
                'Reg. No': row.amsT_RegistrationNo,
                'Student Name': row.amsT_FirstName,
                Class: row.asmcL_ClassName,
                Section: row.asmC_SectionName,
                Gender: row.amsT_Sex,
                DOB: row.amsT_DOB,
                'Father Name': row.amsT_FatherName,
                Mobile: row.amsT_MobileNo,
                'Admission No': row.amsT_AdmNo
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
            XLSX.writeFile(workbook, 'StudentSearchReport_AllRecords.xlsx');

            toast.dismiss(toastId);
            toast.success('Excel exported successfully with all records');
        } catch (error) {
            console.error('Export error:', error);
            toast.dismiss(toastId);
            toast.error('Failed to export all records');
        }
    };

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='container mx-auto max-w-7xl space-y-4 p-4'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    <CollapsibleSection
                        title='Student Status'
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='flex flex-row justify-center gap-4 p-4'>
                            <Label className='font-medium text-gray-700'>
                                Student Status <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='status'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup value={field.value} onValueChange={field.onChange} className='flex items-center space-x-8'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='all' id='all' />
                                            <label htmlFor='all' className='cursor-pointer font-medium text-sm'>
                                                All
                                            </label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='studying' id='studying' />
                                            <label htmlFor='studying' className='cursor-pointer font-medium text-sm'>
                                                Studying
                                            </label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='left' id='left' />
                                            <label htmlFor='left' className='cursor-pointer font-medium text-sm'>
                                                Left
                                            </label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                            {errors.status && <FormError>{errors.status.message}</FormError>}
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title='Search Criteria'
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='space-y-4 p-4'>
                            <div className='overflow-x-auto rounded-lg border border-gray-300'>
                                <table className='w-full'>
                                    <thead className='bg-gray-100'>
                                        <tr>
                                            <th className='border-gray-300 border-b px-4 py-3 text-left font-semibold text-sm'>
                                                Field <span className='text-red-500'>*</span>
                                            </th>
                                            <th className='border-gray-300 border-b px-4 py-3 text-left font-semibold text-sm'>
                                                Operator <span className='text-red-500'>*</span>
                                            </th>
                                            <th className='border-gray-300 border-b px-4 py-3 text-left font-semibold text-sm'>
                                                Value <span className='text-red-500'>*</span>
                                            </th>
                                            <th className='border-gray-300 border-b px-4 py-3 text-left font-semibold text-sm'>
                                                Condition
                                            </th>
                                            <th className='border-gray-300 border-b px-4 py-3 text-center font-semibold text-sm'>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {criteria.map((row, index) => (
                                            <tr key={index} className='hover:bg-gray-50'>
                                                <td className='border-gray-200 border-b px-4 py-3'>
                                                    <Controller
                                                        name={`criteria.${index}.field`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select value={field.value} onValueChange={field.onChange}>
                                                                <SelectTrigger className='w-full'>
                                                                    <SelectValue placeholder='Select Field' />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {FIELD_OPTIONS.map((opt) => (
                                                                        <SelectItem key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                    {errors.criteria?.[index]?.field && (
                                                        <FormError>{errors.criteria[index]?.field?.message}</FormError>
                                                    )}
                                                </td>
                                                <td className='border-gray-200 border-b px-4 py-3'>
                                                    <Controller
                                                        name={`criteria.${index}.operator`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select value={field.value} onValueChange={field.onChange}>
                                                                <SelectTrigger className='w-full'>
                                                                    <SelectValue placeholder='Select Operator' />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {OPERATOR_OPTIONS.map((opt) => (
                                                                        <SelectItem key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                    {errors.criteria?.[index]?.operator && (
                                                        <FormError>{errors.criteria[index]?.operator?.message}</FormError>
                                                    )}
                                                </td>
                                                <td className='border-gray-200 border-b px-4 py-3'>
                                                    <Controller
                                                        name={`criteria.${index}.value`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <input
                                                                {...field}
                                                                type='text'
                                                                placeholder='Enter value'
                                                                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                                                            />
                                                        )}
                                                    />
                                                    {errors.criteria?.[index]?.value && (
                                                        <FormError>{errors.criteria[index]?.value?.message}</FormError>
                                                    )}
                                                </td>
                                                <td className='border-gray-200 border-b px-4 py-3'>
                                                    <Controller
                                                        name={`criteria.${index}.condition`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select value={field.value} onValueChange={field.onChange}>
                                                                <SelectTrigger className='w-full'>
                                                                    <SelectValue placeholder='Select Condition' />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {CONDITION_OPTIONS.map((opt) => (
                                                                        <SelectItem key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                </td>
                                                <td className='border-gray-200 border-b px-4 py-3 text-center'>
                                                    <Button
                                                        type='button'
                                                        onClick={() => removeCriteria(index)}
                                                        disabled={criteria.length === 1}
                                                        variant='ghost'
                                                        size='sm'
                                                        className='text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50'>
                                                        <Trash2 className='h-4 w-4' />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Button type='button' onClick={addCriteria} variant='outline' className='w-fit'>
                                <Plus className='mr-2 h-4 w-4' />
                                Add More Criteria
                            </Button>
                            {errors.criteria && <FormError>{errors.criteria.message}</FormError>}
                        </div>
                        <div className='flex flex-col gap-3 p-4 sm:flex-row sm:justify-start'>
                            <Button
                                type='submit'
                                disabled={isSubmitting}
                                className='order-1 w-full transition-all duration-200 hover:scale-105 sm:order-1 sm:w-fit'>
                                <Search className='mr-2 h-4 w-4' />
                                {isSubmitting ? 'Searching...' : 'Search'}
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleReset}
                                disabled={isSubmitting}
                                className='order-2 w-full transition-all duration-200 hover:scale-105 sm:order-2 sm:w-fit'>
                                <RotateCcw className='mr-2 h-4 w-4' />
                                Reset
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleExportToExcel}
                                disabled={
                                    !showReport ||
                                    !(response?.data as any)?.searchResult ||
                                    (response?.data as any)?.searchResult.length === 0
                                }
                                className='w-full sm:w-fit'>
                                <FileSpreadsheet className='mr-2 h-4 w-4' />
                                Export to Excel
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handlePrint}
                                disabled={
                                    !showReport ||
                                    !(response?.data as any)?.searchResult ||
                                    (response?.data as any)?.searchResult.length === 0 ||
                                    isPrinting
                                }
                                className='w-full sm:w-fit'>
                                <Printer className='mr-2 h-4 w-4' />
                                {isPrinting ? 'Preparing...' : 'Print'}
                            </Button>
                        </div>
                    </CollapsibleSection>
                </form>

                <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '297mm' }}>
                    <StudentSearchPrint
                        ref={printRef}
                        data={allPrintData.length > 0 ? allPrintData : (response?.data as any)?.searchResult || []}
                    />
                </div>

                {showReport && (response?.data as any)?.searchResult && (response?.data as any)?.searchResult.length > 0 && (
                    <CollapsibleSection
                        title='Search Results'
                        description={`${(response?.data as any)?.searchResult.length} students found`}
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='p-4'>
                            <GenericDataTable<StudentData>
                                {...tableProps}
                                columns={studentSearchColumns}
                                isLoading={isLoading}
                                error={error}
                                showViewOptions={false}
                                loadingMessage='Loading student search results...'
                                noDataTitle='No Data Found'
                                noDataDescription='No students found matching your criteria.'
                                errorTitle='Error Loading Student Search'
                            />
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
