'use server';

import { api } from '@/lib/apiService';

// Notice Board Data
export async function getStudentDashboardNoticeBoard(data: any) {
    const url = `/StudentDashboardFacade/viewnotice`;
    return await api.post<any>('portal', url, data);
}

// Classwork Data
export async function getStudentDashboardClasswork(data: any) {
    const url = `/StudentDashboardFacade/viewclasswork`;
    return await api.post<any>('portal', url, data);
}
