'use server';

import { api } from '@/lib/apiService';

export async function getStudentSmartCardLogInitialDetails() {
    const url = `/StudentSmartCardLogReport/loaddata`;
    return await api.get<any>('admission', url);
}

export async function getStudentSmartCardLogNameRegNo(data: any) {
    const url = `/StudentSmartCardLogReport/getregnoname?regornamedetails=${data.regornamedetails}`;
    return await api.get<any>('admission', url);
}

export async function getStudentSmartCardLogReport(data: any) {
    const url = `/StudentSmartCardLogReports/Getreportdetails`;
    return await api.post<any>('admission', url, data);
}
