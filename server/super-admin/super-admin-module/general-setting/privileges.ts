'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type {
    ISavePrivilegesApiRequestDTO,
    ISearchPagesApiRequestDTO,
    ISearchPagesPayload
} from '@/types/super-admin/super-admin-module/general-setting/privileges';
import { revalidatePath } from 'next/cache';

const FACADE = 'MasterRolePreviledgeFacade';

export async function getRoleDropdown() {
    const url = `${FACADE}/get_role_dropdown`;
    try {
        const response = await api.get<any>('sadmin', url);
        const resData = response?.data || response;
        if (resData && response.success !== false) {
            const roles = resData.fillroletype || resData.fillRoleType || resData.roles || resData.roleList || [];
            const mappedRoles = roles.map((r: any) => ({
                ivrmrT_Id: r.IVRMRT_Id ?? r.ivrmrT_Id ?? r.id,
                ivrmrT_Role: r.IVRMRT_Role ?? r.ivrmrT_Role ?? r.roleName ?? r.name
            }));
            return {
                success: true,
                roles: mappedRoles
            };
        }
    } catch (error) {
        console.error('Error fetching role dropdown', error);
    }
    return { success: false, roles: [] };
}

export async function getModuleDropdown() {
    const url = `${FACADE}/get_module_dropdown`;
    try {
        const response = await api.get<any>('sadmin', url);
        const resData = response?.data || response;
        if (resData && response.success !== false) {
            const modules = resData.fillmodulepagesdata || resData.fillModulePagesData || resData.modules || resData.moduleList || [];
            const mappedModules = modules.map((m: any) => ({
                ivrmM_Id: m.IVRMM_Id ?? m.ivrmM_Id ?? m.id,
                ivrmM_ModuleName: m.IVRMM_ModuleName ?? m.ivrmM_ModuleName ?? m.moduleName
            }));
            return {
                success: true,
                modules: mappedModules
            };
        }
    } catch (error) {
        console.error('Error fetching module dropdown', error);
    }
    return { success: false, modules: [] };
}

export async function searchPages(payload: ISearchPagesPayload) {
    const url = `${FACADE}/get_module_onsearch`;
    try {
        const requestBody: ISearchPagesApiRequestDTO = {
            IVRMRT_Id: payload.ivrmrT_Id,
            savetmpdata: payload.ivrmM_Id.map((id) => ({ IVRMM_Id: id }))
        };
        const response = await api.post<any>('sadmin', url, requestBody);
        const resData = response?.data || response;

        if (resData && response.success !== false) {
            const enq = resData.enq || resData.ENQ || resData.Enq || [];
            const previosgriddata =
                resData.previosgriddata || resData.PREVIOSGRIDDATA || resData.Previosgriddata || resData.previousgriddata || [];

            const pages = enq.map((p: any) => ({
                ivrmmP_Id: p.IVRMMP_Id ?? p.ivrmmP_Id ?? p.id,
                ivrmmP_PageName: p.IVRMMP_PageName ?? p.ivrmmP_PageName ?? p.pageName
            }));

            const savedPrivileges = previosgriddata.map((p: any) => ({
                ivrmrP_Id: p.IVRMRP_Id ?? p.ivrmrP_Id ?? p.id,
                ivrmmP_Id: p.IVRMMP_Id ?? p.ivrmmP_Id,
                ivrmmP_PageName: p.IVRMMP_PageName ?? p.ivrmmP_PageName ?? p.pageName,
                ivrmrP_AddFlag: Boolean(p.IVRMRP_AddFlag ?? p.ivrmrP_AddFlag),
                ivrmrP_DeleteFlag: Boolean(p.IVRMRP_DeleteFlag ?? p.ivrmrP_DeleteFlag),
                ivrmrP_UpdateFlag: Boolean(p.IVRMRP_UpdateFlag ?? p.ivrmrP_UpdateFlag),
                ivrmrP_ProcessFlag: Boolean(p.IVRMRP_ProcessFlag ?? p.ivrmrP_ProcessFlag),
                ivrmrP_ReportFlag: Boolean(p.IVRMRP_ReportFlag ?? p.ivrmrP_ReportFlag),
                isNew: false
            }));

            return {
                success: true,
                pages,
                savedPrivileges
            };
        }
        return { success: false, pages: [], savedPrivileges: [], message: response?.message || 'Failed to search pages' };
    } catch (error: any) {
        console.error('Error searching pages', error);
        return {
            success: false,
            pages: [],
            savedPrivileges: [],
            message: typeof error === 'string' ? error : error?.message || 'Search failed'
        };
    }
}

