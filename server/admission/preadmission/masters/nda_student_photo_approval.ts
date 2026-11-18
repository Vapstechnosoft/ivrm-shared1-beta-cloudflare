'use server';

import { api } from '@/lib/apiService';

/**
 * Fetches initial data for NDA Student Photo Approval (Years, Classes, Sections)
 */
export async function getNdaPhotoInitialData(data: { dup: string }) {
    const url = `/SMSApprovalTransaction/Getdata?dup=${data.dup}`;
    const res = await api.post<any>('admission', url);
    return res?.data || res;
}

/**
 * Fetches student or staff photo approval records based on selection
 */
export async function getNdaPhotoApprovalList(data: {
    dup: string;
    ASMAY_Id?: number;
    ASMCL_Id?: number;
    ASMS_Id?: number;
}) {
    const params = new URLSearchParams();
    if (data.ASMAY_Id) params.append('ASMAY_Id', data.ASMAY_Id.toString());
    if (data.ASMCL_Id) params.append('ASMCL_Id', data.ASMCL_Id.toString());
    if (data.ASMS_Id) params.append('ASMS_Id', data.ASMS_Id.toString());
    if (data.dup) params.append('dup', data.dup);

    const url = `/SMSApprovalTransaction/NDAonSelectGetApproval?${params.toString()}`;
    const res = await api.post<any>('admission', url);
    return res?.data || res;
}

/**
 * Saves photo approval/rejection status
 */
export async function saveNdaPhotoApproval(data: {
    selectedImageslist: any[];
    dup: string;
}) {
    const url = '/SMSApprovalTransaction/NDAsavedetails';
    const res = await api.post<any>('admission', url, data);
    return res?.data || res;
}
