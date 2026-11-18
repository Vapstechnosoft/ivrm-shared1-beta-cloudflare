'use server';

import { api } from '@/lib/apiService';
import type { TemplateTypeItem, VMSTemplateUploadDTO } from '@/types/visitors-management/vms-template-upload-types';

export interface VMSTemplateUploadLoadResponse {
    alldata?: VMSTemplateUploadDTO[];
    templateTypeList?: (string | TemplateTypeItem)[];
    success?: boolean;
    message?: string;
}

// ------------------------------
// 1. LOAD DATA
// ------------------------------
export async function getVMSTemplateUploadData(pageId = 2) {
    try {
        const res = await api.get<VMSTemplateUploadLoadResponse>('exam', `FeedBackReport/VMS_Template_Upload/${pageId}`);
        return res;
    } catch (error: any) {
        console.error('Error fetching VMS Template Upload data:', error);
        return {
            success: false,
            message: error?.message || 'Failed to fetch template upload data',
            alldata: [],
            templateTypeList: []
        };
    }
}

// ------------------------------
// 2. SAVE RECORD (REQUEST FOR APPROVAL)
// ------------------------------
export async function saveVMSTemplateUpload(payload: {
    ISMMT_Id: number;
    ISMMT_TemplateName: string;
    ISMMT_TemplateType: string;
    ISMMT_Description: string;
    ISMMT_FilePath: string;
    ISMMT_SubmittedBy: string;
    ISMMT_Status: string;
    ISMMT_MDRemarks: string;
    ISMMT_ActiveFlag: boolean;
}) {
    try {
        const res = await api.post<any>('exam', 'FeedBackReport/Save_VMS_Template_Upload', payload);
        return res;
    } catch (error: any) {
        console.error('Error saving VMS Template Upload:', error);
        return {
            success: false,
            returnval: 'error',
            message: error?.message || 'Server error occurred.'
        };
    }
}

// ------------------------------
// 3. ACTIVATE / DEACTIVATE RECORD
// ------------------------------
export async function deactivateVMSTemplateUpload(payload: {
    ISMMT_Id: number;
    ISMMT_ActiveFlag: boolean;
}) {
    try {
        const res = await api.post<any>('exam', 'FeedBackReport/deactivate_VMS_Template_Upload', payload);
        return res;
    } catch (error: any) {
        console.error('Error deactivating VMS Template Upload:', error);
        return {
            success: false,
            returnval: 'error',
            message: error?.message || 'Server error occurred.'
        };
    }
}
