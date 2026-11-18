'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useEligibilityCertificateReport } from '@/hooks/sports/useEligibilityCertificateReport';
import type { IEligibilityCertificateReportDetail } from '@/types/sports/reports/eligibility-certificate-report';
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { columns } from './_components/columns';
import ReportForm from './_components/report-form';

export default function EligibilityCertificateReportPage() {
    const { data: loadGridData, isLoading, error } = useEligibilityCertificateReport();
    const [reportData, setReportData] = useState<IEligibilityCertificateReportDetail[]>([]);
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'Eligibility_Certificate_Report',
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
        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        XLSX.writeFile(workbook, 'EligibilityCertificateReport.xlsx');
    };

    // Initial load
    useEffect(() => {
        if (loadGridData?.success && loadGridData?.data?.pudatareport) {
            setReportData(loadGridData.data.pudatareport);
        }
    }, [loadGridData]);

    const handleReport = (data: any) => {
        if (Array.isArray(data)) {
            setReportData(data);
        } else if (data?.pudatareport && Array.isArray(data.pudatareport)) {
            setReportData(data.pudatareport);
        } else if (data?.datareport && Array.isArray(data.datareport)) {
            setReportData(data.datareport);
        } else if (data?.data?.pudatareport && Array.isArray(data.data.pudatareport)) {
            setReportData(data.data.pudatareport);
        } else if (data?.data?.datareport && Array.isArray(data.data.datareport)) {
            setReportData(data.data.datareport);
        } else if (data?.data && Array.isArray(data.data)) {
            setReportData(data.data);
        } else {
            setReportData([]);
        }
    };

    const handleReset = () => {
        if (loadGridData?.data?.pudatareport) {
            setReportData(loadGridData.data.pudatareport);
        } else {
            setReportData([]);
        }
    };

    // const handlePrint = () => {
    //     // Placeholder for print functionality
    //     //console.log('Print', reportResponse?.data);
    // };

    // const handleExcel = () => {
    //     // Placeholder for excel functionality
    //     //console.log('Excel', reportResponse?.data);
    // };

    const tableProps = useDataTableProps(reportData);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-4'>
                <div className='flex items-center justify-between'>
                    <h2 className='font-bold text-2xl tracking-tight'>Eligibility Certificate Report</h2>
                </div>

                <CollapsibleSection title='Report Filters' defaultOpen={true} variant='default' className='shadow-lg'>
                    <ReportForm
                        onReport={handleReport}
                        onReset={handleReset}
                        onPrint={() => handlePrint()}
                        onExcel={handleExcel}
                        hasData={reportData.length > 0}
                    />
                </CollapsibleSection>

                <CollapsibleSection
                    title='ELIGIBILITY CERTIFICATE REPORT LIST'
                    defaultOpen={true}
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
                            <h2 className='font-bold text-2xl uppercase underline'>Eligibility Certificate Report</h2>
                        </div>
                        <div className='screen-only'>
                            <GenericDataTable<IEligibilityCertificateReportDetail>
                                {...tableProps}
                                columns={columns}
                                isLoading={isLoading}
                                error={error}
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
                                        {columns.map((col: any, i) => (
                                            <th key={i} className='whitespace-nowrap border border-gray-300 bg-gray-50 p-2 font-bold'>
                                                {typeof col.header === 'string' ? col.header : col.header?.toString() || ''}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.length > 0 ? (
                                        reportData.map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {columns.map((col: any, colIndex) => (
                                                    <td key={colIndex} className='border border-gray-300 p-2'>
                                                        {col.accessorKey
                                                            ? (row as any)[col.accessorKey]
                                                            : col.cell
                                                              ? (col.cell as any)({ row: { original: row, index: rowIndex } })
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
