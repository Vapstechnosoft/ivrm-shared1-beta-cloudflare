'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import { masterModuleSchema } from '@/schemas/super-admin/super-admin-module/general-setting/module';
import type { IMasterModule } from '@/types/super-admin/super-admin-module/general-setting/module';
import { revalidatePath } from 'next/cache';

const API_URL = '/v1/general-setting/master-module'; // Stub URL

export async function saveMasterModule(data: any) {
    const validation = masterModuleSchema.safeParse(data);

    if (!validation.success) {
        return {
            success: false,
            message: 'Validation failed',
            errors: validation.error.flatten().fieldErrors
        };
    }

    const payload = {
        ...data,
        ...validation.data,
        ivrmM_Id: data.ivrmM_Id ?? 0,
        userid: data.userid ?? 0,
        createdDate: data.createdDate ?? new Date().toISOString(),
        updatedDate: new Date().toISOString()
    };

    const response = await api.post<any>('sadmin', 'MastersModuleFacade', payload);

    if (response.success) {
        revalidatePath('/SuperAdmin/super-admin-module/general-setting/module');
        return {
            success: true,
            message: response.message || 'Master Module saved successfully!',
            data: response.data
        };
    }

    return {
        success: false,
        message: response.message || 'Failed to save module'
    };
}

export async function getMasterModules(searchParams: any) {
    try {
        const searchQuery = String(searchParams?.search_query ?? '').trim();
        const params = {
            ...searchParams,
            search_query: searchQuery,
            search_column: searchParams.search_column || searchParams.search_columns || (searchQuery ? 'ivrmM_ModuleName' : '')
        };
        const query = getSearchParamsUrl(params);
        const url = `/MastersModuleFacade/get_master_module_onload_grid?${query}`;

        const response = await api.get<any>('sadmin', url);

        if (response.success && response.data?.masterModulesname) {
            let dataList = response.data.masterModulesname as IMasterModule[];

            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const filtered = dataList.filter(
                    (item) =>
                        (item.ivrmM_ModuleName && item.ivrmM_ModuleName.toLowerCase().includes(q)) ||
                        (item.ivrmM_ModuleDesc && item.ivrmM_ModuleDesc.toLowerCase().includes(q))
                );
                if (filtered.length !== dataList.length) {
                    dataList = filtered;
                }
            }

            return {
                success: true,
                data: dataList,
                message: response.message,
                total: searchQuery ? dataList.length : (response.data.total ?? response.total ?? dataList.length),
                page: response.data.page ?? response.page,
                page_size: response.data.page_size ?? response.page_Size
            };
        }

        return {
            success: false,
            data: [],
            message: response?.message || 'Failed to fetch data',
            total: 0,
            page: 0,
            page_size: 0
        };
    } catch (error: any) {
        console.error('getMasterModules error:', error);
        return {
            success: false,
            data: [],
            message: error?.message || 'Failed to fetch data',
            total: 0,
            page: 0,
            page_size: 0
        };
    }
}

export async function getMasterModuleById(id: number) {
    try {
        const url = `MastersModuleFacade/get_details_byID/${id}`;
        const response = await api.get<any>('sadmin', url);

        if (response.success && response.data?.masterModulesname && response.data.masterModulesname.length > 0) {
            return {
                success: true,
                data: response.data.masterModulesname[0] as IMasterModule,
                message: response.message
            };
        }

        return {
            success: false,
            data: null,
            message: response?.message || 'Failed to fetch details'
        };
    } catch (error: any) {
        console.error('getMasterModuleById error:', error);
        return {
            success: false,
            data: null,
            message: error?.message || 'Failed to fetch details'
        };
    }
}

export async function activateDeactivateMasterModule(id: number) {
    const url = `MastersModuleFacade/activate_deactivate_master_module/${id}`;
    const response = await api.put<any>('sadmin', url, {});

    if (response.success) {
        revalidatePath('/SuperAdmin/super-admin-module/general-setting/module');
        return {
            success: true,
            message: response.message || 'Module status updated successfully'
        };
    }

    return {
        success: false,
        message: response.message || 'Failed to update module status'
    };
}
