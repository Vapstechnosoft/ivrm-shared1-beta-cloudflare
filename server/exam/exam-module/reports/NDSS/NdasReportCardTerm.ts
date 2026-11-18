'use server';

import { api } from '@/lib/apiService';

function normalizeReportData(res: any): any {
    if (!res) return null;
    const data = res?.data || res;
    if (!data) return null;

    const studentDetails =
        data.getstudentdetails ||
        data.studentdetails ||
        data.studentDetails ||
        data.getstudentlist ||
        data.studentlist ||
        data.studentList ||
        [];

    return {
        ...data,
        getstudentdetails: Array.isArray(studentDetails) ? studentDetails : []
    };
}

export async function getNdasReportCardTerm(payload: any): Promise<any> {
    const formattedPayload = {
        ASMAY_Id: Number(payload.ASMAY_Id),
        ASMCL_Id: Number(payload.ASMCL_Id),
        ASMS_Id: Number(payload.ASMS_Id),
        Temp_AmstIds: (payload.Temp_AmstIds || payload.temp_AmstIds || []).map((item: any) => ({
            AMST_Id: Number(item.AMST_Id || item.amsT_Id || item),
            amsT_Id: Number(item.AMST_Id || item.amsT_Id || item)
        }))
    };

    const endpoints = [
        '/JSHSExamReports_/nds_6_8_report',
        '/JSHSExamReports/nds_6_8_report',
        '/JSHSExamReports_/nds_term_report',
        '/JSHSExamReports/nds_term_report',
        '/NDSSExamReports/nds_term_report'
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await api.post<any>('exam', endpoint, formattedPayload);
            if (response) {
                const normalized = normalizeReportData(response);
                if (normalized && normalized.getstudentdetails && normalized.getstudentdetails.length > 0) {
                    return {
                        success: true,
                        data: normalized,
                        message: response?.message || 'Report generated successfully'
                    };
                }
            }
        } catch (e) {
            console.warn(`POST ${endpoint} failed:`, e);
        }
    }

    return {
        success: false,
        data: null,
        message: 'No student records found for the selected criteria'
    };
}
