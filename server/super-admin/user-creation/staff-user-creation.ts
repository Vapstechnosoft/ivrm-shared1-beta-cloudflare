'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { SearchGridDTO, StaffUserCreationOnloadDTO } from '@/types/super-admin/user-creation/staff-user-creation';

const API_KEY = 'sadmin';

export async function getStaffUserCreationOnload(pageId: number) {
    try {
        const response = await api.get<StaffUserCreationOnloadDTO>(API_KEY, `StaffLogin/getalldetails/${pageId}`);
        if (response.success && response.data) {
            return { success: true, data: response.data };
        }
        return { success: false, message: response.message || 'Failed to fetch onload details', data: null };
    } catch (error: any) {
        console.error('getStaffUserCreationOnload error:', error);
        return { success: false, message: error.message || 'Failed to fetch onload details', data: null };
    }
}

export async function changeInstitution(payload: any) {
    try {
        const response = await api.post<any>(API_KEY, 'StaffLogin/changeinsti', payload);
        if (response.success && response.data) {
            return { success: true, data: response.data };
        }
        return { success: false, message: response.message || 'Failed to change institution', data: null };
    } catch (error: any) {
        console.error('changeInstitution error:', error);
        return { success: false, message: error.message || 'Failed to change institution', data: null };
    }
}

export async function getStaffData(payload: any) {
    try {
        const response = await api.post<any>(API_KEY, 'StaffLogin/getstudata', payload);
        if (response.success && response.data) {
            return { success: true, data: response.data };
        }
        return { success: false, message: response.message || 'Failed to fetch staff data', data: null };
    } catch (error: any) {
        console.error('getStaffData error:', error);
        return { success: false, message: error.message || 'Failed to fetch staff data', data: null };
    }
}

export async function onchangeuser(payload: any) {
    try {
        const response = await api.post<any>(API_KEY, 'StaffLogin/onchangeuser', payload);
        if (response.success && response.data) {
            return { success: true, data: response.data };
        }
        return { success: false, message: response.message || 'Failed to fetch user data', data: null };
    } catch (error: any) {
        console.error('onchangeuser error:', error);
        return { success: false, message: error.message || 'Failed to fetch user data', data: null };
    }
}

export async function saveStaffUser(payload: any) {
    try {
        const response = await api.post<any>(API_KEY, 'StaffLogin/add_or_update_priviledge', payload);
        if (response.success) {
            return { success: true, message: response.message || 'Saved successfully' };
        }
        return { success: false, message: response.message || 'Failed to save' };
    } catch (error: any) {
        console.error('saveStaffUser error:', error);
        return { success: false, message: error.message || 'Failed to save' };
    }
}

export async function updateUsername(payload: any) {
    try {
        const response = await api.post<any>(API_KEY, 'StaffLogin/updateuser', payload);
        if (response.success) {
            return { success: true, message: response.message || 'Username updated successfully' };
        }
        return { success: false, message: response.message || 'Failed to update username' };
    } catch (error: any) {
        console.error('updateUsername error:', error);
        return { success: false, message: error.message || 'Failed to update username' };
    }
}

export async function sendOTPSms(mobileNo: string) {
    try {
        const response = await api.get<any>(API_KEY, `StaffLogin/sendotpsms/${mobileNo}`);
        if (response.success) {
            return { success: true, message: response.message || 'OTP sent successfully' };
        }
        return { success: false, message: response.message || 'Failed to send OTP' };
    } catch (error: any) {
        console.error('sendOTPSms error:', error);
        return { success: false, message: error.message || 'Failed to send OTP' };
    }
}

export async function verifyOTP(otp: string) {
    try {
        const response = await api.get<any>(API_KEY, `StaffLogin/VerifyforgetEmailOtp/${otp}`);
        if (response.success) {
            return { success: true, message: response.message || 'OTP verified successfully' };
        }
        return { success: false, message: response.message || 'Failed to verify OTP' };
    } catch (error: any) {
        console.error('verifyOTP error:', error);
        return { success: false, message: error.message || 'Failed to verify OTP' };
    }
}

