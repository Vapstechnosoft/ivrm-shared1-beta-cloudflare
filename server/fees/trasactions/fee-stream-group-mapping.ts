'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    IFeeStreamGroupMappingGrid,
    IFeeStreamGroupMappingAcademicYear,
    IFeeStreamGroupMappingClass,
    IFeeStreamGroupMappingGroup,
    IFeeStreamGroupMappingStream,
    IFeeStreamGroupMappingSavePayload
} from '@/types/fees/transactions/feeStreamGroupMapping';

/**
 * Fetch Fee Stream Group Mapping table records (Grid)
 * Backend Route: [HttpGet("fee-stream-group-mapping-list")]
 */
export async function getFeeStreamGroupMappingData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeStreamGroupMapping/fee-stream-group-mapping-list?${urlParams}`;
    return await api.get<IFeeStreamGroupMappingGrid[]>('fees', url);
}

/**
 * Fetch Academic Year dropdown list
 * Following established pattern across Fees module (e.g. feeChequeBounce, FeeIncomeTax_Report)
 * Backend Route: FeesCommonController [HttpGet("academic-year-list")]
 */
export async function getFeeStreamGroupMappingAcademicYear() {
    const url = '/FeesCommon/academic-year-list';
    return await api.get<IFeeStreamGroupMappingAcademicYear[]>('fees', url);
}

/**
 * Fetch Class dropdown list
 * Following established pattern across Fees module (e.g. feeChequeBounce, daily_fee_collection_report)
 * Backend Route: FeesCommonController [HttpGet("class-details")]
 */
export async function getFeeStreamGroupMappingClasses() {
    const url = '/FeesCommon/class-details';
    return await api.get<IFeeStreamGroupMappingClass[]>('fees', url);
}

/**
 * Fetch Fee Groups list
 * Backend Route: FeesCommonController [HttpGet("fee-group-details")]
 */
export async function getFeeStreamGroupMappingGroups() {
    const url = '/FeesCommon/fee-group-details';
    return await api.get<IFeeStreamGroupMappingGroup[]>('fees', url);
}

/**
 * Fetch Stream / Syllabus list from Preadmission module
 * Backend Route: [HttpPost("getstreams")]
 */
export async function getFeeStreamGroupMappingStreams(classId?: number) {
    try {
        const payload = classId ? { ASMCL_Id: Number(classId) } : {};
        const response: any = await api.post('preadmission', '/StudentApplication/getstreams', payload);
        const list = response?.data?.syllabuslist || response?.data || response?.syllabuslist || [];
        if (Array.isArray(list)) {
            return list.map((item: any) => ({
                pasL_ID: item.pasL_ID ?? item.pasl_id ?? item.asmst_Id ?? item.ASMST_Id ?? item.id,
                pasL_Name: item.pasL_Name ?? item.pasl_name ?? item.asmst_StreamName ?? item.ASMST_StreamName ?? item.name
            }));
        }
    } catch (err) {
        console.warn('Failed to load streams from preadmission:', err);
    }
    return [];
}

/**
 * Save or Update Fee Stream Group Mapping
 * Backend Route: [HttpPost("add-or-update")]
 */
export async function saveFeeStreamGroupMapping(data: IFeeStreamGroupMappingSavePayload | any) {
    const url = '/FeeStreamGroupMapping/add-or-update';
    return await api.post<any>('fees', url, data);
}

/**
 * Fetch record by ID for editing
 * Backend Route: [HttpGet("fee-stream-group-mapping-byid/{id}")]
 */
export async function editFeeStreamGroupMapping(id: number) {
    const url = `/FeeStreamGroupMapping/fee-stream-group-mapping-byid/${id}`;
    return await api.get<any>('fees', url);
}

/**
 * Delete record by ID (if available on controller)
 */
export async function deleteFeeStreamGroupMapping(id: number) {
    const url = `/FeeStreamGroupMapping/deletedetails/${id}`;
    return await api.delete('fees', url);
}

/**
 * Toggle active/inactive status
 * Backend Route: [HttpPut("toggle/{id}")]
 */
export async function deactivateFeeStreamGroupMapping(data: any) {
    const id = data?.fmsgM_Id ?? data?.FMSGM_Id ?? data;
    const url = `/FeeStreamGroupMapping/toggle/${id}`;
    return await api.put<any>('fees', url);
}