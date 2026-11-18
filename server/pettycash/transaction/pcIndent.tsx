'use server';

import { api } from '@/lib/apiService';
import type { IIndentFilters, IPcIndent } from '@/types/pettycash/transaction/pcIndent';

/**
 * Fetches the indent data grid based on search/filter parameters.
 * @param filters The filter parameters (Department, Dates, etc.)
 */
export async function getIndentGrid(filters: IIndentFilters) {
    const url = `/PC_IndentFacade/onloaddataTransactionGrid`;
    return await api.post<IPcIndent[]>('pettycashandassettracking', url, filters);
}

/**
 * Fetches the organization/establishment dropdown data.
 */
export async function getOrganizationDropdown() {
    // Standard endpoint for organization/establishment dropdown
    const url = `/PC_IndentFacade/GetOrganizations`;
    return await api.get<any[]>('pettycashandassettracking', url);
}

/**
 * Saves or updates a Petty Cash Indent.
 * @param data The indent data to save.
 */
export async function saveIndent(data: any) {
    const url = `/PC_IndentFacade/SaveData`;
    return await api.post<any>('pettycashandassettracking', url, data);
}

/**
 * Deactivates or activates an indent record.
 * @param id The ID of the indent to toggle.
 */
export async function toggleIndentStatus(id: number) {
    const url = `/PC_IndentFacade/DeactivateParticularsIndent/${id}`;
    return await api.put<any>('pettycashandassettracking', url);
}

/**
 * Fetches initial data for the indent page (organizations, etc.)
 */
export async function getIndentInitialData() {
    const url = `/PC_IndentFacade/GetInitialData`;
    return await api.get<any>('pettycashandassettracking', url);
}
