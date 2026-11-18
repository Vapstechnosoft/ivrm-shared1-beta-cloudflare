'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IFeeAcademicYearDropdownList } from '@/types/fees/reports/reports';
import type {
    IFeeChequeBounceSavePayload,
    IFeeChequeBounceSearchPayload,
    IFeeChequeBounceSection,
    IFeeChequeBounceStudent
} from '@/types/fees/transactions/feeChequeBounce';

/**
 * Initial load data
 * GET: FeeChequeBounce/getalldetails/{pageId}
 */
export async function getFeeChequeBounceInitialData(searchParams?: ApiSearchparams, asmay_Id?: number) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeChequeBounceFacade/getalldetails/${asmay_Id}?${urlParams}`;
    return await api.get<any>('fees', url);
}

//Get academic year for dropdown
export async function getFeeChequeBounceAcademicYear() {
    const url = '/FeesCommon/academic-year-list';
    return await api.get<IFeeAcademicYearDropdownList>('fees', url);
}

//class drop down
export async function getClassDropDownDetails(data: any) {
    const url = '/FeesCommon/class-details';
    return await api.get<any>('fees', url, { params: data });
}

//Section drop down
export async function getSectionDropDownDetails(data: any) {
    const url = '/FeesCommon/section-dropdown-by-class';
    return await api.get<any>('fees', url, { params: data });
}

//student names
export async function getStudentDropDownDetails(data: any) {
    const url = '/feeitreport/get-student-list';
    return await api.get<any>('fees', url, { params: data });
}

/**
 * Get section list on class change
 * POST: FeeChequeBounce/get_section
 */
export async function getFeeChequeBounceSections() {
    const url = 'FeeChequeBounce/get_section';
    return await api.post<{ fillsection: IFeeChequeBounceSection[] }>('fees', url);
}

/**
 * Get student list on section change
 * POST: FeeChequeBounce/get_students
 */
export async function getFeeChequeBounceStudents() {
    const url = 'FeeChequeBounce/get_students';
    return await api.post<{ fillstudent: IFeeChequeBounceStudent[] }>('fees', url);
}

/**
 * Get receipt list on student change
 * POST: FeeChequeBounce/get_receipts
 */
export async function getFeeChequeBounceReceipts(amst_id: number, asmay_id: number) {
    const url = '/FeeChequeBounceFacade/getreceiptdetails/{asmay_id}/{amst_id}'
        .replace('{asmay_id}', asmay_id.toString())
        .replace('{amst_id}', amst_id.toString());
    return await api.get<any>('fees', url);
}

/**
 * Save or update fee cheque bounce record
 * POST: FeeChequeBounce/
 */
export async function saveFeeChequeBounce(data: IFeeChequeBounceSavePayload) {
    const url = '/FeeChequeBounceFacade/savedata';
    return await api.post<any>('fees', url, data);
}

/**
 * Delete fee cheque bounce record
 * DELETE: FeeChequeBounce/Deletedetails/{fcB_Id}
 */
export async function deleteFeeChequeBounce(fcB_Id: number) {
    const url = `/FeeChequeBounceFacade/Deletedetails/${fcB_Id}`;
    return await api.delete<{ returnval: boolean }>('fees', url);
}

/**
 * Search fee cheque bounce records
 * POST: FeeChequeBounce/searching
 */
export async function searchFeeChequeBounce(data: IFeeChequeBounceSearchPayload) {
    const url = '/FeeChequeBounceFacade/searching';
    return await api.post<any>('fees', url, data);
}
