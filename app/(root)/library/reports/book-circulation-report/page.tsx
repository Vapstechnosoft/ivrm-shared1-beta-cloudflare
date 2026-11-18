import { getBookCirculationReportInitialData } from '@/server/library/reports/book-circulation-report';
import { BookCirculationReportClient } from './_components/book-circulation-report-client';

export default async function BookCirculationReportPage() {
    const initialData = await getBookCirculationReportInitialData();
    return <BookCirculationReportClient initialData={initialData} />;
}
