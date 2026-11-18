'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import { revalidatePath } from 'next/cache';

const FACADE_URL = '/MasterMenuPageMappingFacade';

export async function getOnLoadData(searchParams: any) {
    const page = Number(searchParams?.page || 1);
    const pageSize = Number(searchParams?.page_size || 10);
    const searchQuery = searchParams?.search_query || searchParams?.search || '';

    const params = {
        page,
        page_size: pageSize,
        ...searchParams,
        search_column: searchParams?.search_column || (searchQuery ? 'pagename' : '')
    };
    const query = getSearchParamsUrl(params);
    const url = `${FACADE_URL}/get_onload_grid?${query}`;

    try {
        const response = await api.get<any>('sadmin', url);

        if (response.success && response.data) {
            const rawData = response.data;
            const records = Array.isArray(rawData) ? rawData : rawData.records || rawData.GridDetails || rawData.grid1 || [];

            let mappedRecords = records.map((item: any) => ({
                ...item,
                ivrmmmpM_Id: item.ivrmmmpM_Id ?? item.IVRMMMPM_Id ?? item.ivrmMMPM_Id ?? item.id ?? 0,
                submenuname:
                    item.submenuname ?? item.IVRMMM_MenuName ?? item.ivrmmM_MenuName ?? item.subMenuName ?? item.IVRMMS_SubMenuName ?? '',
                modulename: item.modulename ?? item.IVRMM_ModuleName ?? item.ivrmM_ModuleName ?? item.moduleName ?? '',
                pagename: item.pagename ?? item.IVRMP_PageName ?? item.ivrmP_PageName ?? item.pageName ?? item.ivrmmP_PageName ?? ''
            }));

            // Fallback in-memory filter in case backend returns unfiltered results
            if (searchQuery) {
                const q = String(searchQuery).toLowerCase().trim();
                const filtered = mappedRecords.filter(
                    (item: any) =>
                        (item.modulename && item.modulename.toLowerCase().includes(q)) ||
                        (item.submenuname && item.submenuname.toLowerCase().includes(q)) ||
                        (item.pagename && item.pagename.toLowerCase().includes(q))
                );
                if (filtered.length !== mappedRecords.length) {
                    mappedRecords = filtered;
                }
            }

            return {
                success: true,
                message: response.message,
                data: mappedRecords,
                pages: rawData.pages || response.data?.pages || [],
                total: searchQuery ? mappedRecords.length : (response.total ?? response.data?.total ?? mappedRecords.length),
                page: response.page || page,
                pageSize: response.page_size || pageSize
            };
        }

        return {
            success: false,
            message: response.message || 'Failed to fetch data',
            data: [],
            pages: [],
            total: 0
        };
    } catch (error) {
        console.error('Error fetching Master Menu Page Mapping data:', error);
        return {
            success: false,
            message: 'Failed to fetch data',
            data: [],
            pages: [],
            total: 0
        };
    }
}

export async function deleteMasterMenuPageMapping(id: number): Promise<{ success: boolean; message: string }> {
    if (!Number.isSafeInteger(id) || id <= 0) {
        return { success: false, message: 'A valid mapping record ID is required.' };
    }

    try {
        const response = await api.delete<any>('sadmin', `${FACADE_URL}/delete_master_menu/${id}`);

        const returnValue = response.returnval ?? response.data?.returnval;
        const normalizedReturnValue = typeof returnValue === 'string' ? returnValue.trim().toLowerCase() : returnValue;
        const hasReturnValue = returnValue !== undefined && returnValue !== null;
        const returnValueConfirmsDelete =
            normalizedReturnValue === true ||
            normalizedReturnValue === 'true' ||
            normalizedReturnValue === 1 ||
            normalizedReturnValue === '1' ||
            normalizedReturnValue === 'delete' ||
            normalizedReturnValue === 'deleted' ||
            normalizedReturnValue === 'deleted successfully';
        const deleteSucceeded = hasReturnValue ? returnValueConfirmsDelete : response.success === true;

        if (!deleteSucceeded) {
            return {
                success: false,
                message: response.message || (returnValue ? String(returnValue) : 'The record could not be deleted.')
            };
        }

        revalidatePath('/SuperAdmin/super-admin-module/general-setting/master-menu-page-mapping');
        return { success: true, message: response.message || 'Deleted successfully.' };
    } catch (error) {
        console.error('Failed to delete master menu page mapping:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to delete the record.'
        };
    }
}

