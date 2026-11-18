'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useLibTransactionReportSearch } from '@/hooks/library/reports/useLibTransactionReport';
import type { ILibTransactionReportGridData, ILibTransactionReportRequest } from '@/types/library/reports/lib-transaction-report';
import { useState } from 'react';
import { LibTransactionClassColumns, LibTransactionStatusColumns } from './_components/columns';
import { ReportForm } from './_components/report-form';

import { exportToExcel } from '@/lib/export-to-file';

export default function LibTransactionReportPage() {
    const [reportData, setReportData] = useState<ILibTransactionReportGridData[]>([]);
    const [isStatusCount, setIsStatusCount] = useState(false);

    const searchMutation = useLibTransactionReportSearch();

    const handleSearch = (data: ILibTransactionReportRequest) => {
        setIsStatusCount(data.statuscount);
        searchMutation.mutate(data, {
            onSuccess: (response: any) => {
                const list = (response.alldata ||
                    response.reportlist ||
                    response.griddata ||
                    response.statuslist ||
                    (Array.isArray(response) ? response : [])) as ILibTransactionReportGridData[];
                setReportData(list);
            }
        });
    };

    const handleExport = () => {
        const columns = isStatusCount
            ? [
                  { label: 'Status', value: 'LBTR_Status' },
                  { label: 'Count', value: 'seccount' }
              ]
            : [
                  { label: 'Class', value: 'ASMCL_ClassName' },
                  { label: 'Section', value: 'ASMC_SectionName' },
                  { label: 'Count', value: 'seccount' }
              ];

        exportToExcel('Lib_Transaction_Report', JSON.stringify(columns), JSON.stringify(reportData));
    };

    return (
        <div className='space-y-4'>
            <CollapsibleSection title='Student Book Transaction Count Report' defaultOpen={true}>
                <ReportForm
                    onSearch={handleSearch}
                    isLoading={searchMutation.isPending}
                    onPrint={() => window.print()}
                    onExport={handleExport}
                    onCancel={() => setReportData([])}
                    hasData={reportData.length > 0}
                />
            </CollapsibleSection>

            {reportData.length > 0 && (
                <CollapsibleSection title='Report Grid' defaultOpen={true}>
                    <GenericDataTable
                        columns={isStatusCount ? LibTransactionStatusColumns : LibTransactionClassColumns}
                        data={reportData}
                        isLoading={false}
                    />
                </CollapsibleSection>
            )}
        </div>
    );
}
