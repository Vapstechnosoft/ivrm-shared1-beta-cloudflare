
'use client'
import { getRackReportInitialData } from '@/server/library/reports/rack-report';
import { RackReportClient } from './_components/rack-report-client';

export default async function RackReportPage() {
    const initialData = await getRackReportInitialData();
    return <RackReportClient initialData={initialData} />;
}
