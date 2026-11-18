'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { exportToExcel } from '@/lib/utils';
import { format } from 'date-fns';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { use, useState } from 'react';
import AddHolidayReportForm from './_components/add-from';
import type { HolidayReportRow } from './_components/columns';
import { holidayReportColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function HolidayReportPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const [reportData, setReportData] = useState<HolidayReportRow[]>([]);

    return (
        <FormProvider<HolidayReportRow>>
            <HolidayReportPageContent reportData={reportData} onReportData={setReportData} searchParams={searchParams} />
        </FormProvider>
    );
}

function FormSections({
    onReportData,
    searchParams
}: {
    onReportData: (data: HolidayReportRow[]) => void;
    searchParams?: any;
}) {
    const { closeAddForm, addFormRef } = useFormContext<HolidayReportRow>();

    const handleReset = () => {
        onReportData([]); // clear the grid only
    };

    return (
        <div ref={addFormRef}>
            <CollapsibleSection
                title='Generate Holiday Report'
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
                    <AddHolidayReportForm onSuccess={closeAddForm} onReportData={onReportData} onReset={handleReset} />
                </div>
            </CollapsibleSection>
        </div>
    );
}

function HolidayReportPageContent({
    reportData,
    onReportData,
    searchParams
}: {
    reportData: HolidayReportRow[];
    onReportData: (data: HolidayReportRow[]) => void;
    searchParams?: any;
}) {
    const [selectedRows, setSelectedRows] = useState<HolidayReportRow[]>([]);

    const hasData = reportData.length > 0;

    const handleRowSelectionChange = (rows: HolidayReportRow[]) => {
        setSelectedRows(rows);
    };

    const handleExportToExcel = () => {
        if (selectedRows.length === 0) return;

        const exportData = selectedRows.map((row, index) => ({
            'Sl.No': index + 1,
            'Holiday Name': row.fomhwD_HolidayWDName || '',
            Date: row.fomhwdD_Date ? format(new Date(row.fomhwdD_Date), 'dd-MM-yyyy') : ''
        }));

        exportToExcel(exportData, 'Holiday_Report');
    };

    const handlePrint = () => {
        if (selectedRows.length === 0) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Holiday Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { text-align: center; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #4f46e5; color: white; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                    @media print {
                        body { margin: 0; }
                        @page { margin: 1cm; }
                    }
                </style>
            </head>
            <body>
                <h1>Holiday Report</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Sl.No</th>
                            <th>Holiday Name</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${selectedRows
                            .map(
                                (row, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${row.fomhwD_HolidayWDName || ''}</td>
                                <td>${row.fomhwdD_Date ? format(new Date(row.fomhwdD_Date), 'dd-MM-yyyy') : ''}</td>
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

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Filter Form Section */}
                <FormSections onReportData={onReportData} searchParams={searchParams} />

                {/* Data Table Section — only rendered when there is data */}
                {hasData && (
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        {/* Toolbar: record count + Excel / Print buttons */}
                        <div className='mb-3 flex items-center gap-2 rounded-md border bg-blue-50 px-4 py-2'>
                            <span className='font-medium text-gray-700 text-sm'>
                                {selectedRows.length > 0
                                    ? `${selectedRows.length} row${selectedRows.length > 1 ? 's' : ''} selected`
                                    : `${reportData.length} record${reportData.length > 1 ? 's' : ''} found`}
                            </span>
                            <div className='ml-auto flex items-center gap-2'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    onClick={handleExportToExcel}
                                    disabled={selectedRows.length === 0}
                                    className='border-green-500 text-green-700 hover:bg-green-50 disabled:opacity-50'>
                                    <FileSpreadsheet className='mr-2 h-4 w-4' />
                                    Excel
                                </Button>
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    onClick={handlePrint}
                                    disabled={selectedRows.length === 0}
                                    className='border-blue-500 text-blue-700 hover:bg-blue-50 disabled:opacity-50'>
                                    <Printer className='mr-2 h-4 w-4' />
                                    Print
                                </Button>
                            </div>
                        </div>

                        <GenericDataTable<HolidayReportRow>
                            data={reportData}
                            totalItems={reportData.length}
                            columns={holidayReportColumns}
                            isLoading={false}
                            error={null}
                            showViewOptions={false}
                            columnPinning={{ right: ['actions'] }}
                            isPaginationRequired={true}
                            onRowSelectionChange={handleRowSelectionChange}
                            loadingMessage='Loading Holiday Reports...'
                            noDataTitle='No Holiday Reports Found'
                            noDataDescription='Get started by generating your first Holiday Report'
                            errorTitle='Error Loading Holiday Reports'
                        />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
