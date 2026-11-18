'use server';

import { api } from '@/lib/apiService';

export async function getSamarthaProgressCardReport(data: any) {
    try {
        const url = '/JSHSExamReports_/nds_6_8_report';
        const studentArr = (data.studentList || data.temp_Amstids || data.Temp_AmstIds || []).map((s: any) => ({
            AMST_Id: Number(s.amsT_Id ?? s.AMST_Id ?? s),
            amsT_Id: Number(s.amsT_Id ?? s.AMST_Id ?? s)
        }));

        const payload = {
            ASMAY_Id: Number(data.asmaY_Id ?? data.ASMAY_Id ?? 0),
            ASMCL_Id: Number(data.asmcL_Id ?? data.ASMCL_Id ?? 0),
            ASMS_Id: Number(data.asmS_Id ?? data.ASMS_Id ?? 0),
            studentlist: studentArr,
            Temp_AmstIds: studentArr
        };
        console.log('=== [ND6 API /nds_6_8_report] PAYLOAD ===', JSON.stringify(payload, null, 2));
        const response = await api.post<any>('exam', url, payload);
        console.log(
            '=== [ND6 API /nds_6_8_report] RESPONSE SUCCESS ===',
            response?.success,
            'KEYS:',
            response?.data ? Object.keys(response.data) : 'no data'
        );
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