export async function getRoleTypeDropdown() {
    try {
        console.info('📡 [SERVER] Fetching Role Type Dropdown...');
        const response = await api.get<any>(API_KEY, 'StaffLogin/get_roletype_drop_down');

        console.info('📥 [SERVER] Role Type Dropdown raw response:', {
            success: response.success,
            message: response.message,
            hasData: !!response.data,
            dataType: typeof response.data,
            isArray: Array.isArray(response.data)
        });

        if (response.success && response.data) {
            // Handle various data structures
            const extractedData = Array.isArray(response.data)
                ? response.data
                : response.data.fillroletype || response.data.$values || response.data;

            if (Array.isArray(extractedData)) {
                console.info(`✅ [SERVER] Extracted ${extractedData.length} roles`);
                return { success: true, data: extractedData };
            }

            console.warn('⚠️ [SERVER] Extracted data is not an array:', typeof extractedData);
            return { success: true, data: [] }; // Return empty array instead of null to prevent frontend crashes
        }
        return { success: false, message: response.message || 'Failed to fetch role types', data: [] };
    } catch (error: any) {
        console.error('❌ [SERVER] getRoleTypeDropdown error:', error);
        return { success: false, message: error.message || 'Failed to fetch role types', data: [] };
    }
}

export async function getTrustDropdown() {
    try {
        console.info('📡 [SERVER] Fetching Trust Dropdown...');
        const response = await api.get<any>(API_KEY, 'StaffLogin/get_trust_drop_down');

        console.info('📥 [SERVER] Trust Dropdown raw response:', {
            success: response.success,
            message: response.message,
            hasData: !!response.data,
            isArray: Array.isArray(response.data)
        });

        if (response.success && response.data) {
            const extractedData = Array.isArray(response.data)
                ? response.data
                : response.data.fillorganisation || response.data.$values || response.data;

            if (Array.isArray(extractedData)) {
                console.info(`✅ [SERVER] Extracted ${extractedData.length} trusts`);
                return { success: true, data: extractedData };
            }
            return { success: true, data: [] };
        }
        return { success: false, message: response.message || 'Failed to fetch trusts', data: [] };
    } catch (error: any) {
        console.error('❌ [SERVER] getTrustDropdown error:', error);
        return { success: false, message: error.message || 'Failed to fetch trusts', data: [] };
    }
}

export async function getInstitutionDropdown() {
    try {
        console.info('📡 [SERVER] Fetching Institution Dropdown...');
        const response = await api.get<any>(API_KEY, 'StaffLogin/get_institution_drop_down');

        console.info('📥 [SERVER] Institution Dropdown raw response:', {
            success: response.success,
            message: response.message,
            hasData: !!response.data,
            isArray: Array.isArray(response.data)
        });

        if (response.success && response.data) {
            const extractedData = Array.isArray(response.data)
                ? response.data
                : response.data.fillinstitution || response.data.$values || response.data;

            if (Array.isArray(extractedData)) {
                console.info(`✅ [SERVER] Extracted ${extractedData.length} institutions`);
                return { success: true, data: extractedData };
            }
            return { success: true, data: [] };
        }
        return { success: false, message: response.message || 'Failed to fetch institutions', data: [] };
    } catch (error: any) {
        console.error('❌ [SERVER] getInstitutionDropdown error:', error);
        return { success: false, message: error.message || 'Failed to fetch institutions', data: [] };
    }
}

export async function getStaffDropdownByInstitution(payload: any) {
    try {
        // await api.post<any>(API_KEY, 'StaffLogin/get_search_list', payload)
        console.info('📡 [SERVER] Fetching Staff Dropdown for Institution (Single):', payload);
        const response = await api.post<any>(API_KEY, 'StaffLogin/get_staff_drop_down_onchangeof_institution',payload);

        if (response.success && response.data) {
            // const extractedData = Array.isArray(response.data)
            //     ? response.data
            //     : response.data.fillstaff || response.data.$values || response.data;

            // if (Array.isArray(extractedData)) {
            //     return { success: true, data: extractedData };
            // }

            return { success: true, data: response.data };
        }
        return { success: false, message: response.message || 'Failed to fetch staff', data: [] };
    } catch (error: any) {
        console.error('❌ [SERVER] getStaffDropdownByInstitution error:', error);
        return { success: false, message: error.message || 'Failed to fetch staff', data: [] };
    }
}

