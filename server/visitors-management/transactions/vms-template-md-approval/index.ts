'use server';

import { api } from '@/lib/apiService';
import type { VMSTemplateUploadDTO } from '@/types/visitors-management/vms-template-upload-types';

export interface VMSTemplateMDApprovalLoadResponse {
    alldata?: VMSTemplateUploadDTO[];
    success?: boolean;
    message?: string;
}

// ------------------------------
// 1. LOAD DATA
// ------------------------------
export async function getVMSTemplateMDApprovalData(pageId = 2) {
    try {
        const res = await api.get<VMSTemplateMDApprovalLoadResponse>('exam', `FeedBackReport/VMS_Template_Upload/${pageId}`);
        return res;
    } catch (error: any) {
        console.error('Error fetching VMS Template MD Approval data:', error);
        return {
            success: false,
            message: error?.message || 'Failed to fetch template approval data',
            alldata: []
        };
    }
}

// ------------------------------
// 2. SAVE MD APPROVAL DECISION
// ------------------------------
export async function saveVMSTemplateMDApproval(payload: {
    ISMMT_Id: number;
    ISMMT_Status: string;
    ISMMT_MDRemarks: string;
}) {
    try {
        const res = await api.post<any>('exam', 'FeedBackReport/Save_VMS_Template_MD_Approval', payload);
        return res;
    } catch (error: any) {
        console.error('Error saving VMS Template MD Approval decision:', error);
        return {
            success: false,
            returnval: 'error',
            message: error?.message || 'Server error occurred.'
        };
    }
}
