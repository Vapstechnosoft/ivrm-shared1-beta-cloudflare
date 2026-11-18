'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    IStudentFeeEnablePartialPaymentInitialData,
    IStudentFeeEnablePartialPaymentSavePayload,
    IStudentFeeEnablePartialPaymentSection,
    IStudentFeeEnablePartialPaymentStudent,
    IStudentFeeEnablePartialPaymentYear
} from '@/types/fees/transactions/transactions';

export async function getStudentFeeEnablePartialPaymentDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'amsT_FirstName,fsepP_RemarksDate,asmaY_Year,fsepP_Remarks,fsepP_ActiveFlag,fsepP_Id'
    );
    const url = `/StudentFeeEnablePartialPaymentFacade/GetYearList?${urlParams}`;
    console.info('StudentFeeEnablePartialPaymentFacade', url);
    return await api.get<IStudentFeeEnablePartialPaymentInitialData>('fees', url);
}

export async function getStudentFeeEnablePartialPaymentAcademicYears() {
    const url = '/FeesCommon/academic-year-list';
    return await api.get<IStudentFeeEnablePartialPaymentYear[]>('fees', url);
}

export async function getStudentFeeEnablePartialPaymentSections(data: { ASMAY_Id: number; ASMCL_Id: number | string }) {
    const url = '/StudentFeeEnablePartialPaymentFacade/getsection';
    return await api.post<{ fillsection: IStudentFeeEnablePartialPaymentSection[] }>('fees', url, data);
}

export async function getStudentFeeEnablePartialPaymentStudents(data: {
    ASMAY_Id: number;
    ASMCL_Id: number | string;
    AMSC_Id: number | string;
}) {
    const url = '/StudentFeeEnablePartialPaymentFacade/get_student';
    return await api.post<{ studentlist: IStudentFeeEnablePartialPaymentStudent[] }>('fees', url, data);
}

export async function saveStudentFeeEnablePartialPayment(data: IStudentFeeEnablePartialPaymentSavePayload) {
    const url = '/StudentFeeEnablePartialPaymentFacade/savedata';
    return await api.post<{ retrunMsg: string }>('fees', url, data);
}

export async function toggleStudentFeeEnablePartialPayment(data: { FSEPP_Id: number;[key: string]: any }) {
    const url = '/StudentFeeEnablePartialPaymentFacade/deactivate';
    return await api.post<{ retrunMsg: string }>('fees', url, data);
}