export async function getMultipleStaffUsers(mi_id: number) {
    try {
        console.info('📡 [SERVER] Fetching Multiple Staff Users for Institution:', mi_id);
        const response = await api.get<any>(API_KEY, `StaffLogin/get_staffs_user_drop_down_onchangeof_institution/${mi_id}`);

        if (response.success && response.data) {
            const extractedData = Array.isArray(response.data)
                ? response.data
                : response.data.fillstaff || response.data.$values || response.data;

            if (Array.isArray(extractedData)) {
                return { success: true, data: extractedData };
            }
            return { success: true, data: [] };
        }
        return { success: false, message: response.message || 'Failed to fetch multiple staff users', data: [] };
    } catch (error: any) {
        console.error('❌ [SERVER] getMultipleStaffUsers error:', error);
        return { success: false, message: error.message || 'Failed to fetch multiple staff users', data: [] };
    }
}

export async function getModuleDropdownByInstitution(mi_id: number) {
    try {
        console.info('📡 [SERVER] Fetching Module Dropdown for Institution:', mi_id);
        const response = await api.get<any>(API_KEY, `StaffLogin/get_module_name_drop_down_onchangeof_institution/${mi_id}`);

        if (response.success && response.data) {
            const extractedData = Array.isArray(response.data)
                ? response.data
                : response.data.fillmodule || response.data.$values || response.data;

            if (Array.isArray(extractedData)) {
                return { success: true, data: extractedData };
            }
            return { success: true, data: [] };
        }
        return { success: false, message: response.message || 'Failed to fetch modules', data: [] };
    } catch (error: any) {
        console.error('❌ [SERVER] getModuleDropdownByInstitution error:', error);
        return { success: false, message: error.message || 'Failed to fetch modules', data: [] };
    }
}

export async function getCategoryDropdownByInstitution(mi_id: number) {
    try {
        console.info('📡 [SERVER] Fetching Category Dropdown for Institution:', mi_id);
        const response = await api.get<any>(API_KEY, `StaffLogin/get_category_name_drop_down_onchangeof_institution/${mi_id}`);

        if (response.success && response.data) {
            const extractedData = Array.isArray(response.data)
                ? response.data
                : response.data.fillcategory || response.data.$values || response.data;

            if (Array.isArray(extractedData)) {
                return { success: true, data: extractedData };
            }
            return { success: true, data: [] };
        }
        return { success: false, message: response.message || 'Failed to fetch categories', data: [] };
    } catch (error: any) {
        console.error('❌ [SERVER] getCategoryDropdownByInstitution error:', error);
        return { success: false, message: error.message || 'Failed to fetch categories', data: [] };
    }
}

export async function getSearchListGrid(payload: any) {
    try {
        const response = await api.post<any>(API_KEY, 'StaffLogin/get_search_list', payload);
        if (response.success && response.data) {
            return {
                success: true,
                data: response.data.searchfilter || response.data.$values || []
            };
        }
        return { success: false, message: response.message || 'Failed to fetch search list', data: [] };
    } catch (error: any) {
        console.error('getSearchListGrid error:', error);
        return { success: false, message: error.message || 'Failed to fetch search list', data: [] };
    }
}

