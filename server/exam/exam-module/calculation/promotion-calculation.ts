'use server';

import { api } from '@/lib/apiService';
// biome-ignore lint/style/useImportType: <explanation>
import { ExamCalculationResponse } from '@/types/exam/exam-module/calculation';

export async function promotionCalculation(asmaY_Id: number, asmcL_Id: number, asmS_Id: number): Promise<ExamCalculationResponse> {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    if (!asmcL_Id) throw new Error('Class ID is required');
    if (!asmS_Id) throw new Error('Section ID is required');

    // This is the CORRECT endpoint that actually exists
    const url = '/promotion_calculation/promotion_calculation';

    // Parameters must be passed as query string for this endpoint
    const params = {
        // MI_Id: 30,
        ASMAY_Id: asmaY_Id,
        ASMCL_Id: asmcL_Id,
        ASMS_Id: asmS_Id
    };

    // Use GET with params instead of POST with body
    const response = await api.post<ExamCalculationResponse>('exam', url, params);
    console.info('response', response.data);
    console.info('url', url);
    return response ?? {};
}
