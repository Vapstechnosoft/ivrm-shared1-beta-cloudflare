'use client';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useEmployeeYearlyReport } from '@/hooks/hrms/attendance-management/useReports';
import { exportToExcel } from '@/lib/utils';
import { format } from 'date-fns';
import { FileSpreadsheet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { use } from 'react';
import { toast } from 'sonner';
import AddEmployeeYearlyReportForm from './_components/add-from';
import { type YearRow, getEmployeeYearlyReportColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function EmployeeYearlyReportPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useEmployeeYearlyReport(searchParams);

    return <EmployeeYearlyReportPageContent response={response} isLoading={isLoading} error={error} searchParams={searchParams} />;
}

function FormSections({ searchParams }: { searchParams?: any }) {
    const { closeAddForm, addFormRef } = useFormContext<YearRow>();

    return (
        <div ref={addFormRef}>
            <CollapsibleSection
                title='Generate Employee Yearly Report'
                description='Fill in the details below to generate the report'
                defaultOpen={true}
                variant='outline'
                size='md'
                className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                <AddEmployeeYearlyReportForm onSuccess={closeAddForm} searchParams={searchParams} />
            </CollapsibleSection>
        </div>
    );
}

function EmployeeYearlyReportPageContent({
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
    const [selectedRows, setSelectedRows] = useState<YearRow[]>([]);

    // Extract data from response structure
    const reportData = useMemo(() => {
        if (!response) return [];

        // Check multiple possible data structures
        if (Array.isArray(response.data)) return response.data;
        if (response.data?.report && Array.isArray(response.data.report)) {
            return response.data.report;
        }
        if (response.report && Array.isArray(response.report)) {
            return response.report;
        }
        return [];
    }, [response]);

    const dynamicMonths = useMemo(() => {
        if (!response) return [];
        if (response.data?.columns && Array.isArray(response.data.columns)) {
            return response.data.columns;
        }
        if (response.columns && Array.isArray(response.columns)) {
            return response.columns;
        }
        return [];
    }, [response]);

    const totalWorkingDays = useMemo(() => {
        if (!response) return 0;
        return response.data?.tpdays || response.tpdays || 0;
    }, [response]);

    console.log('response', response);
    console.log('reportData', reportData);
    console.log('dynamicMonths', dynamicMonths);

    const rawModes = searchParams?.mode;
    const modes = useMemo(() => {
        if (Array.isArray(rawModes)) return rawModes;
        if (rawModes) return [rawModes as string];
        return [];
    }, [rawModes]);

    const tableProps = useMemo(() => {
        const total = response?.data?.total || response?.total || reportData.length;
        const errorMessage = response?.message || response?.errorMessage || error?.message;

        return {
            data: reportData,
            total: total,
            errorMessage: errorMessage,
            success: response?.success !== false
        };
    }, [reportData, response, error]);

    const columns = useMemo(() => {
        return getEmployeeYearlyReportColumns(dynamicMonths, modes);
    }, [dynamicMonths, modes]);

    const handleRowSelectionChange = useCallback(
        (rows: YearRow[]) => {
            if (
                rows.length !== selectedRows.length ||
                JSON.stringify(rows.map((r) => r.ecode)) !== JSON.stringify(selectedRows.map((r) => r.ecode))
            ) {
                setSelectedRows(rows);
            }
        },
        [selectedRows]
    );

    useEffect(() => {
        if (!isLoading && searchParams?.fromDate && searchParams?.toDate && reportData.length === 0 && response) {
            if (response.message) {
                toast.error(response.message);
            } else {
                toast.error('No Data Found');
            }
        }
    }, [isLoading, reportData.length, searchParams?.fromDate, searchParams?.toDate, response]);

    const handleExportToExcel = () => {
        const dataToExport = selectedRows.length > 0 ? selectedRows : reportData;
        if (dataToExport.length === 0) return;

        const exportData = dataToExport.map((row: YearRow, index: number) => {
            const exportRow: Record<string, any> = {
                'Sl.No': index + 1,
                'Employee Code': row.ecode || '',
                'Employee Name': row.ename || '',
                Designation: row.designation || ''
            };

            dynamicMonths.forEach((month: string) => {
                exportRow[month.replace('_', ' ')] = row[month] ?? '';
            });

            if (modes.includes('Total working Day')) {
                exportRow['Total Present'] = row.tpdays ?? '';
            }

            if (modes.includes('Show Holiday Punch')) {
                exportRow['Total Worked on Holidays'] = row.hwkdays ?? '';
            }

            if (modes.includes('Date Of Joining')) {
                exportRow['Date of Joining'] = row.doj ? format(new Date(row.doj), 'dd-MM-yyyy') : '';
            }

            return exportRow;
        });

        exportToExcel(exportData, `Employee_Yearly_Report_${new Date().getTime()}`);
    };

    const handlePrint = () => {
        const dataToPrint = selectedRows.length > 0 ? selectedRows : reportData;
        if (dataToPrint.length === 0) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const columnHeaders = [
            'Sl.No',
            'Employee Code',
            'Employee Name',
            'Designation',
            ...dynamicMonths.map((m: string) => m.replace('_', ' '))
        ];

        if (modes.includes('Total working Day')) columnHeaders.push('Total Present');
        if (modes.includes('Show Holiday Punch')) columnHeaders.push('Total Worked on Holidays');
        if (modes.includes('Date Of Joining')) columnHeaders.push('Date of Joining');

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Employee Yearly Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
                    h1 { color: #4f46e5; margin: 0; font-size: 24px; }
                    p { margin: 5px 0; color: #666; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; }
                    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
                    th { background-color: #f8fafc; color: #1e293b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
                    tr:nth-child(even) { background-color: #f1f5f9; }
                    .footer { margin-top: 30px; text-align: right; font-size: 10px; color: #94a3b8; }
                    @media print {
                        body { margin: 0; }
                        @page { margin: 1.5cm; landscape: true; }
                        table { font-size: 9px; }
                        .header { border-bottom-color: #000; }
                        th { background-color: #eee !important; color: #000 !important; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Employee Yearly Report</h1>
                    <p>Generated on ${format(new Date(), 'dd MMMM yyyy, hh:mm a')}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            ${columnHeaders.map((header) => `<th>${header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${dataToPrint
                            .map(
                                (row: YearRow, index: number) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${row.ecode || ''}</td>
                                <td>${row.ename || ''}</td>
                                <td>${row.designation || ''}</td>
                                ${dynamicMonths.map((m: string) => `<td>${row[m] ?? ''}</td>`).join('')}
                                ${modes.includes('Total working Day') ? `<td>${row.tpdays ?? ''}</td>` : ''}
                                ${modes.includes('Show Holiday Punch') ? `<td>${row.hwkdays ?? ''}</td>` : ''}
                                ${modes.includes('Date Of Joining') ? `<td>${row.doj ? format(new Date(row.doj), 'dd-MM-yyyy') : ''}</td>` : ''}
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
                <div class="footer">
                    Printed via IVRM Management System
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 300);
    };

    const shouldShowTable = searchParams?.fromDate && searchParams?.toDate && reportData.length > 0;

    return (
        <FormProvider<YearRow>>
            <div className='min-h-screen'>
                <div className='container space-y-4 p-1'>
                    <FormSections searchParams={searchParams} />

                    {/* {shouldShowTable && (
                        
                    )} */}

                    {isLoading && searchParams?.fromDate && searchParams?.toDate && (
                        <div className='flex items-center justify-center py-12'>
                            <div className='text-center'>
                                <p className='mt-4 text-muted-foreground'>Loading report data...</p>
                            </div>
                        </div>
                    )}

                    {!isLoading && searchParams?.fromDate && searchParams?.toDate && reportData.length === 0 && response && (
                        <div className='rounded-lg border bg-card p-12 text-center'>
                            <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
                                <FileSpreadsheet className='h-6 w-6 text-muted-foreground' />
                            </div>
                            <h3 className='mt-4 font-semibold text-lg'>No Data Found</h3>
                            <p className='mt-2 text-muted-foreground text-sm'>
                                {response?.message || 'No employee yearly report data found for the selected criteria.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </FormProvider>
    );
}