export async function getAdminUserList(mi_id: number, flag: string, roleTypeId: number, roleName: string) {
    try {
        console.info('📡 [SERVER] Fetching Admin User List:', { mi_id, flag, roleTypeId, roleName });
        const response = await api.get<any>(
            API_KEY,
            `StaffLogin/get_employeelistadmin_onchangeof_institution/${mi_id}/${flag}/${roleTypeId}/${roleName}`
        );

        if (response.success && response.data) {
            const extractedData = Array.isArray(response.data)
                ? response.data
                : response.data.studentDetails || response.data.employeelistadmin || response.data.$values || response.data;

            return {
                success: true,
                data: Array.isArray(extractedData) ? extractedData : []
            };
        }
        return { success: false, message: response.message || 'Failed to fetch admin list', data: [] };
    } catch (error: any) {
        console.error('❌ [SERVER] getAdminUserList error:', error);
        return { success: false, message: error.message || 'Failed to fetch admin list', data: [] };
    }
}
export async function getSearchListGridByInstituteName(
    mi_id: number,
    searchParams: any = {}
): Promise<{
    success: boolean;
    data: SearchGridDTO[];
    total: number;
    page: number;
    page_size: number;
    message?: string;
}> {
    try {
        console.info('📡 [SERVER] Fetching Search List Grid for Institute:', mi_id, searchParams);
        const query = getSearchParamsUrl(searchParams);
        const url = `StaffLogin/get_search_list_grid_onchange_of_institute_name/${mi_id}?${query}`;
        const response = await api.get<any>(API_KEY, url);

        if (response.success && response.data) {
            const extractedData = Array.isArray(response.data)
                ? response.data
                : response.data.searchfilter || response.data.$values || response.data;

            return {
                success: true,
                data: Array.isArray(extractedData) ? extractedData : [],
                total: Number(response.total || (Array.isArray(extractedData) ? extractedData.length : 0)),
                page: Number(response.page || 1),
                page_size: Number(response.page_size || 10)
            };
        }
        return { success: false, message: response.message || 'Failed to fetch search list', data: [], total: 0, page: 1, page_size: 10 };
    } catch (error: any) {
        console.error('❌ [SERVER] getSearchListGridByInstituteName error:', error);
        return { success: false, message: error.message || 'Failed to fetch search list', data: [], total: 0, page: 1, page_size: 10 };
    }
}

export async function getUsernameOnStaffSelection(hrme_id: number, mi_id: number, ivrmrt_id: number) {
    try {
        console.info('📡 [SERVER] Fetching Username for Staff Selection:', { hrme_id, mi_id, ivrmrt_id });
        const response = await api.get<any>(
            API_KEY,
            `StaffLogin/get_username_onchange_of_single_staff_selection/${hrme_id}/${mi_id}/${ivrmrt_id}`
        );

        if (response.success && response.data) {
            let extractedData = Array.isArray(response.data) ? response.data : response.data.$values || response.data;

            // If it's still an object (not an array), wrap it in an array
            if (!Array.isArray(extractedData)) {
                extractedData = [extractedData];
            }

            return {
                success: true,
                data: extractedData
            };
        }
        return { success: false, message: response.message || 'Failed to fetch username', data: [] };
    } catch (error: any) {
        console.error('❌ [SERVER] getUsernameOnStaffSelection error:', error);
        return { success: false, message: error.message || 'Failed to fetch username', data: [] };
    }
}

export async function getMasterPageListGridOnChangeOfStaff(hrme_id: number, mi_id: number, role_id: number, searchParams: any = {}) {
    try {
        console.info('📡 [SERVER] Fetching Master Page List Grid for Staff:', { hrme_id, mi_id, role_id, searchParams });
        const query = getSearchParamsUrl(searchParams);
        const url = `StaffLogin/get_master_page_list_grid_onchangeof_staff/${hrme_id}/${mi_id}/${role_id}${query ? `?${query}` : ''}`;
        const response = await api.get<any>(API_KEY, url);

        if (response.success && response.data) {
            const extractedData = Array.isArray(response.data)
                ? response.data
                : response.data.$values || response.data.gridview1 || response.data;

            return {
                success: true,
                data: Array.isArray(extractedData) ? extractedData : [],
                total: Number(response.total || (Array.isArray(extractedData) ? extractedData.length : 0)),
                page: Number(response.page || 1),
                page_size: Number(response.page_size || 10)
            };
        }
        return {
            success: false,
            message: response.message || 'Failed to fetch master page list',
            data: [],
            total: 0,
            page: 1,
            page_size: 10
        };
    } catch (error: any) {
        console.error('❌ [SERVER] getMasterPageListGridOnChangeOfStaff error:', error);
        return { success: false, message: error.message || 'Failed to fetch master page list', data: [], total: 0, page: 1, page_size: 10 };
    }
}
export async function getMobileAppMasterPageListOnChangeOfStaff(hrme_id: number, mi_id: number, role_id: number, searchParams: any = {}) {
    try {
        console.info('📡 [SERVER] Fetching Mobile App Master Page List Grid for Staff:', { hrme_id, mi_id, role_id, searchParams });
        const query = getSearchParamsUrl(searchParams);
        const url = `StaffLogin/get_Mobile_App_Master_Page_List_onchangeof_staff/${hrme_id}/${mi_id}/${role_id}${query ? `?${query}` : ''}`;
        const response = await api.get<any>(API_KEY, url);

        if (response.success && response.data) {
            const extractedData = Array.isArray(response.data)
                ? response.data
                : response.data.$values || response.data.data || response.data;

            return {
                success: true,
                data: Array.isArray(extractedData) ? extractedData : [],
                total: Number(response.total || (Array.isArray(extractedData) ? extractedData.length : 0)),
                page: Number(response.page || 1),
                page_size: Number(response.page_size || 10)
            };
        }
        return {
            success: false,
            message: response.message || 'Failed to fetch mobile master page list',
            data: [],
            total: 0,
            page: 1,
            page_size: 10
        };
    } catch (error: any) {
        console.error('❌ [SERVER] getMobileAppMasterPageListOnChangeOfStaff error:', error);
        return {
            success: false,
            message: error.message || 'Failed to fetch mobile master page list',
            data: [],
            total: 0,
            page: 1,
            page_size: 10
        };
    }
}

