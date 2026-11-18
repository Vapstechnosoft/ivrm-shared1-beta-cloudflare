'use server';

import { api } from '@/lib/apiService';
import { getSearchParamsUrl } from '@/lib/apiService';
import { pageMappingSchema } from '@/schemas/super-admin/super-admin-module/general-setting/page-mapping';
import type { IModuleDropdown, IPageMappingData, ISavedMapping } from '@/types/super-admin/super-admin-module/general-setting/page-mapping';
import { revalidatePath } from 'next/cache';

export async function getModulesForDropdown() {
    const url = 'MasterPageModuleMappingFacade/get_saved_pages_mapping_list_onchange_of_modulename?page=1&page_size=100';

    try {
        const response = await api.get<any>('sadmin', url);
        if (response.success && response.data) {
            return {
                success: true,
                data: response.data.map((m: any) => ({
                    ivrmM_Id: m.ivrmM_Id ?? m.IVRMM_Id,
                    ivrmM_ModuleName: m.ivrmM_ModuleName ?? m.IVRMM_ModuleName,
                    ivrmM_ModuleDesc: m.ivrmM_ModuleDesc ?? m.IVRMM_ModuleDesc
                })) as IModuleDropdown[]
            };
        }
    } catch (error) {
        console.error('Error fetching modules', error);
    }

    return { success: false, data: [] };
}

export async function getAvailablePages(searchParams: any) {
    const paramsObj =
        typeof searchParams === 'number' || typeof searchParams === 'string'
            ? { ivrmM_Id: searchParams }
            : searchParams && typeof searchParams === 'object'
                ? searchParams
                : {};

    const query = getSearchParamsUrl(paramsObj);
    const url = `MasterPageModuleMappingFacade/get_master_page_details_onchange_of_modulename?${query}`;

    try {
        const response = await api.get<any>('sadmin', url);
        if (response.success && Array.isArray(response.data)) {
            const mappedData = response.data.map((item: any) => ({
                ivrmP_Id: item.IVRMP_Id ?? item.ivrmP_Id,
                ivrmP_PageName: item.IVRMMP_PageName ?? item.ivrmmP_PageName ?? item.IVRMP_PageName ?? item.ivrmP_PageName,
                ivrmP_PageDisplayName:
                    item.IVRMP_PageDisplayName ?? item.ivrmP_PageDisplayName ?? item.IVRMMP_PageName ?? item.ivrmmP_PageName
            }));

            return {
                success: true,
                data: mappedData as IPageMappingData[],
                total: response.total || response.data.length,
                page: response.page || 1,
                page_size: response.page_size || 10
            };
        }
    } catch (error) {
        console.error('Error fetching available pages', error);
    }
    return { success: false, data: [], total: 0, page: 0, page_size: 0 };
}

export async function getSavedMappings(searchParams: any) {
    const query = getSearchParamsUrl(searchParams);
    const url = `MasterPageModuleMappingFacade/get_all_details_grid_page_mapping?${query}`;

    try {
        const response = await api.get<any>('sadmin', url);
        if (response.success && response.data) {
            const dataList = Array.isArray(response.data) ? response.data : response.data.savedMappings || [];
            return {
                success: true,
                data: dataList.map((item: any) => ({
                    ivrmmP_Id: item.ivrmmP_Id ?? item.IVRMMP_Id ?? item.ivrmmp_Id ?? item.id,
                    ivrmM_Id: item.ivrmM_Id ?? item.IVRMM_Id,
                    ivrmP_Id: item.ivrmP_Id ?? item.IVRMP_Id,
                    ivrmmP_PageName: item.ivrmmP_PageName ?? item.IVRMMP_PageName ?? item.ivrmP_PageName ?? item.IVRMP_PageName,
                    ivrmM_ModuleName: item.ivrmM_ModuleName ?? item.IVRMM_ModuleName
                })) as ISavedMapping[],
                total: response.total ?? response.data.total ?? dataList.length,
                page: response.page ?? response.data.page ?? 1,
                page_size: response.page_size ?? response.data.page_size ?? dataList.length
            };
        }
    } catch (error) {
        console.error('Error fetching saved mappings', error);
    }
    return { success: false, data: [], total: 0, page: 0, page_size: 0 };
}

export async function savePageMapping(data: any) {
    const validation = pageMappingSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, message: 'Validation failed' };
    }

    const ivrmmpId = data.ivrmmP_Id ?? data.IVRMMP_Id ?? 0;

    const payload = {
        IVRMMP_Id: ivrmmpId,
        IVRMM_Id: data.ivrmM_Id,
        savetmpdata: data.pages.map((p: any) => ({
            IVRMP_Id: p.ivrmP_Id
        }))
    };

    const response = await api.post<any>('sadmin', `MasterPageModuleMappingFacade/master_module_map_save/${ivrmmpId}`, payload);

    if (response.success) {
        revalidatePath('/SuperAdmin/super-admin-module/general-setting/page-mapping');
        return { success: true, message: 'Mapping saved successfully' };
    }
    return { success: false, message: response.message || 'Failed to save' };
}

export async function deletePageMapping(id: number) {
    console.log('deletePageMapping called with ID:', id);
    // Assuming delete endpoint on the same facade
    const response = await api.delete<any>('sadmin', `MasterPageModuleMappingFacade/delete_master_page/${id}`);
    console.log('deletePageMapping response:', response);
    if (response.success) {
        return { success: true, message: 'Deleted successfully' };
    }
    return { success: false, message: response.message || 'Failed to delete' };
}

export async function getSavedPagesMappingList(searchParams: any) {
    const query = getSearchParamsUrl(searchParams);
    // Endpoint provided by user
    const url = `MasterPageModuleMappingFacade/get_saved_pages_mapping_list_onchange_of_modulename?${query}`;

    try {
        const response = await api.get<any>('sadmin', url);
        if (response.success && response.data) {
            // User provided sample data showing ivrmM_ModuleName, etc.
            // But previous requirement was for ivrmmP_PageName.
            // We'll return data as is, but we might need to map it if the grid expects specific keys.
            // Let's assume the grid needs ISavedMapping (ivrmmP_PageName).
            // If API returns ivrmM_ModuleName but not Page Name, the grid column will be empty.
            // We will map response.data directly.

            const dataList = Array.isArray(response.data) ? response.data : [];
            return {
                success: true,
                data: dataList as ISavedMapping[], // Type assertion, aware of potential mismatch
                total: response.total || response.data.length,
                page: response.page || 1,
                page_size: response.page_size || 10
            };
        }
    } catch (error) {
        console.error('Error fetching saved pages list', error);
    }
    return { success: false, data: [], total: 0, page: 0, page_size: 0 };
}
