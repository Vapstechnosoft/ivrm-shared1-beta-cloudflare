'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getMasterInstitutionData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/Institution/get_onload_grid_master_trust?${urlParams}`;
    try {
        const response = await api.get<any>('sadmin', url);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getCountryDropdown() {
    const url = `/Institution/get_country_dropdown`;
    try {
        const response = await api.get<any>('sadmin', url);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getStateDropdown(ivrmmC_Id: number) {
    const url = `/Institution/get_state_dropdown_onchnageof_country/${ivrmmC_Id}`;
    try {
        const response = await api.get<any>('sadmin', url);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getInstitutionDropdown() {
    const url = `/MasterInstitutionRoleandModuleMappingFacade/get_institution_drop_down`;
    try {
        const response = await api.get<any>('sadmin', url);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getTrustNameDropdown() {
    const url = `/OrganisationFacade/get_on_load_details`;
    try {
        const response = await api.get<any>('sadmin', url);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function saveMasterInstitution(data: any) {
    const url = `/Institution/savedata`;
    try {
        const response = await api.post<any>('sadmin', url, data);
        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || (typeof error === 'string' ? error : 'Failed to save institution')
        };
    }
}

export async function activateDeactivateMasterInstitution(id: number) {
    const url = `/Institution/deletedetails/${id}`;
    try {
        const response = await api.delete<any>('sadmin', url);
        return response;
    } catch (error: any) {
        try {
            const fallbackResponse = await api.post<any>('sadmin', url, { mI_Id: id });
            return fallbackResponse;
        } catch {
            return {
                success: false,
                message: error?.message || (typeof error === 'string' ? error : 'Failed to update institution status')
            };
        }
    }
}

