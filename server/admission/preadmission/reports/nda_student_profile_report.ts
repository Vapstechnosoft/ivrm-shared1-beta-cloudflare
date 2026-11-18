'use server';

import { api } from '@/lib/apiService';

/**
 * Fetches initial data for NDA Student Profile Status Report (Years, Classes, etc.)
 */
export async function getNdaStudentProfileInitialData() {
    const url = '/Smartcarddetails/getinitialdata';
    const res = await api.get<any>('admission', url);
    return res?.data || res;
}

/**
 * Fetches student or staff profile status details
 */
export async function getNdaStudentProfileReport(data: {
    dup: 'Student' | 'Staff';
    ASMAY_Id?: number;
    ASMCL_Id?: number;
    ASMS_Id?: number;
}) {
    const params = new URLSearchParams();
    if (data.ASMAY_Id) params.append('ASMAY_Id', data.ASMAY_Id.toString());
    if (data.ASMCL_Id) params.append('ASMCL_Id', data.ASMCL_Id.toString());
    if (data.ASMS_Id) params.append('ASMS_Id', data.ASMS_Id.toString());
    if (data.dup) params.append('dup', data.dup);

    const url = `/SMSApprovalTransaction/NDAStudentprofiledetails?${params.toString()}`;
    const res = await api.post<any>('admission', url);
    return res?.data || res;
}
