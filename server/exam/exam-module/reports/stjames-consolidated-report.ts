'use server';

import { api } from '@/lib/apiService';

export async function getStjamesConsolidatedReport(payload: any) {
    return await api.post<any>('exam', '/JSHSExamReportsFacade/stjames_exam_consolidated_report', payload);
}
