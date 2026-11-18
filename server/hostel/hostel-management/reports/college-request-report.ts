'use server';

import { api } from '@/lib/apiService';
import { format } from 'date-fns';

export interface CollegeRequestReportDto {
    grid_list: Array<{
        studentname?: string;
        empname?: string;
        AMCO_CourseName?: string;
        AMSE_SemesterName?: string;
        HRMD_DepartmentName?: string;
        HLMH_Name: string;
        HLMRCA_RoomCategory: string;
        HLHSREQ_RequestDate?: string;
        HLHSTREQ_RequestDate?: string;
        HLHSREQ_BookingStatus?: string;
        [key: string]: any;
    }>;
}

export async function getCollegeRequestReport(values: any): Promise<CollegeRequestReportDto> {
    const payload = {
        type: values.type,
        frmdate: format(new Date(values.fromDate), 'yyyy-MM-dd'),
        todate: format(new Date(values.toDate), 'yyyy-MM-dd')
    };

    // Try primary endpoint first
    try {
        const res = await api.post<CollegeRequestReportDto>('default', 'CLGHostelRequestReport/getreport', payload);
        if (res.data) return res.data;
    } catch (error) {
        console.warn('Primary CLGHostelRequestReport/getreport failed, attempting fallback...', error);

        // Attempt fallback endpoint
        try {
            const resFallback = await api.post<CollegeRequestReportDto>('default', 'CLGHostelRequestReport/get_report', payload);
            if (resFallback.data) return resFallback.data;
        } catch (fallbackError) {
            console.error('Fallback CLGHostelRequestReport/get_report also failed:', fallbackError);
        }
    }

    return { grid_list: [] };
}
