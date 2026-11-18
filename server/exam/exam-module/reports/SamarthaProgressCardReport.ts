'use server';

import { api } from '@/lib/apiService';

export async function getSamarthaProgressCardReport(data: any) {
    try {
        const url = '/JSHSExamReports/nds_9_report';
        const payload = {
            ASMAY_Id: data.asmaY_Id,
            ASMCL_Id: data.asmcL_Id,
            ASMS_Id: data.asmS_Id,
            Temp_AmstIds: data.studentList
        };
        const response = await api.post<any>('exam', url, payload);
        return response;
    } catch (error) {
        console.error('getSamarthaProgressCardReport error:', error);
        return {
            success: false,
            status: 500,
            message: 'Server error occurred while fetching report',
            data: null
        };
    }
}

export async function getSamarthaStudentsBySection(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
}) {
    try {
        const url = '/JSHSExamReports/GetStudentDetails';
        const response = await api.post<any>('exam', url, data);
        return response;
    } catch (error) {
        console.error('getSamarthaStudentsBySection error:', error);
        return { success: false, data: null };
    }
}