export async function saveMasterMenuPageMapping(data: any) {
    const url = `${FACADE_URL}`;
    try {
        const response = await api.post('sadmin', url, data);
        return response;
    } catch (error) {
        return {
            success: false,
            message: 'Failed to save data'
        };
    }
}

export async function getMainMenuDropdown(moduleId: number) {
    const url = `${FACADE_URL}/get_mainmenu_drop_down`;
    try {
        const response = await api.get<any>('sadmin', url);
        if (response.success && Array.isArray(response.data)) {
            const allMenus = response.data;
            const filteredMenus = allMenus.filter((item: any) => item.ivrmM_Id === moduleId);
            return {
                ...response,
                data: filteredMenus
            };
        }
        return response;
    } catch (error) {
        return {
            success: false,
            message: 'Failed to fetch main menu dropdown',
            data: []
        };
    }
}

export async function getSubMenuDropdown(moduleId: number) {
    const url = `${FACADE_URL}/get_submenu_dropdown`;
    try {
        const response = await api.get<any>('sadmin', url);
        if (response.success && Array.isArray(response.data)) {
            const allMenus = response.data;
            // Filter by Module ID to get all submenus for the module
            const filteredMenus = allMenus.filter((item: any) => 
                Number(item.ivrmM_Id ?? item.IVRMM_Id) === Number(moduleId)
            );

            // Map to ISubMenuDropdownItem format required by frontend
            const mappedMenus = filteredMenus.map((item: any) => ({
                ivrmmS_Id: item.ivrmmS_Id ?? item.IVRMMS_Id ?? item.ivrmmM_Id ?? item.IVRMMM_Id ?? 0,
                ivrmmS_SubMenuName: item.ivrmmS_SubMenuName ?? item.IVRMMS_SubMenuName ?? item.ivrmmM_MenuName ?? item.IVRMMM_MenuName ?? item.submenuname ?? '',
                ivrmmM_Id: item.ivrmmM_ParentId ?? item.IVRMMM_ParentId ?? item.ivrmmM_Id ?? item.IVRMMM_Id ?? 0
            }));

            return {
                ...response,
                data: mappedMenus
            };
        }
        return response;
    } catch (error) {
        return {
            success: false,
            message: 'Failed to fetch sub menu dropdown',
            data: []
        };
    }
}
// ... existing code ...

export async function getModuleDropdown() {
    const url = `${FACADE_URL}/get_module_drop_down`;
    try {
        const response = await api.get<any>('sadmin', url);
        if (response.success && response.data) {
            return {
                success: true,
                message: response.message,
                data: response.data
            };
        }
        return {
            success: false,
            message: response.message || 'Failed to fetch module dropdown',
            data: []
        };
    } catch (error) {
        return {
            success: false,
            message: 'Failed to fetch module dropdown',
            data: []
        };
    }
}

export async function getMasterPagesOnChangeSubMenu(subMenuId: number) {
    const url = `${FACADE_URL}/get_masterpage_onchange_submenu/${subMenuId}`;
    try {
        const response = await api.get<any>('sadmin', url);
        if (response.success && response.data) {
            const records = Array.isArray(response.data) ? response.data : (response.data.records || response.data.grid1 || []);
            const mappedPages = records.map((item: any) => ({
                ivrmP_Id: item.ivrmP_Id ?? item.IVRMP_Id ?? item.id ?? 0,
                pagename: item.pagename ?? item.IVRMP_PageName ?? item.ivrmP_PageName ?? item.pageName ?? item.ivrmmP_PageName ?? ''
            }));
            return {
                success: true,
                message: response.message,
                data: mappedPages,
                total: response.total ?? mappedPages.length
            };
        }
        return {
            success: false,
            message: response.message || 'Failed to fetch master pages',
            data: [],
            total: 0
        };
    } catch (error) {
        return {
            success: false,
            message: 'Failed to fetch master pages',
            data: [],
            total: 0
        };
    }
}

export async function getSavedMasterMenuOnChangeSubMenu(moduleId: number, subMenuId: number) {
    const url = `${FACADE_URL}/get_savedmastermenu_onchange_submenu/${moduleId}/${subMenuId}`;
    try {
        const response = await api.get<any>('sadmin', url);
        if (response.success && response.data && Array.isArray(response.data.records)) {
            return {
                success: true,
                message: response.message,
                data: response.data.records
            };
        }
        return {
            success: false,
            message: response.message || 'Failed to fetch saved master menus',
            data: []
        };
    } catch (error) {
        return {
            success: false,
            message: 'Failed to fetch saved master menus',
            data: []
        };
    }
}
