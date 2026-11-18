'use server';

import { api } from '@/lib/apiService';

export async function getTTCategories() {
    return await api.get<any>('admission', '/TTMasterCategory/getdetails');
}

export async function addOrUpdateTTCategory(data: any) {
    return await api.post<any>('admission', '/TTMasterCategory/savedetail', data);
}

export async function getTTCategoryDetails(id: number) {
    return await api.get<any>('admission', `/TTMasterCategory/getpagedetails?TTMC_Id=${id}`);
}

export async function toggleTTCategory(id: number) {
    return await api.post<any>('admission', `/TTMasterCategory/deactivate?TTMC_Id=${id}`, {});
}

export async function deleteTTCategory(id: number) {
    return await api.post<any>('admission', `/TTMasterCategory/deletedetails?TTMC_Id=${id}`);
}
