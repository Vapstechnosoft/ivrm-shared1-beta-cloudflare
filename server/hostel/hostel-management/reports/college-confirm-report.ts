'use server';

import { api } from '@/lib/apiService';
import { format } from 'date-fns';

const SERVICE_NAME = 'default';

export interface CollegeConfirmReportDto {
    grid_list?: Array<{
        studentname?: string;
        empname?: string;
        AMCO_CourseName?: string;
        courseName?: string;
        AMSE_SemesterName?: string;
        semesterName?: string;
        HRMD_DepartmentName?: string;
        HLMH_Name: string;
        HRMRM_RoomNo: string;
        HLHSREQC_ConfirmDate?: string;
        HLHSTREQC_ConfirmDate?: string;
        HLHSREQC_Remarks?: string;
        [key: string]: any;
    }>;
}

export async function getCollegeConfirmReport(values: any): Promise<CollegeConfirmReportDto> {
    const payload = {
        type: values.type,
        frmdate: format(new Date(values.fromDate), 'yyyy-MM-dd'),
        todate: format(new Date(values.toDate), 'yyyy-MM-dd')
    };

    // Try CLGHostelConfirmReport/getreport
    try {
        const res = await api.post<any>('hostel', '/CLGHostelConfirmReport/getreport', payload);
        if (res.data) return res.data;
    } catch (error) {
        console.warn('CLGHostelConfirmReport/getreport failed, trying CLGHostel_Confirm_Report...', error);
    }

    // Try CLGHostel_Confirm_Report/getreport
    try {
        const res = await api.post<any>('hostel', '/CLGHostel_Confirm_Report/getreport', payload);
        if (res.data) return res.data;
    } catch (error) {
        console.warn('CLGHostel_Confirm_Report/getreport failed, trying fallback to school...', error);
    }

    // Fallback to School Endpoint: Hostel_Confirm_Report/getreport
    try {
        const res = await api.post<any>('hostel', '/Hostel_Confirm_Report/getreport', payload);
        if (res.data) return res.data;
    } catch (error) {
        console.error('All confirm report endpoints failed:', error);
    }

    return { grid_list: [] };
}
