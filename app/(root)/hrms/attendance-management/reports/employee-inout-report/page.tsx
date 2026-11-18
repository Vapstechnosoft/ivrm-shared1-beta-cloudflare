'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useEmployeeInOutReport } from '@/hooks/hrms/attendance-management/useReports';
import { exportToExcel } from '@/lib/utils';
import { format } from 'date-fns';
import { FileSpreadsheet } from 'lucide-react';
import { useMemo, useState } from 'react';
import AddEmployeeInOutReportForm from './_components/add-from';
import type { InOutRow } from './_components/columns';
import { getEmployeeInOutReportColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function EmployeeInOutReportPage() {
    const [liveTimeFilter, setLiveTimeFilter] = useState<string | undefined>(undefined);
    // Remove searchParams dependency from the query to avoid pagination clearing cache
    const { data: response, isLoading, error } = useEmployeeInOutReport({});

    return (
        <FormProvider<InOutRow>>
            <EmployeeInOutReportPageContent
                response={response}
                isLoading={isLoading}
                error={error}
                liveTimeFilter={liveTimeFilter}
                setLiveTimeFilter={setLiveTimeFilter}
            />
        </FormProvider>
    );
}

function FormSections({ setLiveTimeFilter }: { setLiveTimeFilter: (v: string | undefined) => void }) {
    const { closeAddForm, addFormRef } = useFormContext<InOutRow>();

    return (
        <>
            <div ref={addFormRef}>
                <CollapsibleSection
                    title='Generate Employee In/Out Report'
                    description='Fill in the details below to generate the report'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                    <div className='relative'>
                        <AddEmployeeInOutReportForm onSuccess={closeAddForm} onTimeFilterChange={setLiveTimeFilter} />
                    </div>
                </CollapsibleSection>
            </div>
        </>
    );
}

function EmployeeInOutReportPageContent({
    response,
    isLoading,
    error,
    liveTimeFilter,
    setLiveTimeFilter
}: {
    response: any;
    isLoading: boolean;
    error: any;
    liveTimeFilter?: string;
    setLiveTimeFilter: (v: string | undefined) => void;
}) {
    console.log('final response', response);
    const transformedResponse = useMemo(() => {
        if (!response?.data?.report_data) return { data: [], columnnames: [], success: response?.success, message: response?.message };

        const reportData = Array.isArray(response.data.report_data) ? response.data.report_data : [];
        const columnnames = Array.isArray(response.data.columnnames) ? response.data.columnnames : [];

        // Instant filtering logic based on the dropdown
        const timeInTimeOutFilter = liveTimeFilter || response?.timeInTimeOut || undefined;

        const transformed: any[] = [];
        const groupedByEmployee = new Map();

        reportData.forEach((row: any) => {
            const empId = row.hrmE_Id;
            if (!groupedByEmployee.has(empId)) {
                groupedByEmployee.set(empId, {
                    ecode: row.ecode,
                    ename: row.ename,
                    designation: row.hrmdeS_DesignationName,
                    type: row.hrmgT_EmployeeGroupType,
                    inDates: {},
                    outDates: {}
                });
            }

            const empData = groupedByEmployee.get(empId);
            const dateStr = row.foeP_PunchDate?.split('T')[0];

            if (dateStr) {
                if (row.foepD_InOutFlg === 'I') {
                    empData.inDates[dateStr] = row.foepD_PunchTime;
                } else if (row.foepD_InOutFlg === 'O') {
                    empData.outDates[dateStr] = row.foepD_PunchTime;
                }
            }
        });

        Array.from(groupedByEmployee.entries()).forEach(([empId, data]: [string, any]) => {
            const filter = timeInTimeOutFilter;

            if (filter === 'Time In') {
                const inRow: any = {
                    id: `${empId}_I`,
                    ecode: data.ecode,
                    ename: data.ename,
                    designation: data.designation,
                    type: data.type,
                    inOutFlg: 'In'
                };
                columnnames.forEach((col: string) => {
                    inRow[col] = data.inDates[col] || '--';
                });
                transformed.push(inRow);
            } else if (filter === 'Time Out') {
                const outRow: any = {
                    id: `${empId}_O`,
                    ecode: data.ecode,
                    ename: data.ename,
                    designation: data.designation,
                    type: data.type,
                    inOutFlg: 'Out'
                };
                columnnames.forEach((col: string) => {
                    outRow[col] = data.outDates[col] || '--';
                });
                transformed.push(outRow);
            } else {
                // "In Out" or completely unfiltered -> combine into object for stacked UI
                const combinedRow: any = {
                    id: `${empId}_IO`,
                    ecode: data.ecode,
                    ename: data.ename,
                    designation: data.designation,
                    type: data.type,
                    inOutFlg: { in: 'In', out: 'Out' }
                };
                columnnames.forEach((col: string) => {
                    combinedRow[col] = {
                        in: data.inDates[col] || '--',
                        out: data.outDates[col] || '--'
                    };
                });
                transformed.push(combinedRow);
            }
        });

        return {
            success: response?.success,
            message: response?.message,
            data: transformed,
            columnnames
        };
    }, [response, liveTimeFilter]);

    const tableProps = useDataTableProps(transformedResponse);
    console.log('tableProps', tableProps);
    const dynamicColumns = useMemo(() => getEmployeeInOutReportColumns(transformedResponse.columnnames), [transformedResponse.columnnames]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), 'dd-MM-yyyy');
        } catch (e) {
            console.error('Error formatting date:', e);
            return dateString; // Return original if invalid
        }
    };

    const handleExportToExcel = () => {
        const dataToExport = transformedResponse.data;
        if (!dataToExport || dataToExport.length === 0) return;

        // Get all column keys from the first row (to handle dynamic date columns)
        const firstRow = dataToExport[0];
        const allKeys = Object.keys(firstRow || {});

        // Filter out internal keys and prepare column headers
        const excludeKeys = ['user_id', 'id', '_id'];
        const columnKeys = allKeys.filter((key) => !excludeKeys.includes(key));

        // Prepare data for export with all columns dynamically
        const exportData = dataToExport.map((row, index) => {
            const exportRow: Record<string, any> = {
                'Sl.No': index + 1
            };

            // Add all other columns dynamically
            columnKeys.forEach((key) => {
                const val = row[key];
                const headerName = key
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                if (typeof val === 'object' && val !== null) {
                    if (key === 'inOutFlg') {
                        exportRow[headerName] = 'In/Out';
                    } else {
                        // Dynamic date column
                        exportRow[headerName] = `In: ${val.in || '--'}, Out: ${val.out || '--'}`;
                    }
                } else if (key === 'date' && val) {
                    exportRow['Date'] = format(new Date(val), 'dd-MM-yyyy');
                } else {
                    exportRow[headerName] = val ?? '';
                }
            });

            return exportRow;
        });

        exportToExcel(exportData, 'Employee_InOut_Report');
    };

    return (
        <>
            <div className='min-h-screen'>
                <div className='container space-y-4 p-1'>
                    {/* Add Form Section (shown first) */}
                    <FormSections setLiveTimeFilter={setLiveTimeFilter} />

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

                            <div className='rounded-md shadow-sm'>
                                <div className='mb-4 bg-gray-200 px-4 py-2 text-center font-bold text-black text-sm tracking-wide shadow-inner'>
                                    Employee In Out Report from {formatDate(response?.fromDate)} to {formatDate(response?.toDate)}
                                </div>
                                <GenericDataTable
                                    {...tableProps}
                                    columns={dynamicColumns as any}
                                    isLoading={isLoading}
                                    showViewOptions={false}
                                    isSearchRequired={false}
                                    isPaginationRequired={false}
                                    scrollable
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
