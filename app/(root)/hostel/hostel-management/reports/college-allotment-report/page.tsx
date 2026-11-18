'use client';

import { getCollegeAllotmentReportLoadData } from '@/server/hostel/hostel-management/reports/college-allotment-report';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import CollegeAllotmentReportClient from './_components/report-client';

export default function CollegeAllotmentReportPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<{ yearlist: any[]; hostellist: any[] }>({
        yearlist: [],
        hostellist: []
    });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getCollegeAllotmentReportLoadData();
                setData(res);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load college allotment report master data');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    if (isLoading) {
        return (
            <div className='flex h-[50vh] w-full items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    return (
        <div className='container mx-auto p-0'>
            <CollegeAllotmentReportClient dropdowns={data} />
        </div>
    );
}
