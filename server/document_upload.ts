'use server';

import { api } from '@/lib/apiService';

export async function uploadDocument(data: any) {
    try {
        const url = '/document_upload/upload_document';
        return await api.postMultipart<string>('preadmission', url, data);
    } catch (error: any) {
        return { success: false, message: error.message || String(error), data: null };
    }
}

export async function deleteDocument(blobUrl: string) {
    const url = `/document_upload/delete_document?blob_url=${blobUrl}`;
    return await api.delete<boolean>('preadmission', url);
}
