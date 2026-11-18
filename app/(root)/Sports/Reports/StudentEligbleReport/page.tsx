'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useStudentEligibleReport } from '@/hooks/sports/useStudentEligibleReport';
import type { IStudentEligibleReportDetail, IStudentEligibleReportRequest } from '@/types/sports/reports/student-eligible-report';
import { useState } from 'react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { columns } from './_components/columns';
import ReportForm from './_components/report-form';

import { use } from 'react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function StudentEligibleReportPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const [currentPayload, setCurrentPayload] = useState<IStudentEligibleReportRequest | null>(null);

    // Using the query version of the report fetcher to manage dependencies and avoid infinite loops
    // This correctly depends on both the user's form payload AND the table's state (searchParams)
    const { reportQuery, isLoading: isLoadLoading } = useStudentEligibleReport(currentPayload || undefined, searchParams);

    const reportResponse = reportQuery.data;
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'Student_Eligible_Report',
        pageStyle: `
          @page { size: portrait; margin: 20mm; }
          @media print {
            body { -webkit-print-color-adjust: exact; }
            table { border-collapse: collapse !important; width: 100% !important; }
            th, td { border: 1px solid #000 !important; padding: 8px !important; text-align: center !important; }
          }
        `
    });

    const handleExcel = () => {
        if (reportResponse?.data) {
            const worksheet = XLSX.utils.json_to_sheet(reportResponse.data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
            XLSX.writeFile(workbook, 'StudentEligibleReport.xlsx');
        }
    };

    const handleReport = (data: any, payload: any) => {
        // Just set the payload; the reportQuery in useStudentEligibleReport will handle the fetching
        setCurrentPayload(payload);
    };

    const handleReset = () => {
        setCurrentPayload(null);
    };

    const tableProps = useDataTableProps(reportResponse);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-4'>
                <div className='flex items-center justify-between'>
                    <h2 className='font-bold text-2xl tracking-tight'>Student Eligible Report</h2>
                </div>

                <CollapsibleSection title='Report Filters' defaultOpen={true} variant='default' className='shadow-lg'>
                    <ReportForm
                        onReport={handleReport}
                        onReset={handleReset}
                        onPrint={() => handlePrint()}
                        onExcel={handleExcel}
                        hasData={!!reportResponse?.data?.length}
                        isLoading={reportQuery.isLoading || reportQuery.isFetching}
                    />
                </CollapsibleSection>

                <CollapsibleSection
                    title='STUDENT ELIGIBLE REPORT LIST'
                    defaultOpen={!!reportResponse?.data?.length}
                    variant='default'
                    size='lg'
                    className='shadow-lg'>
                    <div ref={componentRef} className='rounded-lg bg-white p-4'>
                        <style jsx global>{`
                            @media screen {
                                .print-only { display: none !important; }
                            }
                            @media print {
                                .screen-only { display: none !important; }
                                .print-only { display: block !important; }
                                body { -webkit-print-color-adjust: exact !important; background: white !important; }
                            }
                        `}</style>

                        <div className='mb-6 hidden text-center print:block'>
                            <h2 className='font-bold text-2xl text-primary uppercase underline'>Student Eligible Report</h2>
                        </div>

                        <div className='screen-only'>
                            <GenericDataTable<IStudentEligibleReportDetail>
                                {...tableProps}
                                columns={columns}
                                isLoading={reportQuery.isLoading}
                                error={reportQuery.isError ? reportQuery.error : null}
                                showSearchColumns={true}
                                showViewOptions={true}
                                loadingMessage='Loading report data...'
                                noDataTitle='No Records Found'
                                errorTitle='Error Loading Data'
                            />
                        </div>

                        <div className='print-only overflow-x-auto'>
                            <table className='w-full border-collapse border border-gray-300 text-center text-[10pt]'>
                                <thead>
                                    <tr className='bg-gray-100'>
                                        <th className='whitespace-nowrap border border-gray-300 bg-gray-50 p-2 font-bold'>SL. No.</th>
                                        <th className='whitespace-nowrap border border-gray-300 bg-gray-50 p-2 font-bold'>Adm. No.</th>
                                        <th className='whitespace-nowrap border border-gray-300 bg-gray-50 p-2 font-bold'>Student Name</th>
                                        <th className='whitespace-nowrap border border-gray-300 bg-gray-50 p-2 font-bold'>Class</th>
                                        <th className='whitespace-nowrap border border-gray-300 bg-gray-50 p-2 font-bold'>Section</th>
                                        <th className='whitespace-nowrap border border-gray-300 bg-gray-50 p-2 font-bold'>DOB</th>
                                        <th className='whitespace-nowrap border border-gray-300 bg-gray-50 p-2 font-bold'>Age</th>
                                        <th className='whitespace-nowrap border border-gray-300 bg-gray-50 p-2 font-bold'>Father Name</th>
                                        <th className='whitespace-nowrap border border-gray-300 bg-gray-50 p-2 font-bold'>Mother Name</th>
                                        <th className='whitespace-nowrap border border-gray-300 bg-gray-50 p-2 font-bold'>Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(reportResponse?.data || []).length > 0 ? (
                                        reportResponse?.data?.map((row: any, rowIndex: number) => (
                                            <tr key={rowIndex}>
                                                {columns.map((col: any, colIndex) => (
                                                    <td key={colIndex} className='border border-gray-300 p-2'>
                                                        {col.id === 'serialNo' || col.accessorKey === 'serialNo'
                                                            ? ((Number(searchParams?.page) || 1) - 1) *
                                                                  (Number(searchParams?.page_size) || 10) +
                                                              rowIndex +
                                                              1
                                                            : col.accessorKey
                                                              ? row[col.accessorKey]
                                                              : col.cell
                                                                ? (col.cell as any)({
                                                                      row: { original: row, index: rowIndex },
                                                                      table: {
                                                                          getState: () => ({
                                                                              pagination: {
                                                                                  pageIndex: (Number(searchParams?.page) || 1) - 1,
                                                                                  pageSize: Number(searchParams?.page_size) || 10
                                                                              }
                                                                          })
                                                                      }
                                                                  })
                                                                : ''}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={columns.length}
                                                className='border border-gray-300 p-10 text-center font-medium text-muted-foreground'>
                                                No Records Found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
}
