'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { IMasterRoleType } from '@/types/super-admin/super-admin-module/general-setting/master-role-type';
import { revalidatePath } from 'next/cache';

export async function getMasterRoleTypes(searchParams: any) {
    const params = {
        ...searchParams,
        search_column: searchParams.search_column || searchParams.search_columns || (searchParams.search_query ? 'ivrmrT_Role' : '')
    };
    const query = getSearchParamsUrl(params);
    const url = `MasterRoleTypeFacade/get_onload_grid_master_role_type?${query}`;

    try {
        const response = await api.get<any>('sadmin', url);
        if (response.success && response.data) {
            const dataList: any[] = Array.isArray(response.data)
                ? response.data
                : response.data.pagesdata ||
                  response.data.gridData ||
                  response.data.masterRoleTypes ||
                  response.data.records ||
                  response.data.$values ||
                  response.data.data ||
                  [];

            let mappedData: IMasterRoleType[] = dataList.map((item: any) => ({
                id: item.ivrmrT_Id ?? item.id ?? 0,
                roleType: item.ivrmrT_Role ?? item.roleType ?? item.roleName ?? '', // "Role Name"
                name: item.name ?? item.roleType ?? '', // "Role Type"
                masterRoleId: item.id ?? item.masterRoleId ?? 0,
                institutionType: item.ivrmrT_RoleFlag ?? item.flag ?? item.institutionType ?? 'S',
                activeFlag: item.activeFlag ?? item.ivrmrT_ActiveFlag ?? 1,
                createdDate: item.createdDate,
                updatedDate: item.updatedDate
            }));

            // In-memory fallback filter in case backend returns all records
            if (searchParams.search_query) {
                const q = String(searchParams.search_query).toLowerCase().trim();
                const filtered = mappedData.filter(
                    (item) =>
                        (item.roleType && item.roleType.toLowerCase().includes(q)) ||
                        (item.name && item.name.toLowerCase().includes(q))
                );
                if (filtered.length !== mappedData.length) {
                    mappedData = filtered;
                }
            }

            return {
                success: true,
                data: mappedData,
                total: searchParams.search_query ? mappedData.length : (response.total ?? response.data?.total ?? mappedData.length),
                page: response.page ?? response.data?.page ?? 1,
                page_size: response.page_size ?? response.data?.page_size ?? 10
            };
        }
    } catch (error) {
        console.error('Error fetching master role types', error);
    }
    return { success: false, data: [], total: 0, page: 0, page_size: 0 };
}

export async function saveMasterRoleType(data: any) {
    const url = `MasterRoleTypeFacade/`;

    // Ensure masterRoleIds is an array
    const roleIds = Array.isArray(data.masterRoleIds) ? data.masterRoleIds : [];

    if (roleIds.length === 0) {
        return { success: false, message: 'No Role selected' };
    }

    try {
        const promises = roleIds.map((roleId: number, index: number) => {
            // For Edit case:
            // If data.id exists, use it for the first role in the list to update the existing record.
            // For subsequent roles (multi-select additions), use 0 to create new records.
            const idToUse = data.id && index === 0 ? data.id : 0;

            const payload = {
                createdDate: new Date().toISOString(),
                updatedDate: new Date().toISOString(),
                ivrmrT_Id: idToUse,
                ivrmrT_Role: data.roleType,
                ivrmR_Id: roleId,
                ivrmrT_RoleFlag: data.institutionType || 'S', // Default 'S'
                flag: '' // Default to empty string as per request body template
            };
            return api.post<any>('sadmin', url, payload);
        });

        const results = await Promise.all(promises);

        // check if any failed
        const failure = results.find((r) => !r.success);
        if (failure) {
            return { success: false, message: failure.message || 'Failed to save some records' };
        }

        revalidatePath('/SuperAdmin/super-admin-module/general-setting/master-role-type');
        return { success: true, message: results[0]?.message || 'Saved Successfully' };
    } catch (error) {
        console.error('Error saving master role type', error);
        return { success: false, message: 'An unexpected error occurred' };
    }
}

export async function getMasterRoleTypeById(id: number) {
    const url = `MasterRoleTypeFacade/get_details_editbyid/${id}`;
    try {
        const response = await api.get<any>('sadmin', url);
        if (response.success && response.data && response.data.length > 0) {
            // User indicated the API returns a list, so we must find the matching record by PK (ivrmrT_Id)
            const item = response.data.find((r: any) => r.ivrmrT_Id === id) || response.data[0];

            return {
                success: true,
                data: {
                    id: item.ivrmrT_Id,
                    roleType: item.ivrmrT_Role,
                    name: item.name,
                    masterRoleId: item.id,
                    institutionType: item.flag,
                    activeFlag: 1
                }
            };
        }
        return { success: false, message: response.message || 'No data found' };
    } catch (error) {
        console.error('Error fetching master role type details', error);
        return { success: false, message: 'An unexpected error occurred' };
    }
}

export async function activateDeactivateMasterRoleType(id: number) {
    const url = `MasterRoleTypeFacade/activate_deactivate_master_role_type/${id}`;
    try {
        const response = await api.put<any>('sadmin', url, {});
        if (response.success) {
            return { success: true, message: response.message || 'Updated Successfully' };
        }
        return { success: false, message: response.message || 'Failed to update' };
    } catch (error: any) {
        console.error('Error updating master role type status', error);
        return { success: false, message: error?.message || 'An unexpected error occurred during activation/deactivation' };
    }
}

export async function deleteMasterRoleType(id: number) {
    if (!Number.isSafeInteger(id) || id <= 0) {
        return { success: false, message: 'A valid role type ID is required.' };
    }

    try {
        const response = await api.delete<any>('sadmin', `MasterRoleTypeFacade/delete_master_role_type/${id}`);
        const responseMessage = response.message || response.data?.message;
        const deleteSucceeded =
            response.success === true ||
            (typeof responseMessage === 'string' && responseMessage.trim().toLowerCase() === 'record deleted successfully');

        if (!deleteSucceeded) {
            return {
                success: false,
                message: responseMessage || 'Failed to delete role type.'
            };
        }

        revalidatePath('/SuperAdmin/super-admin-module/general-setting/master-role-type');
        return { success: true, message: responseMessage || 'Role type deleted successfully.' };
    } catch (error) {
        console.error('Error deleting master role type', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'An unexpected error occurred while deleting the role type.'
        };
    }
}

export async function getRoleNameDropdown() {
    const url = `MasterRoleTypeFacade/get_onload_role_name_dropdown`;
    try {
        const response = await api.get<any>('sadmin', url);
        if (response.success && response.data) {
            return { success: true, data: response.data.roledata || [] };
        }
    } catch (error) {
        console.error('Error fetching role name dropdown', error);
    }
    return { success: false, data: [] };
}
