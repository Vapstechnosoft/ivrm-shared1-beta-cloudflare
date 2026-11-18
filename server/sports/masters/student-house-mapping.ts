'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';

const API_URL = {
    GET_DETAILS: '/SportsStudentHouseMapping/getDetails',
    GET_CLASS: '/SportStudentEligbleReport/get_class',
    GET_SECTION: '/SportStudentEligbleReport/get_section',
    GET_STUDENT: '/SportStudentEligbleReport/get_student',
    EDIT_RECORD: '/SportsStudentHouseMapping/EditRecord',
    SAVE: '/SportsStudentHouseMapping/saveRecord',
    TOGGLE: '/SportsStudentHouseMapping/deactivate'
};

/** Fetch initial load data (years, houses, and grid data) with support for sorting/filtering */
export async function getStudentHouseMappingLoadData(params?: any) {
    try {
        const urlParams = getSearchParamsUrl(params || {});
        const url = `${API_URL.GET_DETAILS}?${urlParams}`;
        const response = await api.post<any>('sports', url, {});
        return {
            yearlist: response.data?.yearlist || [],
            houseList: response.data?.houseList || [],
            alldata: response.data?.alldata || [],
            total: response.total || response.data?.total || 0
        };
    } catch (error) {
        console.error('Error fetching load data:', error);
        return { yearlist: [], houseList: [], alldata: [] };
    }
}

/** Fetch class list for a given academic year */
export async function getClassListForHouseMapping(asmaY_Id: number) {
    try {
        const response = await api.post<any>('sports', API_URL.GET_CLASS, { ASMAY_Id: asmaY_Id });
        return response.data?.classList || [];
    } catch (error) {
        console.error('Error fetching class list:', error);
        return [];
    }
}

/** Fetch section list for a given academic year + class */
export async function getSectionListForHouseMapping(asmaY_Id: number, asmcL_Id: number) {
    try {
        const response = await api.post<any>('sports', API_URL.GET_SECTION, { ASMAY_Id: asmaY_Id, ASMCL_Id: asmcL_Id });
        return response.data?.sectionList || [];
    } catch (error) {
        console.error('Error fetching section list:', error);
        return [];
    }
}

/** Fetch student list for a given academic year + class + section */
export async function getStudentListForHouseMapping(asmaY_Id: number, asmcL_Id: number, asmS_Id: number) {
    try {
        const response = await api.post<any>('sports', API_URL.GET_STUDENT, { ASMAY_Id: asmaY_Id, ASMCL_Id: asmcL_Id, ASMS_Id: asmS_Id });
        return response.data?.studentList1 || [];
    } catch (error) {
        console.error('Error fetching student list:', error);
        return [];
    }
}

/** Fetch record details for editing */
export async function editStudentHouseMapping(spccsH_Id: number, asmaY_Id: number) {
    try {
        const response = await api.post<any>('sports', API_URL.EDIT_RECORD, {
            spccsH_Id: spccsH_Id,
            asmaY_Id: asmaY_Id,
            mI_Id: 30 // Defaulting as per user sample, should ideally come from session/context if available
        });
        return {
            editrecord: response.data?.editrecord || [],
            studentList: response.data?.studentList || []
        };
    } catch (error) {
        console.error('Error fetching edit record:', error);
        return { editrecord: [], studentList: [] };
    }
}

/** Save (add/update) a student house mapping */
export async function saveStudentHouseMapping(data: any) {
    try {
        const response = await api.post<any>('sports', API_URL.SAVE, data);
        return response;
    } catch (error) {
        console.error('Error saving student house mapping:', error);
        return { success: false, message: 'Failed to save', data: null };
    }
}

/** Activate / Deactivate a student house mapping */
export async function deleteStudentHouseMapping(spccsH_Id: number) {
    try {
        const response = await api.post<any>('sports', API_URL.TOGGLE, {
            spccsH_Id: spccsH_Id,
            mI_Id: 30 // Defaulting as per user sample
        });
        return response;
    } catch (error) {
        console.error('Error toggling student house mapping:', error);
        return { success: false, message: 'Failed to update status', data: null };
    }
}
