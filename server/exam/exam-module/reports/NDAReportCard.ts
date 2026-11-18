'use server';

import { api } from '@/lib/apiService';

export async function getNDAReportCard(data: any) {
    try {
        const studentArr = (data.studentList || data.temp_AmstIds || data.Temp_AmstIds || []).map((s: any) => ({
            AMST_Id: Number(s.amsT_Id ?? s.AMST_Id ?? s),
            amsT_Id: Number(s.amsT_Id ?? s.AMST_Id ?? s)
        }));

        const payload = {
            asmaY_Id: Number(data.asmaY_Id || data.ASMAY_Id || 0),
            asmcL_Id: Number(data.asmcL_Id || data.ASMCL_Id || 0),
            asmS_Id: Number(data.asmS_Id || data.ASMS_Id || 0),
            emE_Id: Number(data.emE_Id || data.EME_Id || 0),
            ASMAY_Id: Number(data.asmaY_Id || data.ASMAY_Id || 0),
            ASMCL_Id: Number(data.asmcL_Id || data.ASMCL_Id || 0),
            ASMS_Id: Number(data.asmS_Id || data.ASMS_Id || 0),
            EME_Id: Number(data.emE_Id || data.EME_Id || 0),
            temp_AmstIds: studentArr,
            Temp_AmstIds: studentArr,
            studentlist: studentArr,
            studentList: studentArr
        };

        const endpoints = [
            '/JSHSExamReports_/nds_6_8_report',
            '/JSHSExamReports_/promotion_report_card',
            '/JSHSExamReportsFacade/promotion_report_card',
            '/individual_exam_report_card/exam_report_card'
        ];

        for (const ep of endpoints) {
            try {
                console.log(`[getNDAReportCard] Attempting POST to: ${ep} with payload:`, JSON.stringify(payload));
                const response = await api.post<any>('exam', ep, payload);
                console.log(`[getNDAReportCard] Response from ${ep}:`, JSON.stringify(response)?.substring(0, 1000));
                
                const resData = response?.data || response;
                const hasDetails =
                    resData?.getstudentdetails?.length > 0 ||
                    resData?.getstudentmarksdetails?.length > 0 ||
                    resData?.studentdetails?.length > 0 ||
                    resData?.studentmarksdetails?.length > 0 ||
                    resData?.examwisedetailsnew?.length > 0;

                if (hasDetails) {
                    console.log(`[getNDAReportCard] Success with details from ${ep}`);
                    return { success: true, data: resData, endpoint: ep };
                }
                if (response && response.success !== false) {
                    return { success: true, data: resData, endpoint: ep };
                }
            } catch (err) {
                console.warn(`[getNDAReportCard] POST ${ep} failed:`, err);
            }
        }

        console.log('[getNDAReportCard] Final fallback call to /JSHSExamReports_/nds_6_8_report');
        const fallbackRes = await api.post<any>('exam', '/JSHSExamReports_/nds_6_8_report', payload);
        return { success: true, data: fallbackRes?.data || fallbackRes, endpoint: '/JSHSExamReports_/nds_6_8_report' };
    } catch (error) {
        console.error('getNDAReportCard error:', error);
        return {
            success: false,
            status: 500,
            message: 'Server error occurred while fetching report',
            data: null
        };
    }
}


