'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    ICasteDropdown,
    ICountryDropdown,
    IDistrictDropdown,
    IGenderDropdown,
    IInitiatePaymentResponse,
    IPreadmissionClassDropdown,
    IPreadmissionDocumentDropdown,
    IPreadmissionStudentApplicationList,
    IReferenceDropdown,
    IReligionDropdown,
    ISourceDropdown,
    IStateDropdown
} from '@/types/admission/preadmission/transactions';

export async function getReligionDropdown() {
    const url = '/student_application_form/religion_drop_down_list';
    return await api.getArray<IReligionDropdown>('preadmission', url);
}

export async function getCasteDropdown(religion_id: number) {
    const url = `/student_application_form/caste_drop_down_list?religion_id=${religion_id}`;
    return await api.getArray<ICasteDropdown>('preadmission', url);
}

export async function getCountryDropdown() {
    const url = '/student_application_form/country_drop_down_list';
    return await api.getArray<ICountryDropdown>('preadmission', url);
}

export async function getStateDropdown(country_id: number) {
    const url = `/student_application_form/state_drop_down_list?country_id=${country_id}`;
    return await api.getArray<IStateDropdown>('preadmission', url);
}

export async function getDistrictDropdown(state_id: number) {
    const url = `/student_application_form/GetDistrictDropDownList?state_id=${state_id}`;
    return await api.getArray<IDistrictDropdown>('preadmission', url);
}

export async function getGenderDropdown() {
    const url = '/student_application_form/gender_drop_down_list';
    return await api.getArray<IGenderDropdown>('preadmission', url);
}

export async function getSourceDropdown() {
    const url = '/student_application_form/source_drop_down_list';
    return await api.getArray<ISourceDropdown>('preadmission', url);
}

export async function getReferenceDropdown() {
    const url = '/student_application_form/reference_drop_down_list';
    return await api.getArray<IReferenceDropdown>('preadmission', url);
}

export async function getPreadmissionDocumentDropdown(page_size: number = 100) {
    const url = `/student_application_form/required_document_drop_down_list?page=1&page_size=${page_size}`;
    return await api.getArray<IPreadmissionDocumentDropdown>('preadmission', url);
}

export async function getPreadmissionClassDropdown() {
    const url = '/student_application_form/master_class_drop_down_list';
    return await api.getArray<IPreadmissionClassDropdown>('preadmission', url);
}

export async function addStudentApplicationForm(data: any) {
    const url = '/student_application_form/add_student_application';
    return await api.post<any>('preadmission', url, data);
}

export async function getStudentApplicationList(asmay_id: number, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'PASR_RegistrationNo,student_name,PASR_Sex,applied_class_name');
    const url = `/student_application_form/student_application_list?asmay_id=${asmay_id}&${urlParams}`;

    return await api.get<IPreadmissionStudentApplicationList[]>('preadmission', url);
}

export async function applicationFormInitiatePayment(pasr_id: number) {
    const url = `/payment/initiate_payment/${pasr_id}`;
    return await api.post<IInitiatePaymentResponse>('preadmission', url);
}

export async function updateApplicationPaymentStatus(status: string, transaction_id: string) {
    try {
        const url = `/payment/update_payment_status?status=${status}&transaction_id=${transaction_id}`;

        const response = await api.post<any>('preadmission', url);

        return response || { success: false, message: 'No response from server' };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Failed to update payment status',
            error: error?.toString()
        };
    }
}

export async function toggleStudentApplication(id: number) {
    const url = `/student_application_form/toggle/${id}`;
    return await api.put('preadmission', url);
}

export async function getStudentApplicationForm(id: number) {
    const url = `/student_application_form/get_student_application_details/${id}`;
    return await api.get<any>('preadmission', url);
}

export async function getStudentPrintData(pasR_Id: number, ASMCL_Id: number, ASMAY_Id: number, ASMST_Id: number) {
    const url = `/student_application_form/getstudentprintData?pasR_Id=${pasR_Id}&ASMCL_Id=${ASMCL_Id}&ASMAY_Id=${ASMAY_Id}&ASMST_Id=${ASMST_Id}`;
    return await api.post<any>('preadmission', url);
}
