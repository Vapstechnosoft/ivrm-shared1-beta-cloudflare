'use client';

import { useStudentAgeCalculationReport } from '@/hooks/sports/useStudentAgeCalculationReport';
import type { IReportRequest } from '@/types/sports/reports/student-age-calculation';
import { use, useState } from 'react';
import ReportForm from './_components/report-form';
import ReportGrid from './_components/report-grid';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function StudentAgeCalculationReportPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const [lastPayload, setLastPayload] = useState<IReportRequest | null>(null);

    const { reportQuery } = useStudentAgeCalculationReport(lastPayload || undefined, searchParams);

    return (
        <div className='flex flex-col gap-6'>
            <ReportForm
                onReportGenerated={(_data, payload) => {
                    setLastPayload(payload);
                }}
                onReset={() => {
                    setLastPayload(null);
                }}
                isPending={reportQuery.isFetching}
            />
            {lastPayload && <ReportGrid data={reportQuery.data || []} isLoading={reportQuery.isFetching} />}
        </div>
    );
}
