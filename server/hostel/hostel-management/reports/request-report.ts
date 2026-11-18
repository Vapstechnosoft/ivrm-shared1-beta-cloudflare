'use server';

import { api } from '@/lib/apiService';
import { format } from 'date-fns';

export interface RequestReportDto {
    grid_list: Array<{
        studentname?: string;
        empname?: string;
        ASMCL_ClassName?: string;
        HRMD_DepartmentName?: string;
        HLMH_Name: string;
        HLMRCA_RoomCategory: string;
        HLHSREQ_RequestDate?: string;
        HLHSTREQ_RequestDate?: string;
        HLHSREQ_BookingStatus?: string;
        [key: string]: any;
    }>;
}

export async function getRequestReport(values: any): Promise<RequestReportDto> {
    try {
        const payload = {
            type: values.type,
            frmdate: format(new Date(values.fromDate), 'yyyy-MM-dd'),
            todate: format(new Date(values.toDate), 'yyyy-MM-dd')
        };
        const res = await api.post<RequestReportDto>('default', 'Hostel_Request_Report/getreport', payload);
        if (res.data) return res.data;
        return { grid_list: [] };
    } catch (error) {
        console.error('Error fetching request report:', error);
        return { grid_list: [] };
    }
}
