import { getBookArrivalReportInitialData } from '@/server/library/reports/book-arrival-report';
import { BookArrivalReportClient } from './_components/book-arrival-report-client';

export default async function BookArrivalReportPage() {
    const initialData = await getBookArrivalReportInitialData();
    return <BookArrivalReportClient initialData={initialData} />;
}
