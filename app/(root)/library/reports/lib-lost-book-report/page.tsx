'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { useLibLostBookReportSearch } from '@/hooks/library/reports/useLibLostBookReport';
import type { ILibLostBookReportGridData, ILibLostBookReportRequest } from '@/types/library/reports/lib-lost-book-report';
import { useState } from 'react';
import { toast } from 'sonner';
import { LibLostBookReportColumns } from './_components/columns';
import { ReportForm } from './_components/report-form';

export default function LibLostBookReportPage() {
    const [reportData, setReportData] = useState<ILibLostBookReportGridData[]>([]);

    const searchMutation = useLibLostBookReportSearch();

    const handleSearch = (data: ILibLostBookReportRequest) => {
        searchMutation.mutate(data, {
            onSuccess: (response) => {
                setReportData(response || []);
                if (response.length === 0) {
                    toast.warning('No records found for the given criteria.');
                    return;
                }
                if (response.length > 0) {
                    toast.success(`Report fetched successfully with ${response.length} records.`);
                }
            }
        });
    };

    return (
        <div className='min-h-screen space-y-6 bg-background p-4'>
            <div className='mx-auto max-w-5xl'>
                <ReportForm onSearch={handleSearch} isLoading={searchMutation.isPending} />

                {reportData.length > 0 && (
                    <div className='mt-8 border-t pt-8'>
                        <h2 className='mb-4 font-bold text-lg'>Report Details</h2>
                        <GenericDataTable columns={LibLostBookReportColumns} data={reportData} isLoading={false} />
                    </div>
                )}
            </div>
        </div>
    );
}
