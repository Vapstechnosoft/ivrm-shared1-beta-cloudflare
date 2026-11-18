'use server';

import { api } from '@/lib/apiService';
import type { NDS9ReportData, NDS9ReportPayload, NDS9ReportResponse } from '@/types/exam/NDS/NDS_9_ProgressNewCardReport';
import type {
    ClassListResponse,
    NDSPromotionReportData,
    NDSPromotionReportPayload,
    NDSPromotionReportResponse,
    SectionListResponse,
    StudentListResponse
} from '@/types/exam/NDS/NDS_Promotionreportcard';

export async function getClasses(asmay_id: number) {
    const payload = { ASMAY_Id: asmay_id };
    const response = await api.post<any>('exam', '/JSHSExamReports_/get_classes', payload);
    return response as any as ClassListResponse;
}

export async function getSections(asmay_id: number, asmcl_id: number) {
    const payload = { ASMAY_Id: asmay_id, ASMCL_Id: asmcl_id };
    const response = await api.post<any>('exam', '/JSHSExamReports_/get_sections', payload);
    return response as any as SectionListResponse;
}

export async function getStudents(asmay_id: number, asmcl_id: number, asms_id: number) {
    const payload = { ASMAY_Id: asmay_id, ASMCL_Id: asmcl_id, ASMS_Id: asms_id };
    const response = await api.post<any>('exam', '/JSHSExamReports_/GetStudentDetails', payload);
    return response as any as StudentListResponse;
}

export async function getNDSPromotionReport(payload: NDSPromotionReportPayload): Promise<NDSPromotionReportData> {
    // Note: Angular calls "JSHSExamReports/nds_9_report"
    // Our apiService handles the base path.
    const response = await api.post<any>('exam', '/JSHSExamReports_/nds_9_report', payload);
    return {
        success: response?.success ?? false,
        data: (response?.data || response) as any as NDSPromotionReportResponse,
        message: response?.message
    };
}

export async function getNDS9Report(payload: NDS9ReportPayload): Promise<NDS9ReportData> {
    const response = await api.post<any>('exam', '/JSHSExamReports_/nds_6_8_report', payload);
    return {
        success: response?.success ?? false,
        data: (response?.data || response) as any as NDS9ReportResponse,
        message: response?.message
    };
}
