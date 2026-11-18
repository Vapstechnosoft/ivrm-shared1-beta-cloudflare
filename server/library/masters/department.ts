'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getMasterDepartment(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'lmD_DepartmentName,lmD_DepartmentCode');
    const url = `/MasterDepartmentFacade/get-master-department-list?${urlParams}`;
    const response = await api.get<any[]>('library', url);
    return response;
}

export async function addOrUpdateMasterDepartment(data: any) {
    const url = 'MasterDepartmentFacade/add-master-department';
    return await api.post<any>('library', url, data);
}

export async function deactivateMasterDepartment(id: number) {
    const url = `MasterDepartmentFacade/toggle-master-department/${id}`;
    return await api.put<any>('library', url, {});
}
