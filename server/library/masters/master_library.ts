'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

import fs from 'fs';
import path from 'path';
import { auth } from '@/lib/auth';

export async function getMasterLibraryList(searchParams?: ApiSearchparams) {
    try {
        const session = await auth();
        const urlParams = getSearchParamsUrl({ ...searchParams, mI_Id: session?.mi_id }, 'lmaL_LibraryName');
        const url = `/MasterLibrary/get-master-library-list?${urlParams}`;
        return await api.get<any>('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch library list', data: [] };
    }
}

export async function getMasterLibraryMappedClassList() {
    try {
        const session = await auth();
        const url = `/MasterLibrary/get-mapped-class-list?mI_Id=${session?.mi_id}`;
        return await api.get<any>('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch mapping lists', data: [] };
    }
}

export async function getMasterLibraryById(id1: number, id2: number) {
    try {
        const url = `/MasterLibrary/master-library-by-id/${id1}/${id2}`;
        return await api.get<any>('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch record details' };
    }
}

export async function addOrUpdateMasterLibrary(data: any) {
    try {
        const session = await auth();
        const payload = {
            ...data,
            MI_Id: session?.mi_id
        };
        const url = '/MasterLibrary/add-or-update/';
        return await api.post<any>('library', url, payload);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to save mapping' };
    }
}

export async function toggleMasterLibrary(LMAL_Id: number) {
    try {
        // Updated to use the specific endpoint requested by the user
        const url = `/MasterLibrary/toggle-master-library/${LMAL_Id}`;
        // Using PUT as it's common for status updates, but POST is also a possibility in VAPS.
        // We'll keep it as PUT for now as it matches the previous implementation and follows REST standards.
        return await api.put('library', url, {});
    } catch (error: any) {
        console.error('Error in toggleMasterLibrary:', error);
        return { success: false, message: error?.message || 'Failed to toggle status' };
    }
}

export async function deleteMasterLibrary(id: number) {
    try {
        const url = `/MasterLibrary/toggle-master-library?id=${id}`;
        return await api.delete('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to delete record' };
    }
}

export async function getMasterLibraryEditClass(id: number) {
    try {
        const session = await auth();
        const url = `/MasterLibrary/get-mapped-class-list?LMAL_Id=${id}&mI_Id=${session?.mi_id}`;
        const res = await api.get<any>('library', url);

        try {
            const debugDir = path.join(process.cwd(), 'scratch');
            if (!fs.existsSync(debugDir)) {
                fs.mkdirSync(debugDir, { recursive: true });
            }
            fs.writeFileSync(
                path.join(debugDir, 'edit_class_response.json'),
                JSON.stringify({ timestamp: new Date().toISOString(), url, response: res }, null, 2)
            );
        } catch (e) {
            console.error('Failed to write debug file:', e);
        }

        return res;
    } catch (error: any) {
        console.error('Error in getMasterLibraryEditClass:', error);
        return { success: false, message: error?.message || 'Failed to fetch mapping details' };
    }
}

export async function toggleDeactivateClassData(data: { llC_Id: number; lmaL_Id: number; asmcL_Id: number }) {
    try {
        const session = await auth();
        const payload = {
            ...data,
            MI_Id: session?.mi_id
        };
        const url = '/MasterLibrary/toggle-deactiv-clsdata';
        return await api.post<any>('library', url, payload);
    } catch (error: any) {
        console.error('Error in toggleDeactivateClassData:', error);
        return { success: false, message: error?.message || 'Failed to deactivate class mapping' };
    }
}

export async function getMasterLibraryEditStaff(id: number) {
    try {
        const session = await auth();
        const url = `/MasterLibrary/EditStaff?id=${id}&MI_Id=${session?.mi_id}`;
        return await api.get<any>('library', url);
    } catch (error: any) {
        console.error('Error in getMasterLibraryEditStaff:', error);
        return { success: false, message: error?.message || 'Failed to fetch mapping details' };
    }
}

export async function saveClassMapping(data: { LMAL_Id: number; classlst: { ASMCL_Id: number }[] }) {
    try {
        const session = await auth();
        const payload = {
            ...data,
            MI_Id: session?.mi_id
        };
        const url = '/MasterLibrary/saveclassdata';
        return await api.post<any>('library', url, payload);
    } catch (error: any) {
        console.error('Error in saveClassMapping:', error);
        return { success: false, message: error?.message || 'Failed to save class mapping' };
    }
}

export async function saveStaffMapping(data: { LUL_Id: number; LMAL_Id: number; IVRMUL_Id: number }) {
    try {
        const session = await auth();
        const payload = {
            ...data,
            MI_Id: session?.mi_id
        };
        const url = '/MasterLibrary/savestaffdata';
        return await api.post<any>('library', url, payload);
    } catch (error: any) {
        console.error('Error in saveStaffMapping:', error);
        return { success: false, message: error?.message || 'Failed to save staff mapping' };
    }
}

export async function getMasterLibraryUsername() {
    try {
        const session = await auth();
        const url = `/MasterLibrary/getusername?mI_Id=${session?.mi_id}`;
        const response = await api.get<any>('library', url);
        return response;
    } catch (error: any) {
        console.error('Error in getMasterLibraryUsername:', error);
        return { success: false, message: error?.message || 'Failed to fetch username details', data: [] };
    }
}

export async function toggleDeactivateStaffData(data: { luL_Id: number }) {
    try {
        const session = await auth();
        const payload = {
            LUL_Id: Number(data.luL_Id),
            MI_Id: Number(session?.mi_id)
        };
        const url = '/MasterLibrary/toggle-deactive-Ystfdetails';
        return await api.post<any>('library', url, payload);
    } catch (error: any) {
        console.error('Error in toggleDeactivateStaffData:', error);
        return { success: false, message: error?.message || 'Failed to toggle staff mapping status' };
    }
}
