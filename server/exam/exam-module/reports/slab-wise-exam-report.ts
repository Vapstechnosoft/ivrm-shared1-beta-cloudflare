'use server';

import { api } from '@/lib/apiService';

/**
 * Slab Wise Exam Report Server Actions
 */

export async function getInitialData() {
    const url = '/CumulativeReport/Getdetails';
    return await api.get<any>('exam', url);
}

export async function getSubjects(data: any) {
    const url = '/SlabWiseExamReport/getsubjects';
    return await api.post<any>('exam', url, data);
}

export async function getSlabReport(data: any) {
    const url = '/SlabWiseExamReport/getslabreport';
    return await api.post<any>('exam', url, data);
}
