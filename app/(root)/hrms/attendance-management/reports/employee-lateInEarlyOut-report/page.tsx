'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useEmployeeLateInEarlyOutReport } from '@/hooks/hrms/attendance-management/useReports';
import { exportToExcel } from '@/lib/utils';
import { format } from 'date-fns';
import { FileSpreadsheet } from 'lucide-react';
import { use, useMemo } from 'react';
import AddEmployeeLateInEarlyOutReportForm from './_components/add-from';
import type { LIEORow } from './_components/columns';
import { getEmployeeLateInEarlyOutReportColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function EmployeeLateInEarlyOutReportPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useEmployeeLateInEarlyOutReport({});

    return (
        <FormProvider<LIEORow>>
            <EmployeeLateInEarlyOutReportPageContent response={response} isLoading={isLoading} error={error} searchParams={searchParams} />
        </FormProvider>
    );
}

function FormSections({ searchParams }: { searchParams?: any }) {
    const { closeAddForm, addFormRef } = useFormContext<LIEORow>();

    return (
        <div ref={addFormRef}>
            <CollapsibleSection
                title='Generate Employee Late In/Early Out Report'
                description='Fill in the details below to generate the report'
                defaultOpen={true}
                variant='outline'
                size='md'
                className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                <div className='relative'>
                    <AddEmployeeLateInEarlyOutReportForm onSuccess={closeAddForm} searchParams={searchParams} />
                </div>
            </CollapsibleSection>
        </div>
    );
}

function EmployeeLateInEarlyOutReportPageContent({
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
    const transformedResponse = useMemo(() => {
        if (!response?.data || !Array.isArray(response.data)) {
            return { data: [], columnnames: [], success: response?.success, message: response?.message, mode: response?.mode };
        }

        const reportData = response.data;
        const mode = response.mode; // 'Late By', 'Early Out', 'Late In Early Out'
        const groupedByEmployee = new Map<number, LIEORow>();
        const dateSet = new Set<string>();

        reportData.forEach((row: any) => {
            const empId = row.hrmE_Id;
            const dateStr = row.punchdate?.split('T')[0];

            if (dateStr) {
                dateSet.add(dateStr);
            }

            if (!groupedByEmployee.has(empId)) {
                groupedByEmployee.set(empId, {
                    id: row.id || empId,
                    createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
                    hrmE_Id: empId,
                    ecode: row.ecode,
                    ename: row.ename,
                    depname: row.depname,
                    desgname: row.desgname,
                    gtype: row.gtype
                } as LIEORow);
            }

            const empData = groupedByEmployee.get(empId)!;
            if (dateStr) {
                if (mode === 'Late In Early Out') {
                    // Store both in and out for nested display
                    empData[dateStr] = {
                        in: row.intime || '--',
                        out: row.outtime || '--'
                    };
                } else if (mode === 'Late By') {
                    empData[dateStr] = row.lateby || '--';
                } else if (mode === 'Early Out') {
                    empData[dateStr] = row.earlyby || '--';
                } else {
                    empData[dateStr] = row.intime || '--';
                }
            }
        });

        // Sort dates chronologically
        const columnnames = Array.from(dateSet).sort();

        return {
            success: response.success,
            message: response.message,
            data: Array.from(groupedByEmployee.values()),
            columnnames,
            mode,
            fromDate: response.fromDate,
            toDate: response.toDate
        };
    }, [response]);

    const tableProps = useDataTableProps(transformedResponse);
    const dynamicColumns = useMemo(
        () => getEmployeeLateInEarlyOutReportColumns(transformedResponse.columnnames, transformedResponse.mode),
        [transformedResponse.columnnames, transformedResponse.mode]
    );

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), 'dd-MM-yyyy');
        } catch (e) {
            return dateString;
        }
    };

    const handleExportToExcel = () => {
        const dataToExport = transformedResponse.data;
        if (!dataToExport || dataToExport.length === 0) return;

        const columnnames = transformedResponse.columnnames;
        const mode = transformedResponse.mode;

        const exportData = dataToExport.map((row, index) => {
            const exportRow: any = {
                'Sl.No': index + 1,
                'Employee Name': row.ename,
                Code: row.ecode,
                Designation: row.desgname
            };

            columnnames.forEach((dateStr) => {
                const val = row[dateStr];
                const header = format(new Date(dateStr), 'dd-MMM EEE');

                if (mode === 'Late In Early Out' && typeof val === 'object') {
                    exportRow[header] = `In: ${val.in}, Out: ${val.out}`;
                } else {
                    exportRow[header] = val || '--';
                }
            });

            return exportRow;
        });

        exportToExcel(exportData, `Employee_${(mode || 'LIEO').replace(/\s+/g, '_')}_Report`);
    };

    const headerTitle = transformedResponse.mode ? `Employee ${transformedResponse.mode} Report` : 'Employee Late In/Early Out Report';

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Add Form Section (shown first) */}
                <FormSections searchParams={searchParams} />

                {/* Data Table Section */}
                {transformedResponse.data.length > 0 && (
                    <div className='mt-8 space-y-4 rounded-lg bg-white p-6 shadow'>
                        <div className='flex items-center justify-between border-b pb-4'>
                            <h2 className='font-semibold text-gray-800 text-lg'>Report Results</h2>
                            <div className='flex gap-2'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={handleExportToExcel}
                                    className='bg-green-50 text-green-700 transition-all duration-200 hover:bg-green-100 hover:text-green-800'>
                                    <FileSpreadsheet className='mr-2 h-4 w-4' />
                                    Export Excel
                                </Button>
                            </div>
                        </div>

                        <div className='rounded-md shadow-sm '>
                            <div className='mb-4 bg-gray-400 px-4 py-2 text-center font-bold text-black text-sm tracking-wide shadow-inner'>
                                {headerTitle} from {formatDate(transformedResponse.fromDate)} to {formatDate(transformedResponse.toDate)}
                            </div>
                            <GenericDataTable<LIEORow>
                                {...tableProps}
                                columns={dynamicColumns as any}
                                isLoading={isLoading}
                                error={error}
                                showViewOptions={false}
                                isPaginationRequired={true}
                                loadingMessage='Loading Employee Late In/Early Out Reports...'
                                noDataTitle='No Employee Late In/Early Out Reports Found'
                                noDataDescription='Get started by generating your first Employee Late In/Early Out Report'
                                errorTitle='Error Loading Employee Late In/Early Out Reports'
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