export async function getSavedMobileAppPageListOnChangeOfStaff(hrme_id: number, mi_id: number, role_id: number, searchParams: any = {}) {
    try {
        console.info('📡 [SERVER] Fetching Saved Mobile App Page List Grid for Staff:', { hrme_id, mi_id, role_id, searchParams });
        const query = getSearchParamsUrl(searchParams);
        const url = `StaffLogin/get_Saved_Mobile_App_Page_List_onchangeof_staff/${hrme_id}/${mi_id}/${role_id}${query ? `?${query}` : ''}`;
        const response = await api.get<any>(API_KEY, url);

        if (response.success && response.data) {
            const extractedData = Array.isArray(response.data)
                ? response.data
                : response.data.$values || response.data.data || response.data;

            return {
                success: true,
                data: Array.isArray(extractedData) ? extractedData : [],
                total: Number(response.total || (Array.isArray(extractedData) ? extractedData.length : 0)),
                page: Number(response.page || 1),
                page_size: Number(response.page_size || 10)
            };
        }
        return {
            success: false,
            message: response.message || 'Failed to fetch saved mobile page list',
            data: [],
            total: 0,
            page: 1,
            page_size: 10
        };
    } catch (error: any) {
        console.error('❌ [SERVER] getSavedMobileAppPageListOnChangeOfStaff error:', error);
        return {
            success: false,
            message: error.message || 'Failed to fetch saved mobile page list',
            data: [],
            total: 0,
            page: 1,
            page_size: 10
        };
    }
}

export async function getSavedListGridOnChangeOfStaff(hrme_id: number, mi_id: number, role_id: number, searchParams: any = {}) {
    try {
        console.info('📡 [SERVER] Fetching Saved List Grid for Staff:', { hrme_id, mi_id, role_id, searchParams });
        const query = getSearchParamsUrl(searchParams);
        const url = `StaffLogin/get_saved_list_grid_onchangeof_staff/${hrme_id}/${mi_id}/${role_id}${query ? `?${query}` : ''}`;
        const response = await api.get<any>(API_KEY, url);

        if (response.success && response.data) {
            const extractedData = Array.isArray(response.data)
                ? response.data
                : response.data.$values || response.data.data || response.data;

            return {
                success: true,
                data: Array.isArray(extractedData) ? extractedData : [],
                total: Number(response.total || (Array.isArray(extractedData) ? extractedData.length : 0)),
                page: Number(response.page || 1),
                page_size: Number(response.page_size || 10)
            };
        }
        return { success: false, message: response.message || 'Failed to fetch saved list', data: [], total: 0, page: 1, page_size: 10 };
    } catch (error: any) {
        console.error('❌ [SERVER] getSavedListGridOnChangeOfStaff error:', error);
        return { success: false, message: error.message || 'Failed to fetch saved list', data: [], total: 0, page: 1, page_size: 10 };
    }
}

