'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    IActivePreadmissionDetails,
    ICasteDropdown,
    ICountryDropdown,
    IGenderDropdown,
    IInitiatePaymentResponse,
    IPreadmissionClassDropdown,
    IPreadmissionDocumentDropdown,
    IPreadmissionStudentApplicationList,
    IReligionDropdown,
    IStateDropdown
} from '@/types/admission/preadmission/transactions';

/**
 * Fetches the active preadmission details for Burnpur
 */
export async function getBurnpurActivePreadmissionDetails() {
    const url = '/transfer_application_status/active_preadmission_details';
    return await api.get<IActivePreadmissionDetails>('preadmission', url);
}

export async function getBurnpurReligionDropdown() {
    const url = '/student_application_form/religion_drop_down_list';
    return await api.getArray<IReligionDropdown>('preadmission', url);
}

export async function getBurnpurCasteDropdown(religion_id: number) {
    const url = `/student_application_form/caste_drop_down_list?religion_id=${religion_id}`;
    return await api.getArray<ICasteDropdown>('preadmission', url);
}

export async function getBurnpurCountryDropdown() {
    const url = '/student_application_form/country_drop_down_list';
    return await api.getArray<ICountryDropdown>('preadmission', url);
}

export async function getBurnpurStateDropdown(country_id: number) {
    const url = `/student_application_form/state_drop_down_list?country_id=${country_id}`;
    return await api.getArray<IStateDropdown>('preadmission', url);
}

export async function getBurnpurGenderDropdown() {
    const url = '/student_application_form/gender_drop_down_list';
    return await api.getArray<IGenderDropdown>('preadmission', url);
}

export async function getBurnpurPreadmissionClassDropdown() {
    const url = '/student_application_form/master_class_drop_down_list';
    return await api.getArray<IPreadmissionClassDropdown>('preadmission', url);
}

export async function getBurnpurDocumentDropdown() {
    const url = '/student_application_form/required_document_drop_down_list';
    return await api.getArray<IPreadmissionDocumentDropdown>('preadmission', url);
}

export async function getBurnpurStudentApplicationList(asmay_id: number, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'PASR_RegistrationNo,student_name,PASR_Sex,applied_class_name');
    const url = `/student_application_form/student_application_list?asmay_id=${asmay_id}&${urlParams}`;

    return await api.get<IPreadmissionStudentApplicationList[]>('preadmission', url);
}

/**
 * Specifically for Burnpur (St. Thomas) Student Application submission
 */
export async function addBurnpurStudentApplication(data: any) {
    const url = '/student_application_form/add_student_application_burnpur';
    return await api.post<any>('preadmission', url, data);
}

/**
 * Initiate payment for the application
 */
export async function initiateBurnpurApplicationPayment(pasr_id: number) {
    const url = `/payment/initiate_payment/${pasr_id}`;
    return await api.post<IInitiatePaymentResponse>('preadmission', url);
}

/**
 * Update payment status
 */
export async function updateBurnpurPaymentStatus(status: string, transaction_id: string, pasr_id: number) {
    try {
        const url = `/payment/update_payment_status?status=${status}&transaction_id=${transaction_id}&pasr_id=${pasr_id}`;
        return await api.post<any>('preadmission', url);
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Failed to update payment status'
        };
    }
}
