'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useEmployeeLogReport } from '@/hooks/hrms/attendance-management/useReports';
import { exportToExcel } from '@/lib/utils';
import { format } from 'date-fns';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { useEffect } from 'react';
import { use } from 'react';
import { toast } from 'sonner';
import AddEmployeeLogReportForm from './_components/add-from';
import type { LogRow } from './_components/columns';
import { logReportColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function EmployeeLogReportPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    // Remove searchParams dependency from the query to avoid caching issues with client-side pagination
    const { data: response, isLoading, error } = useEmployeeLogReport({});

    return (
        <FormProvider<LogRow>>
            <EmployeeLogReportPageContent response={response} isLoading={isLoading} error={error} searchParams={searchParams} />
        </FormProvider>
    );
}

function FormSections({ searchParams }: { searchParams?: any }) {
    const { closeAddForm, addFormRef } = useFormContext<LogRow>();

    return (
        <>
            <div ref={addFormRef}>
                <CollapsibleSection
                    title='Generate Employee Log Report'
                    description='Fill in the details below to generate the report'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                    <div className='relative'>
                        {/* <Button
                            type='button'
                            onClick={closeAddForm}
                            variant='ghost'
                            size='sm'
                            className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                            <X className='h-4 w-4 text-destructive' /> Close
                        </Button> */}
                        <AddEmployeeLogReportForm onSuccess={closeAddForm} searchParams={searchParams} />
                    </div>
                </CollapsibleSection>
            </div>
        </>
    );
}

function EmployeeLogReportPageContent({
    response,
    isLoading,
    error,
    searchParams
}: {
    response: any;
    isLoading: boolean;
    error: any;
    searchParams?: any;
}) {
    const tableProps = useDataTableProps(response);
    console.log('response', response);
    const handleExportToExcel = () => {
        const dataToExport = tableProps.data || [];
        if (dataToExport.length === 0) return;

        const exportData = dataToExport.map((row: any, index: number) => ({
            'Sl.No': index + 1,
            'Employee Code': row.ecode || '',
            'Employee Name': row.ename || '',
            'Employee Type': row.gtype || '',
            Department: row.depname || '',
            Designation: row.desgname || '',
            'In Time': row.intime || row.intime === null || row.intime === '' || row.intime === 'A' || row.intime === '00:00' ? 'A' : '',
            'Out Time':
                row.outtime || row.outtime === null || row.outtime === '' || row.outtime === 'A' || row.outtime === '00:00' ? 'A' : '',
            'Working Time':
                row.workingtime ||
                row.workingtime === null ||
                row.workingtime === '' ||
                row.workingtime === 'A' ||
                row.workingtime === '00:00'
                    ? 'A'
                    : '',
            'Late By': row.lateby || row.lateby === null || row.lateby === '' || row.lateby === 'A' || row.lateby === '00:00' ? 'A' : '',
            'Early By':
                row.earlyby || row.earlyby === null || row.earlyby === '' || row.earlyby === 'A' || row.earlyby === '00:00' ? 'A' : '',
            'In Temp':
                row.intemperature ||
                row.intemperature === null ||
                row.intemperature === '' ||
                row.intemperature === 'A' ||
                row.intemperature === '00:00'
                    ? 'A'
                    : ''
        }));

        exportToExcel(exportData, 'Employee_Log_Report');
    };

    const handlePrint = () => {
        const dataToPrint = tableProps.data || [];
        if (dataToPrint.length === 0) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title></title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { text-align: center; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; }
                    th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
                    th { background-color: #4f46e5; color: white; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                    @media print {
                        body { margin: 0; }
                        @page { margin: 1cm; landscape: true; }
                        table { font-size: 8px; }
                    }
                </style>
            </head>
            <body>
                <h1>Employee Log Report from ${response.fromdate} to ${response.todate}</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Sl.No</th>
                            <th>Employee Code</th>
                            <th>Employee Name</th>
                            <th>Employee Type</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>In Time</th>
                            <th>Out Time</th>
                            <th>Working Time</th>
                            <th>Late By</th>
                            <th>Early By</th>
                            <th>In Temp</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dataToPrint
                            .map(
                                (row: any, index: number) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${row.ecode || ''}</td>
                                <td>${row.ename || ''}</td>
                                <td>${row.gtype || ''}</td>
                                <td>${row.depname || ''}</td>
                                <td>${row.desgname || ''}</td>
                                <td>${row.intime || (row.intime === null || row.intime === '' || row.intime === 'A' || row.intime === '00:00') ? 'A' : ''}</td>
                                <td>${row.outtime || (row.outtime === null || row.outtime === '' || row.outtime === 'A' || row.outtime === '00:00') ? 'A' : ''}</td>
                                <td>${row.workingtime || (row.workingtime === null || row.workingtime === '' || row.workingtime === 'A' || row.workingtime === '00:00') ? 'A' : ''}</td>
                                <td>${row.lateby || (row.lateby === null || row.lateby === '' || row.lateby === 'A' || row.lateby === '00:00') ? 'A' : ''}</td>
                                <td>${row.earlyby || (row.earlyby === null || row.earlyby === '' || row.earlyby === 'A' || row.earlyby === '00:00') ? 'A' : ''}</td>
                                <td>${row.intemperature || (row.intemperature === null || row.intemperature === '' || row.intemperature === 'A' || row.intemperature === '00:00') ? 'A' : ''}</td>
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    useEffect(() => {
        if (response && response.success && (!response.data || response.data.length === 0)) {
            toast.info('No data found for the selected criteria');
        }
    }, [response]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), 'dd-MM-yyyy');
        } catch (e) {
            console.error('Error formatting date:', e);
            return dateString; // Return original if invalid
        }
    };

    const hasData = response?.data && response.data.length > 0;

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Add Form Section (shown first) */}
                <FormSections searchParams={searchParams} />

                {/* Data Table Section */}
                {hasData && (
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='mt-6 shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='space-y-4 rounded-lg bg-white p-6'>
                            <div className='flex items-center justify-between border-b pb-4'>
                                <h2 className='font-semibold text-gray-800 text-lg'>Report Results</h2>
                                <div className='flex gap-2'>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        onClick={handleExportToExcel}
                                        className='bg-green-50 text-green-700 transition-all duration-200 hover:bg-green-100 hover:text-green-800'>
                                        <FileSpreadsheet className='mr-2 h-4 w-4' />
                                        Export Excel
                                    </Button>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        onClick={handlePrint}
                                        className='bg-blue-50 text-blue-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800'>
                                        <Printer className='mr-2 h-4 w-4' />
                                        Print
                                    </Button>
                                </div>
                            </div>

                            <div className='rounded-md shadow-sm'>
                                <div className='mb-4 bg-gray-400 px-4 py-2 text-center font-bold text-black text-sm tracking-wide shadow-inner'>
                                    Employee Log Report from {formatDate(response?.fromdate)} to {formatDate(response?.todate)}
                                </div>
                                <GenericDataTable<LogRow>
                                    {...tableProps}
                                    columns={logReportColumns}
                                    isLoading={isLoading}
                                    error={error}
                                    showViewOptions={false}
                                    isPaginationRequired={true}
                                    loadingMessage='Loading Employee Log Reports...'
                                    noDataTitle='No Employee Log Reports Found'
                                    noDataDescription='Get started by generating your first Employee Log Report'
                                    errorTitle='Error Loading Employee Log Reports'
                                />
                            </div>
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
