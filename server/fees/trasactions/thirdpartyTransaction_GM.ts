'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    GM_IFeeBankDetails,
    GM_IFeeThirdPartyTransaction,
    GM_IFeeThirdPartyTransactionGroupDropDown,
    GM_IFeeThirdPartyTransactionHeadDropDown,
    GM_IFeeThirdPartyTransactionStudentDetails,
    GM_IThirdPartyReceiptFlag,
    GM_IThirdPartyTransactionEditdata
} from '@/types/fees/transactions/transactions';

export async function getThirdPartyTrasaction_GM(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/ThirdPartyTransaction?${urlParams}`;
    return await api.get<GM_IFeeThirdPartyTransaction[]>('fees', url);
}

export async function getAcademicThirdPartyTrasaction_GM() {
    const url = '/fee_class_category/academicyearlist';
    return await api.get<GM_IFeeThirdPartyTransaction[]>('fees', url);
}

export async function getThirdPartyTrasactionGroupDropDown_GM(searchParams?: ApiSearchparams) {
    //const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = '/ThirdPartyTransaction/group_drop_down_list';
    return await api.get<GM_IFeeThirdPartyTransactionGroupDropDown[]>('fees', url);
}

export async function getThirdPartyTrasactionHeadDropDown_GM(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `ThirdPartyTransaction/head_drop_down_list?${urlParams}`;
    return await api.get<GM_IFeeThirdPartyTransactionHeadDropDown[]>('fees', url);
}

export async function getThirdPartyTrasactionBankDropDown_GM(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `ThirdPartyTransaction/bank_drop_down_list?${urlParams}`;
    return await api.get<GM_IFeeBankDetails[]>('fees', url);
}

export async function getThirdPartyTrasactionStudentDropDown_GM(asmaY_Id: number) {
    //const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/ThirdPartyTransaction/SelectOrSearchStudent/${asmaY_Id}`;
    console.info('ThirdPartyTransaction', url);
    return await api.get<GM_IFeeThirdPartyTransactionStudentDetails[]>('fees', url);
}

export async function saveorUpdateThirdPartyTrasaction_GM(data: any) {
    const url = '/ThirdPartyTransaction/add-or-update-thirdparty-transaction';
    console.info('saveorUpdateThirdPartyTrasaction api', url, data);
    return await api.post<any>('fees', url, data);
}

export async function get_Receipt_number_GM() {
    //const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = '/ThirdPartyTransaction/get_Receipt_number';
    console.info('ThirdPartyTransaction', url);
    return await api.get<any>('fees', url);
}

export async function geteditThirdpartytrasaction_GM(mi_id: number, asmaY_Id: number, fyp_id: number) {
    //const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `ThirdPartyTransaction/OtherTransactionById/${mi_id}/${asmaY_Id}/${fyp_id}`;
    console.info('ThirdPartyTransaction', url);
    return await api.get<GM_IThirdPartyTransactionEditdata[]>('fees', url);
}

export async function deleteThirdPartyTrasaction_GM(fyp_id: number) {
    const url = `/ThirdPartyTransaction/delete/${fyp_id}`;
    console.info(url);
    return await api.delete('fees', url);
}

export async function receiptView_GM(data: any) {
    const url = '/ThirdPartyTransaction/print_receipt';

    console.info('thirdPartyTrasaction', url);
    return await api.post<any>('fees', url, data);
}

export async function ThirdPartyTrasactionfeeReceiptNoflg_GM() {
    const url = '/ThirdPartyTransaction/ThirdPartyTrasactionfeeReceiptNoflg';

    console.info('ThirdPartyTrasactionfeeReceiptNoflg', url);
    return await api.get<GM_IThirdPartyReceiptFlag[]>('fees', url);
}