export async function getMasterPageListGridOnChangeOfModule(
    User_Name: string,
    MI_Id: number,
    IVRMRT_Id: number,
    ivrmm_id: number[],
    mi_ids: number[]
) {
    try {
        console.info('📡 [SERVER] Fetching Master Page List for Modules:', { User_Name, MI_Id, IVRMRT_Id, ivrmm_id, mi_ids });

        const params = new URLSearchParams();
        params.append('User_Name', User_Name);
        params.append('MI_Id', String(MI_Id));
        params.append('IVRMRT_Id', String(IVRMRT_Id));

        ivrmm_id.forEach((id) => params.append('ivrmm_id', String(id)));
        mi_ids.forEach((id) => params.append('mi_ids', String(id)));

        const url = `StaffLogin/get_staff_page_privilege?${params.toString()}`;
        const response = await api.get<any>(API_KEY, url);

        const responseData = response.data;
        const showgrid1 = Array.isArray(responseData)
            ? responseData
            : responseData?.showgrid1?.$values ||
              responseData?.showgrid1 ||
              responseData?.data?.showgrid1?.$values ||
              responseData?.data?.showgrid1 ||
              responseData?.$values ||
              [];
        const savedgrid = response.savedGrid ||
            responseData?.savedgrid?.$values ||
            responseData?.savedgrid ||
            responseData?.data?.savedgrid?.$values ||
            responseData?.data?.savedgrid ||
            [];

        const rawModuleExist = response.moduleexistid ||
            responseData?.moduleexistid?.$values ||
            responseData?.moduleexistid ||
            responseData?.data?.moduleexistid?.$values ||
            responseData?.data?.moduleexistid ||
            response.data?.moduleexistid ||
            [];

        const moduleexistid = Array.isArray(rawModuleExist)
            ? rawModuleExist
            : (rawModuleExist?.$values || []);

        return {
            success: true,
            data: showgrid1,
            savedGrid: savedgrid,
            moduleexistid: moduleexistid,
            total: Number(response.total || showgrid1.length),
            page: Number(response.page || 1),
            page_size: Number(response.page_size || 10)
        };
    } catch (error: any) {
        console.error('❌ [SERVER] getMasterPageListGridOnChangeOfModule error:', error);
        return { success: false, message: error.message || 'Failed to fetch master page list for modules', data: [], savedGrid: [], moduleexistid: [] };
    }
}

export async function getInstitutionOnChangeOfTrust(trust_id: number) {
    try {
        console.info('📡 [SERVER] Fetching Institution Dropdown for Trust:', { trust_id });
        const response = await api.post<any>(API_KEY, `StaffLogin/get_Institutions_Changeof_trust/${trust_id}`);

        console.info('📥 [SERVER] getInstitutionOnChangeOfTrust raw response:', {
            success: response?.success,
            message: response?.message,
            hasData: !!response?.data,
            isArray: Array.isArray(response?.data)
        });

        const rawData = response?.data !== undefined ? response.data : response;
        let extractedData: any[] = [];

        if (Array.isArray(rawData)) {
            extractedData = rawData;
        } else if (rawData && typeof rawData === 'object') {
            const list =
                rawData.fillinstitution ||
                rawData.fillinstitutionList ||
                rawData.fillinstituion ||
                rawData.institutionList ||
                rawData.$values ||
                rawData.data;

            if (Array.isArray(list)) {
                extractedData = list;
            } else if (list?.$values && Array.isArray(list.$values)) {
                extractedData = list.$values;
            } else if (Array.isArray(rawData)) {
                extractedData = rawData;
            }
        }

        console.info(`✅ [SERVER] Extracted ${extractedData.length} institutions for trust ${trust_id}`);
        return { success: true, data: extractedData };
    } catch (error: any) {
        console.error('❌ [SERVER] getInstitutionOnChangeOfTrust error:', error);
        return { success: false, message: error.message || 'Failed to fetch institutions for trust', data: [] };
    }
}

