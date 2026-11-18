'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    ICollegeFeeRefundableAllDetailsResponse,
    ICollegeFeeRefundableHeadItem,
    ICollegeFeeRefundableSavePayload,
    ICollegeFeeRefundableStudent
} from '@/types/fees/college/transaction/clgfeerefundable';
import { getCollegeBranches, getCollegeCourses, getCollegeSemesters } from './clgfeewaivedoff';

export { getCollegeCourses, getCollegeBranches, getCollegeSemesters };

export async function getCollegeFeeRefundableAllDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'amcsT_FirstName,fcR_RefundNo,fcR_ModeOfPayment,fcR_RefundAmount,fcR_Date');
    const url = `/CLGFeeRefundableFacade/getalldetails?${urlParams}`;
    return await api.get<ICollegeFeeRefundableAllDetailsResponse>('fees', url);
}

export async function getCollegeFeeRefundableStudentsByYear(asmaY_Id: number) {
    const url = '/CLGFeeRefundableFacade/getStudentdetailsByYear';
    return await api.get<any>('fees', url, { params: { asmaY_Id } });
}

export async function getCollegeFeeRefundableStudent(payload: {
    asmaY_Id: number;
    amcO_Id: number;
    amB_Id: number;
    amsE_Id: number;
}) {
    const url = '/CLGFeeRefundableFacade/GetStudent';
    return await api.post<{ studentlist?: ICollegeFeeRefundableStudent[] } | ICollegeFeeRefundableStudent[]>('fees', url, payload);
}

export async function getCollegeFeeRefundableStudentListByAmst(payload: {
    amcsT_Id: number;
    asmaY_Id: number;
    filterrefund: string;
}) {
    const url = '/CLGFeeRefundableFacade/GetStudentListByamst';
    return await api.post<any>('fees', url, payload);
}

export async function getCollegeFeeRefundableOnSelectGroup(payload: {
    asmaY_Id: number;
    amcsT_Id: number;
    filterrefund: string;
    multiplegroupF: number[];
}) {
    const url = '/CLGFeeRefundableFacade/onselectgroup';
    return await api.post<{ headlist?: ICollegeFeeRefundableHeadItem[] } | ICollegeFeeRefundableHeadItem[]>('fees', url, payload);
}

export async function saveCollegeFeeRefundable(data: ICollegeFeeRefundableSavePayload) {
    const url = '/CLGFeeRefundableFacade/savedetails';
    return await api.post<any>('fees', url, data);
}

export async function deleteCollegeFeeRefundable(fcR_Id: number) {
    const url = `/CLGFeeRefundableFacade/Deletedetails/${fcR_Id}`;
    return await api.delete<any>('fees', url);
}