export async function savePrivileges(payload: { roleId: number; secondgrid: any[]; previousgrid: any[] }) {
    const url = `${FACADE}/save_master_role_privilege`;
    try {
        const requestBody: ISavePrivilegesApiRequestDTO = {
            IVRMRT_Id: payload.roleId,
            savetmpdata: payload.secondgrid.map((item: any) => ({
                IVRMMP_Id: item.ivrmmP_Id,
                IVRMRP_AddFlag: Boolean(item.ivrmrP_AddFlag),
                IVRMRP_DeleteFlag: Boolean(item.ivrmrP_DeleteFlag),
                IVRMRP_UpdateFlag: Boolean(item.ivrmrP_UpdateFlag),
                IVRMRP_ProcessFlag: Boolean(item.ivrmrP_ProcessFlag),
                IVRMRP_ReportFlag: Boolean(item.ivrmrP_ReportFlag)
            })),
            previoussavetmpdata: payload.previousgrid.map((item: any) => ({
                IVRMRP_Id: item.ivrmrP_Id,
                IVRMMP_Id: item.ivrmmP_Id,
                IVRMRP_AddFlag: Boolean(item.ivrmrP_AddFlag),
                IVRMRP_DeleteFlag: Boolean(item.ivrmrP_DeleteFlag),
                IVRMRP_UpdateFlag: Boolean(item.ivrmrP_UpdateFlag),
                IVRMRP_ProcessFlag: Boolean(item.ivrmrP_ProcessFlag),
                IVRMRP_ReportFlag: Boolean(item.ivrmrP_ReportFlag)
            }))
        };

        const response = await api.post<any>('sadmin', url, requestBody);
        const isSuccess =
            response.success ||
            response.returnval === true ||
            response.returnval === 'true' ||
            response.returnval === 'Save' ||
            response.returnval === 'Update';
        if (isSuccess) {
            revalidatePath('/SuperAdmin/super-admin-module/general-setting/privileges');
            return { success: true, message: response.message || response.returnval || 'Saved successfully.' };
        }
        return { success: false, message: response.message || 'Failed to save.' };
    } catch (error: any) {
        console.error('Error saving privileges', error);
        return { success: false, message: typeof error === 'string' ? error : error?.message || 'An unexpected error occurred.' };
    }
}

export async function deletePrivilege(id: number) {
    const url = `${FACADE}/delete_master_priviledge/${id}`;
    try {
        const response = await api.delete<any>('sadmin', url);
        const isSuccess =
            response.success || response.returnval === true || response.returnval === 'true' || response.returnval === 'Delete';
        if (isSuccess) {
            revalidatePath('/SuperAdmin/super-admin-module/general-setting/privileges');
            return { success: true, message: response.message || 'Deleted successfully.' };
        }
        return { success: false, message: response.message || 'Failed to delete.' };
    } catch (error) {
        console.error('Error deleting privilege', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function getRolePrivilegesList(searchParams: any) {
    const params = {
        ...searchParams,
        search_column: searchParams.search_column || (searchParams.search_query ? 'ivrmrT_Role' : '')
    };
    const query = getSearchParamsUrl(params);
    const url = `${FACADE}/get_onload_grid_master_priviledge?${query}`;
    try {
        const response = await api.get<any>('sadmin', url);
        const resData = response?.data || response;
        if (resData && response.success !== false) {
            const rawList = resData.thirdgriddata || resData.records || resData.gridData || (Array.isArray(resData) ? resData : []);
            let mappedList = rawList.map((item: any) => ({
                ivrmrP_Id: item.IVRMRP_Id ?? item.ivrmrP_Id,
                ivrmrT_Role: item.ivrmrT_Role ?? item.IVRMRT_Role ?? item.roleName ?? '',
                ivrmM_ModuleName: item.ivrmM_ModuleName ?? item.IVRMM_ModuleName ?? item.moduleName ?? '',
                ivrmmP_PageName: item.ivrmmP_PageName ?? item.IVRMMP_PageName ?? item.pageName ?? ''
            }));

            // In-memory fallback filter in case backend returns all records unfiltered
            if (searchParams.search_query) {
                const q = String(searchParams.search_query).toLowerCase().trim();
                const filtered = mappedList.filter(
                    (item: any) =>
                        (item.ivrmrT_Role && item.ivrmrT_Role.toLowerCase().includes(q)) ||
                        (item.ivrmM_ModuleName && item.ivrmM_ModuleName.toLowerCase().includes(q)) ||
                        (item.ivrmmP_PageName && item.ivrmmP_PageName.toLowerCase().includes(q))
                );
                if (filtered.length !== mappedList.length) {
                    mappedList = filtered;
                }
            }

            return {
                success: true,
                data: mappedList,
                total: searchParams.search_query ? mappedList.length : (response.total || resData.total || mappedList.length),
                page: response.page || resData.page || 1,
                page_size: response.page_size || resData.page_size || 10
            };
        }
    } catch (error) {
        console.error('Error fetching role privileges list', error);
    }
    return { success: false, data: [], total: 0, page: 0, page_size: 10 };
}
